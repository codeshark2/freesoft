// Silero VAD wrapper using @ricky0123/vad-web
// ML-based Voice Activity Detection that works universally for all ASR vendors

import { MicVAD, RealTimeVADOptions } from '@ricky0123/vad-web';

export interface SileroVADCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob: Blob) => void;
  onVADMisfire?: () => void;
  onError?: (error: Error) => void;
}

export interface SileroVADOptions {
  positiveSpeechThreshold?: number; // 0-1, default 0.5
  negativeSpeechThreshold?: number; // 0-1, default 0.35
  minSpeechFrames?: number; // Min frames to consider speech, default 3
  redemptionFrames?: number; // Frames to wait before ending speech, default 8
  preSpeechPadFrames?: number; // Frames to include before speech, default 1
}

export class SileroVAD {
  private vad: MicVAD | null = null;
  private callbacks: SileroVADCallbacks = {};
  private options: SileroVADOptions;
  private isActive = false;

  constructor(options: SileroVADOptions = {}) {
    this.options = options;
  }

  async start(callbacks: SileroVADCallbacks): Promise<void> {
    this.callbacks = callbacks;

    try {
      const vadOptions: Partial<RealTimeVADOptions> = {
        positiveSpeechThreshold: this.options.positiveSpeechThreshold ?? 0.5,
        negativeSpeechThreshold: this.options.negativeSpeechThreshold ?? 0.35,
        minSpeechFrames: this.options.minSpeechFrames ?? 3,
        redemptionFrames: this.options.redemptionFrames ?? 8,
        preSpeechPadFrames: this.options.preSpeechPadFrames ?? 1,

        onSpeechStart: () => {
          this.callbacks.onSpeechStart?.();
        },

        onSpeechEnd: (audio: Float32Array) => {
          // Convert Float32Array to WAV blob
          const wavBlob = this.float32ToWavBlob(audio, 16000);
          this.callbacks.onSpeechEnd?.(wavBlob);
        },

        onVADMisfire: () => {
          this.callbacks.onVADMisfire?.();
        },
      };

      this.vad = await MicVAD.new(vadOptions);
      this.vad.start();
      this.isActive = true;
    } catch (error) {
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  private float32ToWavBlob(float32Array: Float32Array, sampleRate: number): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;

    // Convert Float32 to Int16
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const dataSize = int16Array.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < int16Array.length; i++) {
      view.setInt16(offset + i * 2, int16Array[i], true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  pause(): void {
    this.vad?.pause();
  }

  resume(): void {
    this.vad?.start();
  }

  stop(): void {
    this.vad?.pause();
    this.vad?.destroy();
    this.vad = null;
    this.isActive = false;
  }

  get active(): boolean {
    return this.isActive;
  }
}
