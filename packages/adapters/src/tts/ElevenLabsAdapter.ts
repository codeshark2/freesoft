import WebSocket from 'ws';
import { TTSAdapter } from '../base/TTSAdapter';
import { TTSConfig } from '../types';

/**
 * ElevenLabs TTS adapter implementation
 * Provides real-time text-to-speech using ElevenLabs streaming API
 */
export class ElevenLabsAdapter extends TTSAdapter {
  private ws: WebSocket | null = null;
  private audioChunkCount: number = 0;

  constructor(config: TTSConfig) {
    super(config);

    // Validate stability range
    if (config.stability !== undefined && (config.stability < 0 || config.stability > 1)) {
      throw new Error('TTSConfig.stability must be between 0.0 and 1.0');
    }

    // Validate similarity_boost range
    if (config.similarityBoost !== undefined && (config.similarityBoost < 0 || config.similarityBoost > 1)) {
      throw new Error('TTSConfig.similarityBoost must be between 0.0 and 1.0');
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const voiceId = this.currentVoiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice by default
      const modelId = this.config.model || 'eleven_turbo_v2';
      const url = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;

      this.logDebug('Connecting to ElevenLabs', { voiceId, modelId });

      this.ws = new WebSocket(url, {
        headers: {
          'xi-api-key': this.config.apiKey,
        },
      });

      this.ws.on('open', () => {
        this.logDebug('Connection opened');

        // Send initial configuration
        const config = {
          text: ' ',
          voice_settings: {
            stability: this.config.stability || 0.5,
            similarity_boost: this.config.similarityBoost || 0.75,
          },
          output_format: this.config.outputFormat || 'pcm_16000',
          ...(this.config.latencyOptimized && { latency_optimized: true }),
        };

        this.ws?.send(JSON.stringify(config));
        this.emitReady();
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.audio) {
            // Audio comes as base64
            const audioBuffer = Buffer.from(message.audio, 'base64');
            this.audioChunkCount++;

            const isFirst = this.audioChunkCount === 1;
            if (isFirst) {
              this.logDebug('First audio chunk received', {
                bytes: audioBuffer.length
              });
            }

            this.emitAudio(audioBuffer, isFirst);
          }

          if (message.isFinal) {
            this.logDebug('Synthesis complete', {
              totalChunks: this.audioChunkCount
            });
            this.emitComplete();
            this.audioChunkCount = 0;
          }

          if (message.error) {
            // Provide user-friendly error messages
            let errorMsg = message.error;
            if (message.error.includes('quota_exceeded')) {
              errorMsg = 'ElevenLabs quota exceeded. Please upgrade your plan or wait for quota reset.';
            } else if (message.error.includes('unauthorized') || message.error.includes('401')) {
              errorMsg = 'ElevenLabs API key invalid. Please check your API key.';
            }

            this.emitError(errorMsg);
          }
        } catch (error) {
          // Might be binary data, ignore
        }
      });

      this.ws.on('error', (error) => {
        this.emitError(error);
        if (!this.isConnected) {
          reject(error);
        }
      });

      this.ws.on('close', () => {
        this.emitClose();
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('ElevenLabs connection timeout'));
        }
      }, 10000);
    });
  }

  async synthesize(text: string): Promise<void> {
    if (!this.isConnected || !this.ws) {
      this.logError('Cannot synthesize: not connected');
      throw new Error('ElevenLabs client not connected');
    }

    this.logDebug('Synthesizing text', {
      length: text.length,
      preview: text.substring(0, 50) + '...'
    });

    // Send text chunk
    this.ws.send(
      JSON.stringify({
        text: text,
        try_trigger_generation: true,
        ...(this.config.speed && { speed: this.config.speed }),
      })
    );

    // Send end-of-stream signal
    this.ws.send(JSON.stringify({ text: '' }));
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.audioChunkCount = 0;
    }
  }
}
