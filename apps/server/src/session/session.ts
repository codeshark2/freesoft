import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import OpenAI from 'openai';
import {
  ClientMessage,
  ServerMessage,
  StartSessionMessage,
  AudioChunkMessage,
} from '@voice-ai-tester/shared';
import { EventLogger } from '../events/logger';
import { MetricsCalculator } from '../metrics/calculator';

const MAX_SESSION_DURATION = 60 * 1000; // 60 seconds

/**
 * Individual session handling voice pipeline for one WebSocket connection
 */
export class Session extends EventEmitter {
  private id: string;
  private ws: WebSocket;
  private eventLogger: EventLogger;
  private deepgramClient: any;
  private deepgramLive: any;
  private openaiClient!: OpenAI;
  private elevenLabsWs: WebSocket | null = null;
  private startTime: number = 0;
  private sessionTimer: NodeJS.Timeout | null = null;
  private isActive = false;
  private apiKeys: any;
  private systemPrompt: string = '';
  private currentTranscript: string = '';
  private config: any = {};
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  constructor(ws: WebSocket) {
    super();
    this.id = uuidv4();
    this.ws = ws;
    this.eventLogger = new EventLogger(this.id);
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners(): void {
    this.ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        await this.handleClientMessage(message);
      } catch (error) {
        console.error(`[Session ${this.id}] Message parse error:`, error);
        this.sendError('Invalid message format');
      }
    });

    this.ws.on('close', () => {
      this.cleanup('user_requested');
    });

    this.ws.on('error', (error) => {
      console.error(`[Session ${this.id}] WebSocket error:`, error);
      this.cleanup('error');
    });
  }

  private async handleClientMessage(message: ClientMessage): Promise<void> {
    switch (message.type) {
      case 'start_session':
        await this.handleStartSession(message);
        break;

      case 'audio_chunk':
        await this.handleAudioChunk(message);
        break;

      case 'end_session':
        this.cleanup('user_requested');
        break;
    }
  }

  private async handleStartSession(message: StartSessionMessage): Promise<void> {
    if (this.isActive) {
      this.sendError('Session already active');
      return;
    }

    try {
      this.isActive = true;
      this.startTime = Date.now();

      // Map new API key structure to old structure for backward compatibility
      const rawApiKeys = message.payload.apiKeys;
      this.apiKeys = {
        deepgram: rawApiKeys.stt || rawApiKeys.deepgram,
        openai: rawApiKeys.llm || rawApiKeys.openai,
        elevenlabs: rawApiKeys.tts || rawApiKeys.elevenlabs,
      };

      this.systemPrompt = message.payload.systemPrompt;
      this.config = message.payload.config || {};

      // Log session start
      this.eventLogger.log({
        type: 'session_start',
        timestamp: this.startTime,
        data: {},
      });

      // Initialize Deepgram with 48kHz to match browser's native sample rate
      console.log('[Server] Initializing Deepgram client...');
      this.deepgramClient = createClient(this.apiKeys.deepgram);
      this.deepgramLive = this.deepgramClient.listen.live({
        model: 'nova-2',
        language: 'en-US',
        encoding: 'linear16',
        sample_rate: 48000,  // Match browser's native sample rate
        channels: 1,
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
      });

      // Set up Deepgram event listeners
      this.deepgramLive.on(LiveTranscriptionEvents.Open, () => {
        console.log('[Server] Deepgram connection opened successfully');
      });

      this.deepgramLive.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const confidence = data.channel?.alternatives?.[0]?.confidence;
        console.log('[Server] Deepgram transcript received:', {
          text: transcript || '(empty)',
          isFinal: data.is_final,
          confidence,
          hasAlternatives: !!data.channel?.alternatives?.length,
        });
        if (transcript && transcript.trim()) {
          const isFinal = data.is_final;
          const timestamp = Date.now();

          // Log event for metrics
          if (isFinal) {
            this.eventLogger.log({
              type: 'asr_final',
              timestamp,
              data: {
                transcript,
                speechEndTime: timestamp,
              },
            });
          }

          console.log('[Server] Sending transcript to client:', transcript);
          this.send({
            type: isFinal ? 'transcript_final' : 'transcript_partial',
            payload: { text: transcript, isFinal },
            timestamp,
          });

          if (isFinal) {
            console.log('[Server] Final transcript received, triggering LLM request');
            this.currentTranscript = transcript;
            this.handleLLMRequest(transcript);
          }
        }
      });

      this.deepgramLive.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram error:', error);
        this.sendError('Speech recognition error');
      });

      // Initialize OpenAI
      this.openaiClient = new OpenAI({
        apiKey: this.apiKeys.openai,
      });

      // Send session started
      this.send({
        type: 'session_started',
        payload: {
          sessionId: this.id,
          maxDuration: MAX_SESSION_DURATION / 1000,
        },
        timestamp: Date.now(),
      });

      // Set session timeout
      this.sessionTimer = setTimeout(() => {
        this.cleanup('timeout');
      }, MAX_SESSION_DURATION);

    } catch (error: any) {
      console.error('Session start error:', error);
      this.sendError(error.message || 'Failed to start session');
      this.cleanup('error');
    }
  }

  private audioChunkCount = 0;

  private async handleAudioChunk(message: AudioChunkMessage): Promise<void> {
    if (!this.isActive || !this.deepgramLive) {
      console.log('[Server] Skipping audio chunk - isActive:', this.isActive, 'deepgramLive:', !!this.deepgramLive);
      return;
    }

    try {
      const timestamp = Date.now();

      // Log event for metrics
      this.eventLogger.log({
        type: 'audio_chunk_received',
        timestamp,
        data: {},
      });

      // Decode base64 audio and send to Deepgram
      const audioBuffer = Buffer.from(message.payload.audio.toString(), 'base64');
      this.deepgramLive.send(audioBuffer);

      this.audioChunkCount++;
      if (this.audioChunkCount % 100 === 0) {
        console.log(`[Server] Sent ${this.audioChunkCount} audio chunks to Deepgram (buffer size: ${audioBuffer.length} bytes)`);
      }

      // Log first chunk details for debugging
      if (this.audioChunkCount === 1) {
        console.log('[Server] First audio chunk:', {
          bufferLength: audioBuffer.length,
          base64Length: message.payload.audio.toString().length,
          firstBytes: audioBuffer.slice(0, 10),
        });
      }
    } catch (error) {
      console.error('[Audio] Chunk processing error:', error);
    }
  }

  private async handleLLMRequest(userMessage: string): Promise<void> {
    try {
      const llmStartTime = Date.now();

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Log LLM start
      this.eventLogger.log({
        type: 'llm_start',
        timestamp: llmStartTime,
        data: { userMessage },
      });

      // Build messages with conversation history
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory,
      ];

      console.log('[Server] Sending to LLM with', this.conversationHistory.length, 'messages in history');

      const stream = await this.openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages,
        stream: true,
      });

      let fullResponse = '';
      let isFirstToken = true;
      let tokensOutput = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          const tokenTimestamp = Date.now();
          fullResponse += content;
          tokensOutput++;

          // Log first token
          if (isFirstToken) {
            this.eventLogger.log({
              type: 'llm_token',
              timestamp: tokenTimestamp,
              data: { isFirst: true },
            });
            isFirstToken = false;
          }

          this.send({
            type: 'llm_token',
            payload: { token: content, isComplete: false },
            timestamp: tokenTimestamp,
          });
        }
      }

      const llmCompleteTime = Date.now();

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
      });

      // Log LLM completion
      this.eventLogger.log({
        type: 'llm_complete',
        timestamp: llmCompleteTime,
        data: {
          tokensInput: userMessage.split(/\s+/).length, // Rough estimate
          tokensOutput,
          response: fullResponse,
        },
      });

      // Send completion
      this.send({
        type: 'llm_token',
        payload: { token: '', isComplete: true },
        timestamp: llmCompleteTime,
      });

      console.log('[Server] LLM complete, generating TTS for:', fullResponse.substring(0, 50) + '...');

      // Generate TTS for the response
      await this.handleTTSRequest(fullResponse);

    } catch (error: any) {
      console.error('LLM error:', error);
      this.sendError('AI response error');
    }
  }

  private async handleTTSRequest(text: string): Promise<void> {
    try {
      const ttsStartTime = Date.now();

      // Log TTS start
      this.eventLogger.log({
        type: 'tts_start',
        timestamp: ttsStartTime,
        data: { characterCount: text.length },
      });

      const ttsProvider = this.config.ttsProvider || 'elevenlabs';

      if (ttsProvider === 'elevenlabs') {
        await this.handleElevenLabsTTS(text);
      } else {
        await this.handleOpenAITTS(text);
      }
    } catch (error: any) {
      console.error('TTS error:', error);
      this.sendError('Voice synthesis error');
    }
  }

  private async handleElevenLabsTTS(text: string): Promise<void> {
    const voiceId = this.config.ttsVoice || '21m00Tcm4TlvDq8ikWAM';
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=eleven_turbo_v2`;
    let isFirstChunk = true;

    this.elevenLabsWs = new WebSocket(wsUrl, {
      headers: {
        'xi-api-key': this.apiKeys.elevenlabs,
      },
    });

    this.elevenLabsWs.on('open', () => {
      this.elevenLabsWs?.send(JSON.stringify({
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }));
    });

    this.elevenLabsWs.on('message', (data: any) => {
      const timestamp = Date.now();

      // Log first audio chunk for metrics
      if (isFirstChunk) {
        this.eventLogger.log({
          type: 'tts_audio_chunk',
          timestamp,
          data: { isFirst: true },
        });
        isFirstChunk = false;
      }

      try {
        const response = JSON.parse(data.toString());
        if (response.audio) {
          this.send({
            type: 'tts_audio',
            payload: { audio: response.audio },
            timestamp,
          });
        }
      } catch (error) {
        // Binary audio data
        this.send({
          type: 'tts_audio',
          payload: { audio: data.toString('base64') },
          timestamp,
        });
      }
    });

    this.elevenLabsWs.on('error', (error) => {
      console.error('ElevenLabs WS error:', error);
    });
  }

  private async handleOpenAITTS(text: string): Promise<void> {
    const response = await this.openaiClient.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });

    const timestamp = Date.now();

    // Log TTS audio chunk for metrics
    this.eventLogger.log({
      type: 'tts_audio_chunk',
      timestamp,
      data: { isFirst: true },
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    this.send({
      type: 'tts_audio',
      payload: { audio: buffer.toString('base64') },
      timestamp,
    });
  }

  private send(message: ServerMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private sendError(message: string): void {
    this.send({
      type: 'error',
      payload: { message },
      timestamp: Date.now(),
    });
  }

  private cleanup(reason: string): void {
    this.isActive = false;

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.deepgramLive) {
      this.deepgramLive.finish();
      this.deepgramLive = null;
    }

    if (this.elevenLabsWs) {
      this.elevenLabsWs.close();
      this.elevenLabsWs = null;
    }

    // Log session end
    const endTime = Date.now();
    this.eventLogger.log({
      type: 'session_end',
      timestamp: endTime,
      data: {
        duration: endTime - this.startTime,
      },
    });

    // Calculate and send metrics
    const eventLog = this.eventLogger.getEventLog();
    const metrics = MetricsCalculator.calculate(eventLog);
    this.send({
      type: 'session_ended',
      payload: {
        metrics,
        reason: reason as 'user_requested' | 'timeout' | 'error'
      },
      timestamp: Date.now(),
    });

    this.emit('cleanup');
  }

  getId(): string {
    return this.id;
  }

  isSessionActive(): boolean {
    return this.isActive;
  }
}
