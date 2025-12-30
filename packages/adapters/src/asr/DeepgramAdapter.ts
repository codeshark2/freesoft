import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { ASRAdapter } from '../base/ASRAdapter';
import { ASRConfig } from '../types';

/**
 * Deepgram ASR adapter implementation
 * Provides real-time speech-to-text using Deepgram's streaming API
 */
export class DeepgramAdapter extends ASRAdapter {
  private connection: any;
  private keepaliveInterval: NodeJS.Timeout | null = null;

  constructor(config: ASRConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const deepgram = createClient(this.config.apiKey);

        this.connection = deepgram.listen.live({
          model: this.config.model || 'nova-2',
          language: this.config.language || 'en-US',
          encoding: 'linear16',        // 16-bit PCM audio format
          sample_rate: 16000,           // Match AudioContext sample rate
          channels: 1,                  // Mono audio
          smart_format: true,
          endpointing: this.config.endpointing || 300,
          interim_results: this.config.interimResults !== false,
          utterance_end_ms: 1000,
          vad_events: true,
        });

        this.connection.on(LiveTranscriptionEvents.Open, () => {
          this.logDebug('Connection opened');

          // Send keepalive every 5 seconds to prevent connection from closing
          this.keepaliveInterval = setInterval(() => {
            if (this.isConnected && this.connection) {
              try {
                this.connection.keepAlive();
              } catch (err) {
                this.logError('Keepalive error', err);
              }
            }
          }, 5000);

          this.emitReady();
          resolve();
        });

        this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
          const transcript = data.channel?.alternatives?.[0];
          if (!transcript) return;

          const text = transcript.transcript;
          const isFinal = data.is_final || false;
          const confidence = transcript.confidence;

          if (text.trim().length > 0) {
            this.emitTranscript({ text, isFinal, confidence });
          }
        });

        this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
          this.emitUtteranceEnd();
        });

        this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
          this.emitError(error);
          if (!this.isConnected) {
            reject(error);
          }
        });

        this.connection.on(LiveTranscriptionEvents.Close, () => {
          this.emitClose();
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Deepgram connection timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  sendAudio(audioData: Buffer): void {
    if (!this.isConnected || !this.connection) {
      const error = new Error('Cannot send audio: Deepgram not connected');
      this.logError(error.message);
      this.emitError(error);
      throw error; // Propagate error to caller
    }

    try {
      this.connection.send(audioData);
    } catch (error) {
      this.emitError(error as Error);
      throw error; // Re-throw so caller knows send failed
    }
  }

  async disconnect(): Promise<void> {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
      this.keepaliveInterval = null;
    }

    if (this.connection) {
      this.connection.finish();
      this.isConnected = false;
    }
  }
}
