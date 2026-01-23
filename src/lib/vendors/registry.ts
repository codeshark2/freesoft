import { VendorConfig } from './types';

const AZURE_REGIONS = [
  { value: 'eastus', label: 'East US' },
  { value: 'westus', label: 'West US' },
  { value: 'westus2', label: 'West US 2' },
  { value: 'eastus2', label: 'East US 2' },
  { value: 'westeurope', label: 'West Europe' },
  { value: 'northeurope', label: 'North Europe' },
  { value: 'southeastasia', label: 'Southeast Asia' },
  { value: 'eastasia', label: 'East Asia' },
  { value: 'australiaeast', label: 'Australia East' },
  { value: 'centralindia', label: 'Central India' },
  { value: 'japaneast', label: 'Japan East' },
  { value: 'koreacentral', label: 'Korea Central' },
  { value: 'canadacentral', label: 'Canada Central' },
  { value: 'uksouth', label: 'UK South' },
  { value: 'francecentral', label: 'France Central' },
  { value: 'brazilsouth', label: 'Brazil South' },
];

const COMMON_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'ru-RU', name: 'Russian' },
];

export const vendorRegistry: VendorConfig[] = [
  // ============= ASR Vendors =============
  {
    id: 'deepgram',
    name: 'Deepgram',
    type: 'ASR',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Deepgram API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'nova-2', name: 'Nova-2', description: 'Latest and most accurate model', tier: 'quality', costTier: 'medium' },
        { id: 'nova-2-general', name: 'Nova-2 General', description: 'General purpose transcription', tier: 'balanced', costTier: 'medium' },
        { id: 'nova-2-meeting', name: 'Nova-2 Meeting', description: 'Optimized for meetings', tier: 'quality', costTier: 'medium' },
        { id: 'nova-2-phonecall', name: 'Nova-2 Phonecall', description: 'Optimized for phone audio', tier: 'quality', costTier: 'medium' },
        { id: 'enhanced', name: 'Enhanced', description: 'High accuracy, higher latency', tier: 'quality', costTier: 'high' },
        { id: 'base', name: 'Base', description: 'Fast, lower accuracy', tier: 'fast', costTier: 'low' },
      ],
      languages: COMMON_LANGUAGES,
      features: ['punctuation', 'diarization', 'smart_format', 'timestamps'],
    },
    docsUrl: 'https://console.deepgram.com/',
    pricingUrl: 'https://deepgram.com/pricing',
    description: 'Real-time speech recognition with high accuracy',
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    type: 'ASR',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your AssemblyAI API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'best', name: 'Best', description: 'Highest accuracy model', tier: 'quality', costTier: 'high' },
        { id: 'nano', name: 'Nano', description: 'Fast and cost-effective', tier: 'fast', costTier: 'low' },
      ],
      languages: COMMON_LANGUAGES,
      features: ['speaker_labels', 'auto_chapters', 'entity_detection', 'sentiment_analysis'],
    },
    docsUrl: 'https://www.assemblyai.com/dashboard/',
    pricingUrl: 'https://www.assemblyai.com/pricing',
    description: 'AI-powered speech-to-text with advanced features',
  },
  {
    id: 'whisper',
    name: 'OpenAI Whisper',
    type: 'ASR',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your OpenAI API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'whisper-1', name: 'Whisper-1', description: 'General-purpose speech recognition', tier: 'balanced', costTier: 'medium' },
      ],
      languages: COMMON_LANGUAGES,
      features: ['translation', 'timestamps'],
    },
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: "OpenAI's robust speech recognition model",
  },
  {
    id: 'azure-stt',
    name: 'Azure Speech',
    type: 'ASR',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Azure Speech key', required: true },
      { key: 'region', label: 'Region', type: 'select', options: AZURE_REGIONS, required: true },
    ],
    modelConfig: {
      models: [
        { id: 'default', name: 'Default', description: 'Standard recognition', tier: 'balanced', costTier: 'medium' },
        { id: 'conversation', name: 'Conversation', description: 'Optimized for conversations', tier: 'quality', costTier: 'medium' },
        { id: 'dictation', name: 'Dictation', description: 'Optimized for dictation', tier: 'quality', costTier: 'medium' },
      ],
      languages: COMMON_LANGUAGES,
      features: ['real_time', 'batch', 'custom_models'],
    },
    docsUrl: 'https://portal.azure.com/',
    pricingUrl: 'https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/',
    description: 'Microsoft Azure Speech-to-Text service',
  },

  // ============= LLM Vendors =============
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'LLM',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your OpenAI API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal', tier: 'quality', costTier: 'high' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', tier: 'fast', costTier: 'low' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability, 128k context', tier: 'quality', costTier: 'high' },
        { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4', tier: 'quality', costTier: 'high' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', tier: 'fast', costTier: 'low' },
        { id: 'o1-preview', name: 'o1 Preview', description: 'Reasoning model', tier: 'quality', costTier: 'high' },
        { id: 'o1-mini', name: 'o1 Mini', description: 'Fast reasoning model', tier: 'balanced', costTier: 'medium' },
      ],
      supportsStreaming: true,
      maxTokens: 128000,
    },
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: 'GPT-4o and GPT-4 Turbo models',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'LLM',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Anthropic API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance of intelligence and speed', tier: 'balanced', costTier: 'medium' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most intelligent model', tier: 'quality', costTier: 'high' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance', tier: 'balanced', costTier: 'medium' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest and most compact', tier: 'fast', costTier: 'low' },
      ],
      supportsStreaming: true,
      maxTokens: 200000,
    },
    docsUrl: 'https://console.anthropic.com/',
    pricingUrl: 'https://www.anthropic.com/pricing',
    description: 'Claude 3 family of models',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'LLM',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Google AI API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable, 1M context', tier: 'quality', costTier: 'high' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient', tier: 'fast', costTier: 'low' },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Previous generation', tier: 'balanced', costTier: 'medium' },
      ],
      supportsStreaming: true,
      maxTokens: 1000000,
    },
    docsUrl: 'https://aistudio.google.com/apikey',
    pricingUrl: 'https://ai.google.dev/pricing',
    description: "Google's Gemini Pro and Flash models",
  },

  // ============= TTS Vendors =============
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'TTS',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your ElevenLabs API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Best quality, 29 languages', tier: 'quality', costTier: 'high' },
        { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Low latency, good quality', tier: 'fast', costTier: 'medium' },
        { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Fast generation', tier: 'fast', costTier: 'medium' },
        { id: 'eleven_monolingual_v1', name: 'English v1', description: 'English only, legacy', tier: 'balanced', costTier: 'low' },
      ],
      voices: [
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male' },
        { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male' },
      ],
      outputFormats: ['mp3_44100_128', 'mp3_22050_32', 'pcm_16000', 'pcm_22050'],
    },
    docsUrl: 'https://elevenlabs.io/',
    pricingUrl: 'https://elevenlabs.io/pricing',
    description: 'High-quality AI voice synthesis',
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    type: 'TTS',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your OpenAI API key', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'tts-1-hd', name: 'TTS-1 HD', description: 'Highest quality', tier: 'quality', costTier: 'high' },
        { id: 'tts-1', name: 'TTS-1', description: 'Standard quality, faster', tier: 'fast', costTier: 'low' },
      ],
      voices: [
        { id: 'alloy', name: 'Alloy', gender: 'neutral' },
        { id: 'echo', name: 'Echo', gender: 'male' },
        { id: 'fable', name: 'Fable', gender: 'neutral' },
        { id: 'onyx', name: 'Onyx', gender: 'male' },
        { id: 'nova', name: 'Nova', gender: 'female' },
        { id: 'shimmer', name: 'Shimmer', gender: 'female' },
      ],
      outputFormats: ['mp3', 'opus', 'aac', 'flac'],
    },
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: "OpenAI's text-to-speech models",
  },
  {
    id: 'playht',
    name: 'PlayHT',
    type: 'TTS',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your PlayHT API key', required: true },
      { key: 'userId', label: 'User ID', type: 'text', placeholder: 'Enter your PlayHT User ID', required: true },
    ],
    modelConfig: {
      models: [
        { id: 'PlayHT2.0', name: 'PlayHT 2.0', description: 'Best quality, most natural', tier: 'quality', costTier: 'high' },
        { id: 'PlayHT2.0-turbo', name: 'PlayHT 2.0 Turbo', description: 'Low latency streaming', tier: 'fast', costTier: 'medium' },
        { id: 'PlayHT1.0', name: 'PlayHT 1.0', description: 'Legacy model', tier: 'balanced', costTier: 'low' },
      ],
      voices: [
        { id: 'larry', name: 'Larry', gender: 'male' },
        { id: 'jennifer', name: 'Jennifer', gender: 'female' },
        { id: 'michael', name: 'Michael', gender: 'male' },
        { id: 'emma', name: 'Emma', gender: 'female' },
        { id: 'chris', name: 'Chris', gender: 'male' },
        { id: 'sophia', name: 'Sophia', gender: 'female' },
      ],
      outputFormats: ['mp3', 'wav', 'ogg', 'mulaw'],
    },
    docsUrl: 'https://play.ht/studio/',
    pricingUrl: 'https://play.ht/pricing/',
    description: 'Ultra-realistic AI voices',
  },
  {
    id: 'azure-tts',
    name: 'Azure TTS',
    type: 'TTS',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Azure Speech key', required: true },
      { key: 'region', label: 'Region', type: 'select', options: AZURE_REGIONS, required: true },
    ],
    modelConfig: {
      models: [
        { id: 'neural', name: 'Neural', description: 'Natural sounding voices', tier: 'quality', costTier: 'medium' },
        { id: 'neural-hd', name: 'Neural HD', description: 'Highest quality neural', tier: 'quality', costTier: 'high' },
        { id: 'standard', name: 'Standard', description: 'Basic synthesis', tier: 'fast', costTier: 'low' },
      ],
      voices: [
        { id: 'en-US-JennyNeural', name: 'Jenny (US)', gender: 'female' },
        { id: 'en-US-GuyNeural', name: 'Guy (US)', gender: 'male' },
        { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', gender: 'female' },
        { id: 'en-GB-RyanNeural', name: 'Ryan (UK)', gender: 'male' },
        { id: 'en-AU-NatashaNeural', name: 'Natasha (AU)', gender: 'female' },
        { id: 'en-AU-WilliamNeural', name: 'William (AU)', gender: 'male' },
      ],
      outputFormats: ['audio-16khz-32kbitrate-mono-mp3', 'audio-24khz-48kbitrate-mono-mp3', 'riff-24khz-16bit-mono-pcm'],
    },
    docsUrl: 'https://portal.azure.com/',
    pricingUrl: 'https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/',
    description: 'Microsoft Azure Text-to-Speech service',
  },
];

export const getVendorsByType = (type: 'ASR' | 'LLM' | 'TTS'): VendorConfig[] => {
  return vendorRegistry.filter((v) => v.type === type);
};

export const getVendorById = (id: string): VendorConfig | undefined => {
  return vendorRegistry.find((v) => v.id === id);
};
