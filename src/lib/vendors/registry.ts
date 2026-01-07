import { VendorConfig, VendorType } from './types';

export const vendorRegistry: VendorConfig[] = [
  // ASR Vendors
  {
    id: 'deepgram',
    name: 'Deepgram',
    type: 'ASR',
    envKeys: ['VITE_DEEPGRAM_API_KEY'],
    docsUrl: 'https://console.deepgram.com/',
    pricingUrl: 'https://deepgram.com/pricing',
    description: 'Real-time speech recognition with high accuracy',
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    type: 'ASR',
    envKeys: ['VITE_ASSEMBLYAI_API_KEY'],
    docsUrl: 'https://www.assemblyai.com/dashboard/',
    pricingUrl: 'https://www.assemblyai.com/pricing',
    description: 'AI-powered speech-to-text with advanced features',
  },
  {
    id: 'whisper',
    name: 'OpenAI Whisper',
    type: 'ASR',
    envKeys: ['VITE_OPENAI_API_KEY'],
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: 'OpenAI\'s robust speech recognition model',
  },
  {
    id: 'azure-stt',
    name: 'Azure Speech',
    type: 'ASR',
    envKeys: ['VITE_AZURE_SPEECH_KEY', 'VITE_AZURE_SPEECH_REGION'],
    docsUrl: 'https://portal.azure.com/',
    pricingUrl: 'https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/',
    description: 'Microsoft Azure Speech-to-Text service',
  },

  // LLM Vendors
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    type: 'LLM',
    envKeys: ['VITE_OPENAI_API_KEY'],
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: 'GPT-4 and GPT-4 Turbo models',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'LLM',
    envKeys: ['VITE_ANTHROPIC_API_KEY'],
    docsUrl: 'https://console.anthropic.com/',
    pricingUrl: 'https://www.anthropic.com/pricing',
    description: 'Claude 3 family of models',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'LLM',
    envKeys: ['VITE_GOOGLE_AI_KEY'],
    docsUrl: 'https://aistudio.google.com/apikey',
    pricingUrl: 'https://ai.google.dev/pricing',
    description: 'Google\'s Gemini Pro and Ultra models',
  },

  // TTS Vendors
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'TTS',
    envKeys: ['VITE_ELEVENLABS_API_KEY'],
    docsUrl: 'https://elevenlabs.io/',
    pricingUrl: 'https://elevenlabs.io/pricing',
    description: 'High-quality AI voice synthesis',
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    type: 'TTS',
    envKeys: ['VITE_OPENAI_API_KEY'],
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: 'OpenAI\'s text-to-speech models',
  },
  {
    id: 'playht',
    name: 'PlayHT',
    type: 'TTS',
    envKeys: ['VITE_PLAYHT_API_KEY', 'VITE_PLAYHT_USER_ID'],
    docsUrl: 'https://play.ht/studio/',
    pricingUrl: 'https://play.ht/pricing/',
    description: 'Ultra-realistic AI voices',
  },
  {
    id: 'azure-tts',
    name: 'Azure TTS',
    type: 'TTS',
    envKeys: ['VITE_AZURE_SPEECH_KEY', 'VITE_AZURE_SPEECH_REGION'],
    docsUrl: 'https://portal.azure.com/',
    pricingUrl: 'https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/',
    description: 'Microsoft Azure Text-to-Speech service',
  },
];

export const getVendorsByType = (type: VendorType): VendorConfig[] => {
  return vendorRegistry.filter((v) => v.type === type);
};

export const getVendorById = (id: string): VendorConfig | undefined => {
  return vendorRegistry.find((v) => v.id === id);
};
