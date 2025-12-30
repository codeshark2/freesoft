import OpenAI from 'openai';
import { TTSAdapter } from '../base/TTSAdapter';
import { TTSConfig } from '../types';

/**
 * OpenAI TTS adapter implementation
 * Provides text-to-speech using OpenAI's /v1/audio/speech endpoint
 * Supports streaming with opus, pcm, mp3, and other formats
 */
export class OpenAITTSAdapter extends TTSAdapter {
  private client: OpenAI;

  constructor(config: TTSConfig) {
    super(config);

    // Validate stability range (OpenAI doesn't use this, but keep for consistency)
    if (config.stability !== undefined && (config.stability < 0 || config.stability > 1)) {
      throw new Error('TTSConfig.stability must be between 0.0 and 1.0');
    }

    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async connect(): Promise<void> {
    // OpenAI TTS is stateless HTTP, no persistent connection needed
    this.logDebug('OpenAI TTS ready (stateless HTTP)');
    this.emitReady();
  }

  async disconnect(): Promise<void> {
    // No persistent connection to close
    this.emitClose();
    this.logDebug('OpenAI TTS disconnected');
  }

  async synthesize(text: string): Promise<void> {
    if (!this.isConnected) {
      this.logError('Cannot synthesize: not connected');
      throw new Error('OpenAI TTS not ready');
    }

    try {
      const voice = this.getVoiceName(this.currentVoiceId);
      const model = this.config.model || 'tts-1';
      const speed = this.config.speed || 1.0;

      // Determine response format
      // OpenAI supports: mp3, opus, aac, flac, wav, pcm
      let responseFormat: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm' = 'opus';

      if (this.config.outputFormat) {
        // Map our format names to OpenAI format names
        if (this.config.outputFormat.startsWith('pcm_')) {
          responseFormat = 'pcm';
        } else if (this.config.outputFormat.startsWith('mp3_')) {
          responseFormat = 'mp3';
        }
      }

      this.logDebug('Synthesizing text', {
        length: text.length,
        preview: text.substring(0, 50) + '...',
        model,
        voice,
        speed,
        responseFormat,
      });

      // Create TTS request with streaming
      const response = await this.client.audio.speech.create({
        model,
        voice,
        input: text,
        response_format: responseFormat,
        speed,
      });

      // Stream the response
      let isFirst = true;
      const stream = response.body;

      if (!stream) {
        throw new Error('No response body from OpenAI TTS');
      }

      // Convert Web ReadableStream to Node.js stream
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            this.logDebug('TTS streaming complete');
            this.emitComplete();
            break;
          }

          if (value) {
            // Convert Uint8Array to Buffer
            const audioBuffer = Buffer.from(value);

            if (isFirst) {
              this.logDebug('First audio chunk received', {
                bytes: audioBuffer.length,
              });
            }

            this.emitAudio(audioBuffer, isFirst);
            isFirst = false;
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      this.logError('TTS synthesis failed', error);

      // Provide user-friendly error messages
      let errorMsg = error.message || 'Unknown error';

      if (error.status === 401 || errorMsg.includes('unauthorized')) {
        errorMsg = 'OpenAI API key invalid. Please check your API key.';
      } else if (error.status === 429) {
        errorMsg = 'OpenAI rate limit exceeded. Please try again later.';
      } else if (error.status === 400 && errorMsg.includes('quota')) {
        errorMsg = 'OpenAI quota exceeded. Please upgrade your plan.';
      }

      this.emitError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Convert voice ID to OpenAI voice name
   * Maps common voice IDs to OpenAI's voice names
   */
  private getVoiceName(voiceId?: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

    if (voiceId && validVoices.includes(voiceId.toLowerCase())) {
      return voiceId.toLowerCase() as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    }

    // Default to 'alloy' (neutral voice)
    return 'alloy';
  }
}
