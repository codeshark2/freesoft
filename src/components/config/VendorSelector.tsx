import { useState } from 'react';
import { Mic, Brain, Volume2, Plus, Check } from 'lucide-react';
import { VendorType, VendorWithStatus, VendorConfig } from '@/lib/vendors/types';
import { useVendorConfig } from '@/hooks/useVendorConfig';
import { VendorConfigModal } from './VendorConfigModal';
import { cn } from '@/lib/utils';

interface VendorSelectorProps {
  selectedVendors: Record<VendorType, string | null>;
  onVendorSelect: (type: VendorType, vendorId: string) => void;
}

const typeConfig: Record<VendorType, { label: string; icon: typeof Mic; color: string }> = {
  ASR: { label: 'Speech-to-Text', icon: Mic, color: 'text-primary' },
  LLM: { label: 'Language Model', icon: Brain, color: 'text-secondary' },
  TTS: { label: 'Text-to-Speech', icon: Volume2, color: 'text-accent' },
};

export const VendorSelector = ({ selectedVendors, onVendorSelect }: VendorSelectorProps) => {
  const { vendorsByType } = useVendorConfig();
  const [configModalVendor, setConfigModalVendor] = useState<VendorConfig | null>(null);

  const handleVendorClick = (vendor: VendorWithStatus) => {
    if (vendor.isConfigured) {
      onVendorSelect(vendor.type, vendor.id);
    } else {
      setConfigModalVendor(vendor);
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {(['ASR', 'LLM', 'TTS'] as VendorType[]).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const vendors = vendorsByType[type];

          return (
            <div key={type} className="terminal-panel p-4 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={cn('w-5 h-5', config.color)} />
                <h3 className="font-display font-semibold text-foreground">{config.label}</h3>
              </div>

              <div className="space-y-2">
                {vendors.map((vendor) => {
                  const isSelected = selectedVendors[type] === vendor.id;

                  return (
                    <button
                      key={vendor.id}
                      onClick={() => handleVendorClick(vendor)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-md transition-all text-left',
                        'border border-transparent hover:border-border',
                        vendor.isConfigured
                          ? 'bg-muted/50 hover:bg-muted'
                          : 'bg-muted/20 opacity-70 hover:opacity-100',
                        isSelected && 'border-primary bg-primary/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {vendor.isConfigured ? (
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                            )}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-dashed border-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            'text-sm font-medium',
                            vendor.isConfigured ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {vendor.name}
                        </span>
                      </div>

                      {!vendor.isConfigured && (
                        <span className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                          <Plus className="w-3 h-3" />
                          Configure
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <VendorConfigModal
        vendor={configModalVendor}
        open={!!configModalVendor}
        onClose={() => setConfigModalVendor(null)}
      />
    </>
  );
};
