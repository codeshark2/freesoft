import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientMessage,
  ServerMessage,
  StartSessionMessage,
} from '@voice-ai-tester/shared';
import { EventLogger } from '../events/logger';
import { MetricsCalculator } from '../metrics/calculator';
import {
  VoicePipelineAdapter,
  createASRProvider,
  createLLMProvider,
  createTTSProvider,
} from '@freesoft/voice-pipeline';

const MAX_SESSION_DURATION = 60 * 1000; // 60 seconds

/**
 * Individual session handling voice pipeline for one WebSocket connection
 */
export class Session extends EventEmitter {
  private id: string;
  private ws: WebSocket;
  private eventLogger: EventLogger;
  private pipeline: VoicePipelineAdapter | null = null;
  private startTime: number = 0;
  private sessionTimer: NodeJS.Timeout | null = null;
  private isActive = false;

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
        this.sendError('Invalid message format');
      }
    });

    this.ws.on('close', () => {
      this.cleanup('user_requested');
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
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

      // Log session start
      this.eventLogger.log({
        type: 'session_start',
        timestamp: this.startTime,
        data: {
          systemPrompt: message.payload.systemPrompt,
          config: {
            llmModel: message.payload.config?.llmModel || 'gpt-4o',
            ttsVoice: message.payload.config?.ttsVoice || '21m00Tcm4TlvDq8ikWAM',
          },
        },
      });

      // Create provider adapters
      const asr = createASRProvider('deepgram', {
        apiKey: message.payload.apiKeys.deepgram,
      });

      const llm = createLLMProvider('openai', {
        apiKey: message.payload.apiKeys.openai,
        model: message.payload.config?.llmModel || 'gpt-4o',
      });

      // Determine TTS provider (default to openai-tts)
      const ttsProvider = message.payload.config?.ttsProvider || 'openai-tts';

      const tts = createTTSProvider(ttsProvider, {
        apiKey: ttsProvider === 'openai-tts'
          ? message.payload.apiKeys.openai
          : message.payload.apiKeys.elevenlabs!,
        voiceId: message.payload.config?.ttsVoice || (ttsProvider === 'openai-tts' ? 'alloy' : '21m00Tcm4TlvDq8ikWAM'),
      });

      // Create voice pipeline
      this.pipeline = new VoicePipelineAdapter(asr, llm, tts, {
        systemPrompt: message.payload.systemPrompt,
      });

      this.setupPipelineListeners();

      await this.pipeline.connect();

      await new Promise(resolve => setTimeout(resolve, 300));

      // Send session started confirmation
      this.sendMessage({
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
      let errorMessage = 'Failed to start session';

      // Provide more specific error messages
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        errorMessage = 'Authentication failed. Please check your API keys.';
      } else if (error.message?.includes('Deepgram')) {
        errorMessage = `Deepgram error: ${error.message}. Please verify your Deepgram API key.`;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your network and API keys.';
      } else {
        errorMessage = `Failed to start session: ${error.message}`;
      }

      this.sendError(errorMessage);
      this.cleanup('error');
    }
  }

  private setupPipelineListeners(): void {
    if (!this.pipeline) return;

    this.pipeline.on('transcript_partial', (text: string) => {
      this.sendMessage({
        type: 'transcript_partial',
        payload: { text, isFinal: false },
        timestamp: Date.now(),
      });
    });

    this.pipeline.on('transcript_final', (text: string) => {
      this.sendMessage({
        type: 'transcript_final',
        payload: { text, isFinal: true },
        timestamp: Date.now(),
      });
    });

    this.pipeline.on('llm_token', ({ token, isComplete }) => {
      this.sendMessage({
        type: 'llm_token',
        payload: { token, isComplete },
        timestamp: Date.now(),
      });
    });

    this.pipeline.on('tts_audio', (audioBuffer: Buffer) => {
      this.sendMessage({
        type: 'tts_audio',
        payload: {
          audio: audioBuffer.toString('base64'),
        },
        timestamp: Date.now(),
      });
    });

    this.pipeline.on('error', ({ provider, error }) => {
      console.error(`${provider} error:`, error.message);

      // Send user-friendly error message
      let userMessage = `${provider} error: ${error.message}`;

      // Special handling for quota errors
      if (error.message.includes('quota')) {
        userMessage = `⚠️ ElevenLabs quota exceeded. The session will continue but without audio playback. Please upgrade your ElevenLabs plan or use a new API key.`;
      }

      this.sendError(userMessage);
    });
  }

  private async handleAudioChunk(message: AudioChunkMessage): Promise<void> {
    if (!this.isActive || !this.pipeline) {
      return;
    }

    try {
      const audioBuffer = typeof message.payload.audio === 'string'
        ? Buffer.from(message.payload.audio, 'base64')
        : Buffer.from(message.payload.audio);

      this.pipeline.sendAudio(audioBuffer);
    } catch (error: any) {
      this.sendError(`Audio processing error: ${error.message}`);
    }
  }

  private async cleanup(reason: 'user_requested' | 'timeout' | 'error'): Promise<void> {
    if (!this.isActive) return;

    this.isActive = false;

    // Clear session timer
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    // Log session end
    const endTime = Date.now();
    this.eventLogger.log({
      type: 'session_end',
      timestamp: endTime,
      data: {
        reason,
        duration: endTime - this.startTime,
      },
    });

    // Clean up pipeline
    if (this.pipeline) {
      await this.pipeline.disconnect();
      this.pipeline = null;
    }

    // Calculate metrics
    const metrics = MetricsCalculator.calculate(this.eventLogger.getEventLog());

    // Send session ended message
    this.sendMessage({
      type: 'session_ended',
      payload: {
        reason,
        metrics,
      },
      timestamp: endTime,
    });

    // Close WebSocket
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.emit('ended');
  }

  private sendMessage(message: ServerMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private sendError(message: string): void {
    this.sendMessage({
      type: 'error',
      payload: { message },
      timestamp: Date.now(),
    });
  }

  getId(): string {
    return this.id;
  }
}

// Fix type import
import { AudioChunkMessage } from '@voice-ai-tester/shared';
