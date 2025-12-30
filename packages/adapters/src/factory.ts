import {
  ASRProviderType,
  LLMProviderType,
  TTSProviderType,
  ASRProviderRegistry,
  LLMProviderRegistry,
  TTSProviderRegistry,
  isValidASRProvider,
  isValidLLMProvider,
  isValidTTSProvider,
} from './registry';
import { ASRAdapter } from './base/ASRAdapter';
import { LLMAdapter } from './base/LLMAdapter';
import { TTSAdapter } from './base/TTSAdapter';
import { ASRConfig, LLMConfig, TTSConfig } from './types';

/**
 * Factory function to create ASR provider instances
 * @param type The provider type (e.g., 'deepgram')
 * @param config Configuration for the provider
 * @returns Instance of the requested ASR adapter
 * @throws Error if provider type is not supported
 */
export function createASRProvider(
  type: string,
  config: ASRConfig
): ASRAdapter {
  if (!isValidASRProvider(type)) {
    throw new Error(
      `Unsupported ASR provider: ${type}. Supported providers: ${Object.keys(ASRProviderRegistry).join(', ')}`
    );
  }

  const AdapterClass = ASRProviderRegistry[type];
  return new AdapterClass(config);
}

/**
 * Factory function to create LLM provider instances
 * @param type The provider type (e.g., 'openai')
 * @param config Configuration for the provider
 * @returns Instance of the requested LLM adapter
 * @throws Error if provider type is not supported
 */
export function createLLMProvider(
  type: string,
  config: LLMConfig
): LLMAdapter {
  if (!isValidLLMProvider(type)) {
    throw new Error(
      `Unsupported LLM provider: ${type}. Supported providers: ${Object.keys(LLMProviderRegistry).join(', ')}`
    );
  }

  const AdapterClass = LLMProviderRegistry[type];
  return new AdapterClass(config);
}

/**
 * Factory function to create TTS provider instances
 * @param type The provider type (e.g., 'elevenlabs')
 * @param config Configuration for the provider
 * @returns Instance of the requested TTS adapter
 * @throws Error if provider type is not supported
 */
export function createTTSProvider(
  type: string,
  config: TTSConfig
): TTSAdapter {
  if (!isValidTTSProvider(type)) {
    throw new Error(
      `Unsupported TTS provider: ${type}. Supported providers: ${Object.keys(TTSProviderRegistry).join(', ')}`
    );
  }

  const AdapterClass = TTSProviderRegistry[type];
  return new AdapterClass(config);
}

/**
 * Create all providers at once from a combined config
 */
export function createAllProviders(config: {
  asr: { type: ASRProviderType; config: ASRConfig };
  llm: { type: LLMProviderType; config: LLMConfig };
  tts: { type: TTSProviderType; config: TTSConfig };
}): {
  asr: ASRAdapter;
  llm: LLMAdapter;
  tts: TTSAdapter;
} {
  return {
    asr: createASRProvider(config.asr.type, config.asr.config),
    llm: createLLMProvider(config.llm.type, config.llm.config),
    tts: createTTSProvider(config.tts.type, config.tts.config),
  };
}
