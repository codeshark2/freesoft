// Voice Activity Detection using Web Audio API

export interface VADOptions {
  silenceThreshold?: number;  // Volume threshold (0-1)
  silenceDuration?: number;   // Silence duration to trigger end (ms)
  minSpeechDuration?: number; // Minimum speech duration (ms)
}

export interface VADCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob: Blob) => void;
  onVolumeChange?: (volume: number) => void;
}

export class VAD {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private silenceThreshold: number;
  private silenceDuration: number;
  private minSpeechDuration: number;

  private isSpeaking = false;
  private silenceStart: number | null = null;
  private speechStart: number | null = null;
  private animationFrame: number | null = null;

  private callbacks: VADCallbacks = {};

  constructor(options: VADOptions = {}) {
    this.silenceThreshold = options.silenceThreshold ?? 0.05;
    this.silenceDuration = options.silenceDuration ?? 1500;
    this.minSpeechDuration = options.minSpeechDuration ?? 300;
  }

  async start(callbacks: VADCallbacks): Promise<void> {
    this.callbacks = callbacks;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      // Setup MediaRecorder for capturing audio
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: this.getSupportedMimeType(),
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioChunks = [];

          // Only emit if speech was long enough
          if (this.speechStart && Date.now() - this.speechStart >= this.minSpeechDuration) {
            this.callbacks.onSpeechEnd?.(audioBlob);
          }
        }
        this.speechStart = null;
      };

      this.detectVoiceActivity();
    } catch (error) {
      throw new Error(`Failed to access microphone: ${error}`);
    }
  }

  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm';
  }

  private detectVoiceActivity(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate RMS volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += (dataArray[i] / 255) ** 2;
      }
      const volume = Math.sqrt(sum / dataArray.length);

      this.callbacks.onVolumeChange?.(volume);

      const now = Date.now();

      if (volume > this.silenceThreshold) {
        // Voice detected
        this.silenceStart = null;

        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.speechStart = now;
          this.audioChunks = [];
          this.mediaRecorder?.start(100); // Collect data every 100ms
          this.callbacks.onSpeechStart?.();
        }
      } else {
        // Silence detected
        if (this.isSpeaking) {
          if (!this.silenceStart) {
            this.silenceStart = now;
          } else if (now - this.silenceStart >= this.silenceDuration) {
            // Silence duration exceeded, end speech
            this.isSpeaking = false;
            this.silenceStart = null;
            this.mediaRecorder?.stop();
          }
        }
      }

      this.animationFrame = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isSpeaking = false;
    this.silenceStart = null;
    this.speechStart = null;
    this.audioChunks = [];
  }

  get isActive(): boolean {
    return this.audioContext !== null;
  }

  get speaking(): boolean {
    return this.isSpeaking;
  }
}
