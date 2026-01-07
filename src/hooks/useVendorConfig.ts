import { useMemo, useCallback, useSyncExternalStore } from 'react';
import { vendorRegistry } from '@/lib/vendors/registry';
import { VendorType, VendorWithStatus } from '@/lib/vendors/types';
import { isVendorConfigured, getConfiguredVendorIds } from '@/lib/storage/apiKeyStorage';

const STORAGE_KEY = 'voicetest_vendor_configs';

const subscribe = (callback: () => void) => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  
  window.addEventListener('storage', handleStorage);
  window.addEventListener('vendorConfigChanged', callback);
  
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('vendorConfigChanged', callback);
  };
};

const getSnapshot = () => {
  return localStorage.getItem(STORAGE_KEY) || '{}';
};

export const notifyVendorConfigChange = () => {
  window.dispatchEvent(new Event('vendorConfigChanged'));
};

export const useVendorConfig = () => {
  const storageSnapshot = useSyncExternalStore(subscribe, getSnapshot);

  const vendors = useMemo((): VendorWithStatus[] => {
    return vendorRegistry.map((vendor) => {
      const configured = isVendorConfigured(vendor.id);
      return {
        ...vendor,
        isConfigured: configured,
        status: configured ? 'configured' : 'not_configured',
      };
    });
  }, [storageSnapshot]);

  const vendorsByType = useMemo(() => {
    const result: Record<VendorType, VendorWithStatus[]> = {
      ASR: [],
      LLM: [],
      TTS: [],
    };

    vendors.forEach((vendor) => {
      result[vendor.type].push(vendor);
    });

    return result;
  }, [vendors]);

  const configuredCount = useMemo(() => {
    return vendors.filter((v) => v.isConfigured).length;
  }, [vendors]);

  const hasMinimumConfig = useMemo(() => {
    const hasASR = vendorsByType.ASR.some((v) => v.isConfigured);
    const hasLLM = vendorsByType.LLM.some((v) => v.isConfigured);
    const hasTTS = vendorsByType.TTS.some((v) => v.isConfigured);
    return hasASR && hasLLM && hasTTS;
  }, [vendorsByType]);

  const getConfiguredVendorsOfType = useCallback(
    (type: VendorType): VendorWithStatus[] => {
      return vendorsByType[type].filter((v) => v.isConfigured);
    },
    [vendorsByType]
  );

  return {
    vendors,
    vendorsByType,
    configuredCount,
    totalCount: vendors.length,
    hasMinimumConfig,
    getConfiguredVendorsOfType,
  };
};
