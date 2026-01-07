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

export interface VendorConfig {
  id: string;
  name: string;
  type: VendorType;
  configFields: ConfigField[];
  docsUrl: string;
  pricingUrl?: string;
  description?: string;
}

export interface VendorWithStatus extends VendorConfig {
  status: VendorStatus;
  isConfigured: boolean;
}
