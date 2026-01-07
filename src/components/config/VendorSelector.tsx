import { useState, useEffect } from 'react';
import { Mic, Brain, Volume2, Plus, Check, Settings2 } from 'lucide-react';
import { VendorType, VendorWithStatus, VendorConfig, VendorSelection, ASRModelConfig, TTSModelConfig } from '@/lib/vendors/types';
import { useVendorConfig } from '@/hooks/useVendorConfig';
import { VendorConfigModal } from './VendorConfigModal';
import { ModelSelector } from './ModelSelector';
import { cn } from '@/lib/utils';

interface VendorSelectorProps {
  selectedVendors: Record<VendorType, VendorSelection | null>;
  onVendorSelect: (type: VendorType, selection: VendorSelection) => void;
}

const typeConfig: Record<VendorType, { label: string; icon: typeof Mic; color: string }> = {
  ASR: { label: 'Speech-to-Text', icon: Mic, color: 'text-primary' },
  LLM: { label: 'Language Model', icon: Brain, color: 'text-secondary' },
  TTS: { label: 'Text-to-Speech', icon: Volume2, color: 'text-accent' },
};

const getDefaultSelection = (vendor: VendorConfig): VendorSelection => {
  const models = vendor.modelConfig.models;
  const defaultModel = models[0]?.id || '';
  
  const selection: VendorSelection = {
    vendorId: vendor.id,
    modelId: defaultModel,
  };

  if (vendor.type === 'ASR') {
    const asrConfig = vendor.modelConfig as ASRModelConfig;
    selection.languageCode = asrConfig.languages?.[0]?.code || 'en-US';
  }

  if (vendor.type === 'TTS') {
    const ttsConfig = vendor.modelConfig as TTSModelConfig;
    selection.voiceId = ttsConfig.voices?.[0]?.id;
  }

  return selection;
};

export const VendorSelector = ({ selectedVendors, onVendorSelect }: VendorSelectorProps) => {
  const { vendorsByType } = useVendorConfig();
  const [configModalVendor, setConfigModalVendor] = useState<VendorConfig | null>(null);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  const handleVendorClick = (vendor: VendorWithStatus) => {
    if (!vendor.isConfigured) {
      setConfigModalVendor(vendor);
      return;
    }

    const currentSelection = selectedVendors[vendor.type];
    const isCurrentlySelected = currentSelection?.vendorId === vendor.id;

    if (isCurrentlySelected) {
      // Toggle expansion for model selection
      setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id);
    } else {
      // Select this vendor with default model
      const selection = getDefaultSelection(vendor);
      onVendorSelect(vendor.type, selection);
      setExpandedVendor(vendor.id);
    }
  };

  const handleSelectionChange = (type: VendorType, selection: VendorSelection) => {
    onVendorSelect(type, selection);
  };

  const handleConfigModalClose = () => {
    setConfigModalVendor(null);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {(['ASR', 'LLM', 'TTS'] as VendorType[]).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const vendors = vendorsByType[type];
          const currentSelection = selectedVendors[type];

          return (
            <div key={type} className="terminal-panel p-4 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={cn('w-5 h-5', config.color)} />
                <h3 className="font-display font-semibold text-foreground">{config.label}</h3>
              </div>

              <div className="space-y-2">
                {vendors.map((vendor) => {
                  const isSelected = currentSelection?.vendorId === vendor.id;
                  const isExpanded = expandedVendor === vendor.id && isSelected;

                  return (
                    <div key={vendor.id} className="space-y-2">
                      <button
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

                        {!vendor.isConfigured ? (
                          <span className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                            <Plus className="w-3 h-3" />
                            Configure
                          </span>
                        ) : isSelected ? (
                          <Settings2 className="w-4 h-4 text-muted-foreground" />
                        ) : null}
                      </button>

                      {/* Model Selection Panel */}
                      {isExpanded && currentSelection && (
                        <div className="ml-7 p-3 bg-muted/30 rounded-md border border-border/50">
                          <ModelSelector
                            vendor={vendor}
                            selection={currentSelection}
                            onSelectionChange={(sel) => handleSelectionChange(type, sel)}
                            compact
                          />
                        </div>
                      )}
                    </div>
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
        onClose={handleConfigModalClose}
      />
    </>
  );
};
