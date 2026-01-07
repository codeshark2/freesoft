import { VendorConfig, VendorType } from './types';

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

export const vendorRegistry: VendorConfig[] = [
  // ASR Vendors
  {
    id: 'deepgram',
    name: 'Deepgram',
    type: 'ASR',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Deepgram API key', required: true },
    ],
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
    docsUrl: 'https://portal.azure.com/',
    pricingUrl: 'https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/',
    description: 'Microsoft Azure Speech-to-Text service',
  },

  // LLM Vendors
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    type: 'LLM',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your OpenAI API key', required: true },
    ],
    docsUrl: 'https://platform.openai.com/api-keys',
    pricingUrl: 'https://openai.com/pricing',
    description: 'GPT-4 and GPT-4 Turbo models',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    type: 'LLM',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Anthropic API key', required: true },
    ],
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
    docsUrl: 'https://aistudio.google.com/apikey',
    pricingUrl: 'https://ai.google.dev/pricing',
    description: "Google's Gemini Pro and Ultra models",
  },

  // TTS Vendors
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    type: 'TTS',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your ElevenLabs API key', required: true },
    ],
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
