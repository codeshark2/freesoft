// Deepgram WebSocket Streaming with built-in VAD

export interface DeepgramConfig {
  apiKey: string;
  model?: string;
  language?: string;
  endpointing?: number; // ms of silence to trigger speech_final
  utteranceEndMs?: number; // backup end detection
}

export interface DeepgramCallbacks {
  onOpen?: () => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onUtteranceEnd?: (transcript: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export class DeepgramStreaming {
  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  private config: DeepgramConfig;
  private callbacks: DeepgramCallbacks = {};
  private currentTranscript = '';
  private startTime = 0;

  constructor(config: DeepgramConfig) {
    this.config = config;
  }

  async start(callbacks: DeepgramCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.currentTranscript = '';
    this.startTime = performance.now();

    // Build WebSocket URL with query params
    const params = new URLSearchParams({
      model: this.config.model || 'nova-2',
      language: this.config.language || 'en-US',
      endpointing: String(this.config.endpointing || 300),
      utterance_end_ms: String(this.config.utteranceEndMs || 1000),
      interim_results: 'true',
      vad_events: 'true',
      smart_format: 'true',
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
    });

    // Connect to Deepgram WebSocket
    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    this.ws = new WebSocket(wsUrl, ['token', this.config.apiKey]);

    this.ws.onopen = () => {
      this.callbacks.onOpen?.();
      this.startMicrophoneCapture();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = (event) => {
      this.callbacks.onError?.(new Error('WebSocket error'));
    };

    this.ws.onclose = () => {
      this.callbacks.onClose?.();
    };
  }

  private async startMicrophoneCapture(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use ScriptProcessor to get raw PCM data
      // Note: ScriptProcessorNode is deprecated but AudioWorklet requires more setup
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (event) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const inputData = event.inputBuffer.getChannelData(0);
          const pcmData = this.float32ToInt16(inputData);
          this.ws.send(pcmData.buffer);
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      this.callbacks.onError?.(error as Error);
    }
  }

  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      // Handle UtteranceEnd event
      if (message.type === 'UtteranceEnd') {
        if (this.currentTranscript.trim()) {
          this.callbacks.onUtteranceEnd?.(this.currentTranscript.trim());
          this.currentTranscript = '';
        }
        return;
      }

      // Handle transcript results
      if (message.channel?.alternatives?.[0]) {
        const alt = message.channel.alternatives[0];
        const transcript = alt.transcript || '';
        const isFinal = message.is_final || false;
        const speechFinal = message.speech_final || false;

        if (transcript) {
          if (isFinal) {
            // Accumulate final transcripts
            this.currentTranscript += (this.currentTranscript ? ' ' : '') + transcript;
          }

          this.callbacks.onTranscript?.(
            isFinal ? this.currentTranscript : this.currentTranscript + ' ' + transcript,
            isFinal
          );

          // If speech_final, emit the complete utterance
          if (speechFinal && this.currentTranscript.trim()) {
            this.callbacks.onUtteranceEnd?.(this.currentTranscript.trim());
            this.currentTranscript = '';
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse Deepgram message:', error);
    }
  }

  getMetrics(): { ttfb: number; total: number } {
    return {
      ttfb: performance.now() - this.startTime,
      total: performance.now() - this.startTime,
    };
  }

  stop(): void {
    // Stop audio processing
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close WebSocket
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        // Send close message to Deepgram
        this.ws.send(JSON.stringify({ type: 'CloseStream' }));
      }
      this.ws.close();
      this.ws = null;
    }

    this.currentTranscript = '';
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
