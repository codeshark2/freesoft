/**
 * Adapter type interfaces for voice AI providers
 * Defines contracts for ASR, LLM, and TTS adapters
 */

import { EventEmitter } from 'events';

// ============================================================================
// Common Types
// ============================================================================

export type ProviderType = 'deepgram' | 'whisper' | 'openai' | 'anthropic' | 'elevenlabs' | 'google' | 'azure';

export interface BaseConfig {
  apiKey: string;
  [key: string]: any; // Provider-specific options
}

// ============================================================================
// ASR (Automatic Speech Recognition) Adapter
// ============================================================================

export interface ASRConfig extends BaseConfig {
  model?: string;
  language?: string;
  endpointing?: number;
  interimResults?: boolean;
}

export interface TranscriptEvent {
  text: string;
  isFinal: boolean;
  confidence?: number;
  timestamp: number;
}

export interface ASRAdapter extends EventEmitter {
  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Data ingestion
  sendAudio(audioData: Buffer): void | Promise<void>;

  // Configuration
  setConfig(config: Partial<ASRConfig>): void;

  // State query
  isReady(): boolean;

  // Events emitted:
  // - 'ready': Connection established
  // - 'transcript': TranscriptEvent with text and metadata
  // - 'utterance_end': User stopped speaking
  // - 'error': Error occurred
  // - 'close': Connection closed
}

// ============================================================================
// LLM (Language Model) Adapter
// ============================================================================

export interface LLMConfig extends BaseConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionResult {
  fullText: string;
  tokensInput: number;
  tokensOutput: number;
}

export interface TokenEvent {
  token: string;
  isFirst: boolean;
  timestamp: number;
}

export interface LLMAdapter extends EventEmitter {
  // Configuration
  setSystemPrompt(prompt: string): void;
  setConfig(config: Partial<LLMConfig>): void;

  // Context management
  clearHistory(): void;
  addMessage(role: 'user' | 'assistant' | 'system', content: string): void;
  getHistory(): LLMMessage[];

  // Generation
  generateResponse(userMessage: string): Promise<CompletionResult>;

  // State query
  isReady(): boolean;

  // Events emitted:
  // - 'token': TokenEvent with streaming token data
  // - 'error': Error occurred
}

// ============================================================================
// TTS (Text-to-Speech) Adapter
// ============================================================================

export interface TTSConfig extends BaseConfig {
  voiceId?: string;
  model?: string;
  stability?: number; // 0.0-1.0
  similarityBoost?: number; // 0.0-1.0
  speed?: number;
  outputFormat?: 'mp3_44100' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
  latencyOptimized?: boolean;
}

export interface AudioEvent {
  audioChunk: Buffer;
  isFirst: boolean;
  timestamp: number;
}

export interface TTSAdapter extends EventEmitter {
  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Configuration
  setConfig(config: Partial<TTSConfig>): void;
  setVoice(voiceId: string): void;

  // Synthesis
  synthesize(text: string): Promise<void>;

  // State query
  isReady(): boolean;

  // Events emitted:
  // - 'ready': Connection established
  // - 'audio': AudioEvent with audio chunk data
  // - 'complete': Synthesis finished
  // - 'error': Error occurred
  // - 'close': Connection closed
}

// ============================================================================
// Provider Registry Types
// ============================================================================
// Note: Specific provider types are defined in registry.ts

export interface ProviderConstructor<T> {
  new (config: any): T;
}

export interface ProviderInfo {
  name: string;
  type: 'asr' | 'llm' | 'tts';
  requiresConnection: boolean;
  supportedFeatures?: string[];
}
