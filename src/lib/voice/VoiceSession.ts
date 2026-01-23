// Voice Session Orchestrator with Hybrid VAD
// - Deepgram: Uses native WebSocket streaming with built-in VAD
// - Other ASR vendors: Uses Silero ML-based VAD + REST API

import { DeepgramStreaming } from './DeepgramStreaming';
import { SileroVAD } from './SileroVAD';
import { transcribe, ASRConfig } from '../api/asr';
import { chat, LLMConfig, LLMResult, Message } from '../api/llm';
import { synthesize, playAudio, TTSConfig, TTSResult } from '../api/tts';

export interface TurnMetrics {
  asr: { ttfb: number; total: number };
  llm: { ttfb: number; total: number };
  tts: { ttfb: number; total: number };
  roundTrip: number;
}

export interface Turn {
  id: number;
  userText: string;
  assistantText: string;
  metrics: TurnMetrics;
  timestamp: number;
}

export interface SessionSummary {
  turns: Turn[];
  totalDuration: number;
  averageMetrics: {
    asr: { ttfb: number; total: number };
    llm: { ttfb: number; total: number };
    tts: { ttfb: number; total: number };
    roundTrip: number;
  };
}

export interface SessionConfig {
  asr: ASRConfig;
  llm: LLMConfig;
  tts: TTSConfig;
  maxDuration?: number; // Max session duration in ms (default 60000)
}

export interface SessionCallbacks {
  onStateChange?: (state: SessionState) => void;
  onTurnStart?: () => void;
  onTranscript?: (text: string, metrics: { ttfb: number; total: number }) => void;
  onInterimTranscript?: (text: string) => void;
  onResponse?: (text: string, metrics: LLMResult['metrics']) => void;
  onAudioStart?: (metrics: TTSResult['metrics']) => void;
  onTurnComplete?: (turn: Turn) => void;
  onTimeUpdate?: (remaining: number) => void;
  onSessionEnd?: (summary: SessionSummary) => void;
  onError?: (error: Error, stage: 'asr' | 'llm' | 'tts') => void;
}

export type SessionState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export class VoiceSession {
  private deepgram: DeepgramStreaming | null = null;
  private sileroVad: SileroVAD | null = null;
  private config: SessionConfig;
  private callbacks: SessionCallbacks = {};

  private state: SessionState = 'idle';
  private turns: Turn[] = [];
  private conversationHistory: Message[] = [];
  private turnCounter = 0;

  private sessionStart: number = 0;
  private maxDuration: number;
  private timerInterval: number | null = null;
  private isProcessing = false;
  private utteranceStartTime = 0;

  constructor(config: SessionConfig) {
    this.config = config;
    this.maxDuration = config.maxDuration ?? 60000;
  }

  private get useDeepgramStreaming(): boolean {
    return this.config.asr.vendorId === 'deepgram';
  }

  async start(callbacks: SessionCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.turns = [];
    this.conversationHistory = [];
    this.turnCounter = 0;
    this.sessionStart = Date.now();
    this.isProcessing = false;

    this.setState('listening');

    // Start session timer
    this.timerInterval = window.setInterval(() => {
      const elapsed = Date.now() - this.sessionStart;
      const remaining = Math.max(0, this.maxDuration - elapsed);
      this.callbacks.onTimeUpdate?.(remaining);

      if (remaining <= 0) {
        this.stop();
      }
    }, 100);

    // Choose VAD strategy based on ASR vendor
    if (this.useDeepgramStreaming) {
      await this.startDeepgramStreaming();
    } else {
      await this.startSileroVAD();
    }
  }

  private async startDeepgramStreaming(): Promise<void> {
    this.deepgram = new DeepgramStreaming({
      apiKey: this.config.asr.apiKey,
      model: this.config.asr.model || 'nova-2',
      language: this.config.asr.languageCode || 'en-US',
      endpointing: 500,
      utteranceEndMs: 1000,
    });

    await this.deepgram.start({
      onOpen: () => {
        this.utteranceStartTime = performance.now();
        this.callbacks.onTurnStart?.();
      },
      onTranscript: (transcript, isFinal) => {
        if (!this.isProcessing) {
          this.callbacks.onInterimTranscript?.(transcript);
        }
      },
      onUtteranceEnd: (transcript) => {
        if (!this.isProcessing && transcript.trim()) {
          const asrMetrics = {
            ttfb: performance.now() - this.utteranceStartTime,
            total: performance.now() - this.utteranceStartTime,
          };
          this.processTurn(transcript, asrMetrics);
        }
      },
      onError: (error) => {
        this.callbacks.onError?.(error, 'asr');
        this.setState('error');
      },
      onClose: () => {},
    });
  }

  private async startSileroVAD(): Promise<void> {
    this.sileroVad = new SileroVAD({
      positiveSpeechThreshold: 0.5,
      negativeSpeechThreshold: 0.35,
      redemptionFrames: 8, // ~250ms of silence to end speech
    });

    this.callbacks.onTurnStart?.();

    await this.sileroVad.start({
      onSpeechStart: () => {
        this.utteranceStartTime = performance.now();
      },
      onSpeechEnd: async (audioBlob) => {
        if (!this.isProcessing) {
          await this.processAudioWithASR(audioBlob);
        }
      },
      onVADMisfire: () => {
        // Speech was too short, ignore
      },
      onError: (error) => {
        this.callbacks.onError?.(error, 'asr');
        this.setState('error');
      },
    });
  }

  private async processAudioWithASR(audioBlob: Blob): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      this.setState('processing');

      // Pause VAD while processing
      this.sileroVad?.pause();

      const asrStartTime = performance.now();
      const asrResult = await transcribe(audioBlob, this.config.asr);

      if (!asrResult.transcript.trim()) {
        this.isProcessing = false;
        this.sileroVad?.resume();
        this.setState('listening');
        return;
      }

      await this.processTurn(asrResult.transcript, asrResult.metrics);

    } catch (error) {
      this.callbacks.onError?.(error as Error, 'asr');
      this.setState('error');
    }
  }

  private setState(state: SessionState): void {
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  private async processTurn(transcript: string, asrMetrics: { ttfb: number; total: number }): Promise<void> {
    const turnStart = performance.now();
    const turnId = ++this.turnCounter;

    let llmResult: LLMResult | null = null;
    let ttsResult: TTSResult | null = null;

    try {
      this.callbacks.onTranscript?.(transcript, asrMetrics);

      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: transcript,
      });

      // LLM Phase
      llmResult = await chat(this.conversationHistory, this.config.llm);
      this.callbacks.onResponse?.(llmResult.response, llmResult.metrics);

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: llmResult.response,
      });

      // TTS Phase
      this.setState('speaking');
      ttsResult = await synthesize(llmResult.response, this.config.tts);
      this.callbacks.onAudioStart?.(ttsResult.metrics);

      // Play audio
      await playAudio(ttsResult.audioBlob);

      // Record turn
      const roundTrip = performance.now() - turnStart;
      const turn: Turn = {
        id: turnId,
        userText: transcript,
        assistantText: llmResult.response,
        metrics: {
          asr: asrMetrics,
          llm: llmResult.metrics,
          tts: ttsResult.metrics,
          roundTrip,
        },
        timestamp: Date.now(),
      };

      this.turns.push(turn);
      this.callbacks.onTurnComplete?.(turn);

    } catch (error) {
      const stage = !llmResult ? 'llm' : 'tts';
      this.callbacks.onError?.(error as Error, stage);
      this.setState('error');
    } finally {
      this.isProcessing = false;

      // Resume listening
      if (this.state !== 'error') {
        if (this.useDeepgramStreaming && this.deepgram?.isConnected) {
          this.setState('listening');
          this.utteranceStartTime = performance.now();
        } else if (this.sileroVad?.active) {
          this.sileroVad.resume();
          this.setState('listening');
          this.utteranceStartTime = performance.now();
        }
      }
    }
  }

  stop(): void {
    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Stop VAD (whichever is active)
    this.deepgram?.stop();
    this.deepgram = null;

    this.sileroVad?.stop();
    this.sileroVad = null;

    // Calculate summary
    const summary = this.getSummary();
    this.callbacks.onSessionEnd?.(summary);

    this.setState('idle');
  }

  getSummary(): SessionSummary {
    const totalDuration = Date.now() - this.sessionStart;

    const avgMetrics = {
      asr: { ttfb: 0, total: 0 },
      llm: { ttfb: 0, total: 0 },
      tts: { ttfb: 0, total: 0 },
      roundTrip: 0,
    };

    if (this.turns.length > 0) {
      for (const turn of this.turns) {
        avgMetrics.asr.ttfb += turn.metrics.asr.ttfb;
        avgMetrics.asr.total += turn.metrics.asr.total;
        avgMetrics.llm.ttfb += turn.metrics.llm.ttfb;
        avgMetrics.llm.total += turn.metrics.llm.total;
        avgMetrics.tts.ttfb += turn.metrics.tts.ttfb;
        avgMetrics.tts.total += turn.metrics.tts.total;
        avgMetrics.roundTrip += turn.metrics.roundTrip;
      }

      const count = this.turns.length;
      avgMetrics.asr.ttfb /= count;
      avgMetrics.asr.total /= count;
      avgMetrics.llm.ttfb /= count;
      avgMetrics.llm.total /= count;
      avgMetrics.tts.ttfb /= count;
      avgMetrics.tts.total /= count;
      avgMetrics.roundTrip /= count;
    }

    return {
      turns: this.turns,
      totalDuration,
      averageMetrics: avgMetrics,
    };
  }

  getState(): SessionState {
    return this.state;
  }
}

// Re-export ASRConfig for backward compatibility
export type { ASRConfig } from '../api/asr';
