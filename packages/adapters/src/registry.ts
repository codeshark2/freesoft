import { DeepgramAdapter } from './asr/DeepgramAdapter';
import { OpenAIAdapter } from './llm/OpenAIAdapter';
import { ElevenLabsAdapter } from './tts/ElevenLabsAdapter';
import { OpenAITTSAdapter } from './tts/OpenAITTSAdapter';
import { ASRAdapter } from './base/ASRAdapter';
import { LLMAdapter } from './base/LLMAdapter';
import { TTSAdapter } from './base/TTSAdapter';

/**
 * Provider type definitions for each adapter category
 */
export type ASRProviderType = 'deepgram';
export type LLMProviderType = 'openai';
export type TTSProviderType = 'openai-tts' | 'elevenlabs';

/**
 * Registry mapping provider types to adapter classes
 */
export const ASRProviderRegistry = {
  deepgram: DeepgramAdapter,
} as const;

export const LLMProviderRegistry = {
  openai: OpenAIAdapter,
} as const;

export const TTSProviderRegistry = {
  'openai-tts': OpenAITTSAdapter,
  elevenlabs: ElevenLabsAdapter,
} as const;

/**
 * Validation functions to check if a provider is supported
 */
export function isValidASRProvider(type: string): type is ASRProviderType {
  return type in ASRProviderRegistry;
}

export function isValidLLMProvider(type: string): type is LLMProviderType {
  return type in LLMProviderRegistry;
}

export function isValidTTSProvider(type: string): type is TTSProviderType {
  return type in TTSProviderRegistry;
}

/**
 * Get all available provider types for each category
 */
export function getAvailableASRProviders(): ASRProviderType[] {
  return Object.keys(ASRProviderRegistry) as ASRProviderType[];
}

export function getAvailableLLMProviders(): LLMProviderType[] {
  return Object.keys(LLMProviderRegistry) as LLMProviderType[];
}

export function getAvailableTTSProviders(): TTSProviderType[] {
  return Object.keys(TTSProviderRegistry) as TTSProviderType[];
}
