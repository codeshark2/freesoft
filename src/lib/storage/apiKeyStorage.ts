const STORAGE_KEY = 'voicetest_vendor_configs';
const TEST_CONFIG_KEY = 'voicetest_test_configuration';

export interface VendorConfigData {
  // Authentication
  apiKey: string;
  region?: string;
  userId?: string;
  [key: string]: string | undefined;
}

export interface StoredConfigs {
  [vendorId: string]: VendorConfigData;
}

// Test configuration for active selections
export interface TestConfiguration {
  asr: {
    vendorId: string;
    modelId: string;
    languageCode: string;
  } | null;
  llm: {
    vendorId: string;
    modelId: string;
  } | null;
  tts: {
    vendorId: string;
    modelId: string;
    voiceId: string;
  } | null;
}

// Vendor config CRUD
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
  
  // Also clear from test configuration if this vendor was selected
  const testConfig = getTestConfiguration();
  if (testConfig.asr?.vendorId === vendorId) testConfig.asr = null;
  if (testConfig.llm?.vendorId === vendorId) testConfig.llm = null;
  if (testConfig.tts?.vendorId === vendorId) testConfig.tts = null;
  saveTestConfiguration(testConfig);
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

// Test configuration CRUD
export const getTestConfiguration = (): TestConfiguration => {
  try {
    const stored = localStorage.getItem(TEST_CONFIG_KEY);
    return stored ? JSON.parse(stored) : { asr: null, llm: null, tts: null };
  } catch {
    return { asr: null, llm: null, tts: null };
  }
};

export const saveTestConfiguration = (config: TestConfiguration): void => {
  localStorage.setItem(TEST_CONFIG_KEY, JSON.stringify(config));
};

export const updateTestConfigForType = (
  type: 'asr' | 'llm' | 'tts',
  selection: TestConfiguration['asr'] | TestConfiguration['llm'] | TestConfiguration['tts']
): void => {
  const current = getTestConfiguration();
  current[type] = selection as any;
  saveTestConfiguration(current);
};
