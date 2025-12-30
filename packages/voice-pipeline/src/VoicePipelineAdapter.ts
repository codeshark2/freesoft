import { EventEmitter } from 'events';
import { ASRAdapter, LLMAdapter, TTSAdapter } from '@freesoft/adapters';

export interface VoicePipelineConfig {
  systemPrompt?: string;
}

export interface VoicePipelineEvents {
  ready: () => void;
  transcript_partial: (text: string) => void;
  transcript_final: (text: string) => void;
  llm_token: (data: { token: string; isComplete: boolean }) => void;
  tts_audio: (audioBuffer: Buffer) => void;
  error: (data: { provider: string; error: Error }) => void;
}

/**
 * High-level voice pipeline adapter that orchestrates ASR → LLM → TTS flow
 * Wraps individual adapters and provides a simple API for voice interactions
 */
export class VoicePipelineAdapter extends EventEmitter {
  private asr: ASRAdapter;
  private llm: LLMAdapter;
  private tts: TTSAdapter;
  private isProcessing = false;
  private currentTranscript = '';
  private isFirstTTSChunk = true;

  constructor(
    asr: ASRAdapter,
    llm: LLMAdapter,
    tts: TTSAdapter,
    config?: VoicePipelineConfig
  ) {
    super();
    this.asr = asr;
    this.llm = llm;
    this.tts = tts;

    if (config?.systemPrompt) {
      this.llm.setSystemPrompt(config.systemPrompt);
    }

    this.setupListeners();
  }

  private setupListeners(): void {
    // ASR events
    this.asr.on('transcript', (result: any) => {
      if (result.isFinal) {
        this.emit('transcript_final', result.text);
        this.handleFinalTranscript(result.text);
      } else {
        this.emit('transcript_partial', result.text);
      }
    });

    this.asr.on('error', (error: Error) => {
      this.emit('error', { provider: 'asr', error });
    });

    // LLM events
    this.llm.on('token', ({ token, isFirst }: any) => {
      this.emit('llm_token', { token, isComplete: false });
      this.currentTranscript += token;
    });

    this.llm.on('error', (error: Error) => {
      this.emit('error', { provider: 'llm', error });
    });

    // TTS events
    this.tts.on('audio', ({ audioChunk, isFirst }: any) => {
      this.emit('tts_audio', audioChunk);
      if (isFirst) {
        this.isFirstTTSChunk = false;
      }
    });

    this.tts.on('error', (error: Error) => {
      this.emit('error', { provider: 'tts', error });
    });
  }

  /**
   * Initialize all adapters and connect to providers
   */
  async connect(): Promise<void> {
    await Promise.all([this.asr.connect(), this.tts.connect()]);
    this.emit('ready');
  }

  /**
   * Send audio data to the ASR provider
   * @param audioData Audio buffer to transcribe
   */
  sendAudio(audioData: Buffer): void {
    try {
      this.asr.sendAudio(audioData);
    } catch (error) {
      // Emit error event for pipeline-level error handling
      this.emit('error', { provider: 'asr', error });
      // Don't re-throw - let session handle via error event
    }
  }

  /**
   * Set or update the system prompt for the LLM
   * @param prompt System prompt text
   */
  setSystemPrompt(prompt: string): void {
    this.llm.setSystemPrompt(prompt);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.llm.clearHistory();
  }

  /**
   * Handle final transcript and trigger LLM → TTS pipeline
   */
  private async handleFinalTranscript(text: string): Promise<void> {
    if (this.isProcessing || !text.trim()) {
      return;
    }

    this.isProcessing = true;
    this.currentTranscript = '';
    this.isFirstTTSChunk = true;

    try {
      // Generate LLM response
      const result = await this.llm.generateResponse(text);

      this.emit('llm_token', {
        token: '',
        isComplete: true,
      });

      // Reconnect TTS if needed
      if (!this.tts.isReady()) {
        await this.tts.connect();
      }

      // Synthesize speech
      await this.tts.synthesize(result.fullText);
    } catch (error) {
      this.emit('error', { provider: 'pipeline', error: error as Error });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Disconnect all adapters and cleanup
   */
  async disconnect(): Promise<void> {
    await Promise.all([this.asr.disconnect(), this.tts.disconnect()]);
    this.llm.clearHistory();
  }

  /**
   * Check if the pipeline is ready for use
   */
  isReady(): boolean {
    return this.asr.isReady() && this.llm.isReady() && this.tts.isReady();
  }

  /**
   * Get current LLM conversation history
   */
  getHistory(): any[] {
    return this.llm.getHistory();
  }
}
