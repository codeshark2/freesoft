const STORAGE_KEY = 'voicetest_vendor_configs';

export interface VendorConfigData {
  apiKey: string;
  region?: string;
  userId?: string;
  [key: string]: string | undefined;
}

export interface StoredConfigs {
  [vendorId: string]: VendorConfigData;
}

export const saveVendorConfig = (vendorId: string, config: VendorConfigData): void => {
  const existing = getAllConfigs();
  existing[vendorId] = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getVendorConfig = (vendorId: string): VendorConfigData | null => {
  const configs = getAllConfigs();
  return configs[vendorId] || null;
};

export const clearVendorConfig = (vendorId: string): void => {
  const configs = getAllConfigs();
  delete configs[vendorId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
};

export const getAllConfigs = (): StoredConfigs => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const isVendorConfigured = (vendorId: string): boolean => {
  const config = getVendorConfig(vendorId);
  return config !== null && config.apiKey.trim().length > 0;
};

export const getConfiguredVendorIds = (): string[] => {
  const configs = getAllConfigs();
  return Object.keys(configs).filter((id) => configs[id].apiKey?.trim().length > 0);
};
