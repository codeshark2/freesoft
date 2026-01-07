import { useMemo } from 'react';
import { vendorRegistry, getVendorsByType } from '@/lib/vendors/registry';
import { VendorType, VendorWithStatus } from '@/lib/vendors/types';

const checkEnvKey = (key: string): boolean => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim().length > 0;
};

const getVendorStatus = (envKeys: string[]): { isConfigured: boolean; status: 'configured' | 'not_configured' } => {
  const allConfigured = envKeys.every(checkEnvKey);
  return {
    isConfigured: allConfigured,
    status: allConfigured ? 'configured' : 'not_configured',
  };
};

export const useVendorConfig = () => {
  const vendors = useMemo((): VendorWithStatus[] => {
    return vendorRegistry.map((vendor) => {
      const { isConfigured, status } = getVendorStatus(vendor.envKeys);
      return {
        ...vendor,
        isConfigured,
        status,
      };
    });
  }, []);

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

  const getConfiguredVendorsOfType = (type: VendorType): VendorWithStatus[] => {
    return vendorsByType[type].filter((v) => v.isConfigured);
  };

  return {
    vendors,
    vendorsByType,
    configuredCount,
    totalCount: vendors.length,
    hasMinimumConfig,
    getConfiguredVendorsOfType,
  };
};
