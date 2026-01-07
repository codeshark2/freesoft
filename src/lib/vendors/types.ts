export type VendorType = 'ASR' | 'LLM' | 'TTS';

export type VendorStatus = 'configured' | 'not_configured' | 'error';

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

// Model definitions
export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  tier?: 'fast' | 'balanced' | 'quality';
  costTier?: 'low' | 'medium' | 'high';
}

export interface VoiceOption {
  id: string;
  name: string;
  gender?: 'male' | 'female' | 'neutral';
  preview?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

// Type-specific model configurations
export interface ASRModelConfig {
  models: ModelOption[];
  languages: LanguageOption[];
  features?: string[];
}

export interface LLMModelConfig {
  models: ModelOption[];
  supportsStreaming?: boolean;
  maxTokens?: number;
}

export interface TTSModelConfig {
  models: ModelOption[];
  voices: VoiceOption[];
  outputFormats?: string[];
}

export type ModelConfig = ASRModelConfig | LLMModelConfig | TTSModelConfig;

export interface VendorConfig {
  id: string;
  name: string;
  type: VendorType;
  configFields: ConfigField[];
  modelConfig: ModelConfig;
  docsUrl: string;
  pricingUrl?: string;
  description?: string;
}

export interface VendorWithStatus extends VendorConfig {
  status: VendorStatus;
  isConfigured: boolean;
}

// Selection state for testing
export interface VendorSelection {
  vendorId: string;
  modelId: string;
  voiceId?: string;
  languageCode?: string;
}
