import { EventEmitter } from 'events';
import { ASRAdapter as IASRAdapter, ASRConfig, TranscriptEvent } from '../types';

/**
 * Abstract base class for ASR (Automatic Speech Recognition) adapters
 * Provides common functionality for speech-to-text providers
 */
export abstract class ASRAdapter extends EventEmitter implements IASRAdapter {
  protected config: ASRConfig;
  protected isConnected: boolean = false;

  constructor(config: ASRConfig) {
    super();
    this.config = config;
  }

  // Abstract methods that must be implemented by concrete adapters
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sendAudio(audioData: Buffer): void | Promise<void>;

  // Common functionality

  setConfig(config: Partial<ASRConfig>): void {
    this.config = { ...this.config, ...config };
    this.logDebug('Config updated', config);
  }

  isReady(): boolean {
    return this.isConnected;
  }

  // Helper methods for consistent event emission

  protected emitTranscript(event: Omit<TranscriptEvent, 'timestamp'>): void {
    const fullEvent: TranscriptEvent = {
      ...event,
      timestamp: Date.now(),
    };
    this.emit('transcript', fullEvent);
  }

  protected emitReady(): void {
    this.isConnected = true;
    this.emit('ready');
    this.logDebug('ASR provider ready');
  }

  protected emitUtteranceEnd(): void {
    this.emit('utterance_end');
  }

  protected emitClose(): void {
    this.isConnected = false;
    this.emit('close');
    this.logDebug('ASR provider closed');
  }

  protected emitError(error: Error | string): void {
    const err = typeof error === 'string' ? new Error(error) : error;
    this.emit('error', err);
    this.logError('ASR error', err);
  }

  // Logging helpers

  protected logDebug(message: string, data?: any): void {
    // No-op
  }

  protected logError(message: string, error?: any): void {
    // No-op
  }
}
