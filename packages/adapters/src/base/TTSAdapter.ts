import { EventEmitter } from 'events';
import { TTSAdapter as ITTSAdapter, TTSConfig, AudioEvent } from '../types';

/**
 * Abstract base class for TTS (Text-to-Speech) adapters
 * Provides common functionality for speech synthesis providers
 */
export abstract class TTSAdapter extends EventEmitter implements ITTSAdapter {
  protected config: TTSConfig;
  protected isConnected: boolean = false;
  protected currentVoiceId?: string;

  constructor(config: TTSConfig) {
    super();
    this.config = config;
    this.currentVoiceId = config.voiceId;
  }

  // Abstract methods that must be implemented by concrete adapters
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract synthesize(text: string): Promise<void>;

  // Common functionality

  setConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.voiceId) {
      this.currentVoiceId = config.voiceId;
    }
    this.logDebug('Config updated', config);
  }

  setVoice(voiceId: string): void {
    this.currentVoiceId = voiceId;
    this.config.voiceId = voiceId;
    this.logDebug('Voice changed', { voiceId });
  }

  isReady(): boolean {
    return this.isConnected;
  }

  // Helper methods for consistent event emission

  protected emitAudio(audioChunk: Buffer, isFirst: boolean = false): void {
    const event: AudioEvent = {
      audioChunk,
      isFirst,
      timestamp: Date.now(),
    };
    this.emit('audio', event);
  }

  protected emitReady(): void {
    this.isConnected = true;
    this.emit('ready');
    this.logDebug('TTS provider ready');
  }

  protected emitComplete(): void {
    this.emit('complete');
    this.logDebug('TTS synthesis complete');
  }

  protected emitClose(): void {
    this.isConnected = false;
    this.emit('close');
    this.logDebug('TTS provider closed');
  }

  protected emitError(error: Error | string): void {
    const err = typeof error === 'string' ? new Error(error) : error;
    this.emit('error', err);
    this.logError('TTS error', err);
  }

  // Logging helpers

  protected logDebug(message: string, data?: any): void {
    // No-op
  }

  protected logError(message: string, error?: any): void {
    // No-op
  }
}
