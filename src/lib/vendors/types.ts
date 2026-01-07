export type VendorType = 'ASR' | 'LLM' | 'TTS';

export type VendorStatus = 'configured' | 'not_configured' | 'error';

export interface VendorConfig {
  id: string;
  name: string;
  type: VendorType;
  envKeys: string[];
  docsUrl: string;
  pricingUrl?: string;
  description?: string;
}

export interface VendorWithStatus extends VendorConfig {
  status: VendorStatus;
  isConfigured: boolean;
}
