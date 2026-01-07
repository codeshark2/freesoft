import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVendorConfig } from '@/hooks/useVendorConfig';
import { VendorType, VendorConfig } from '@/lib/vendors/types';
import { clearVendorConfig } from '@/lib/storage/apiKeyStorage';
import { notifyVendorConfigChange } from '@/hooks/useVendorConfig';
import { VendorConfigModal } from '@/components/config/VendorConfigModal';
import { toast } from 'sonner';

const typeLabels: Record<VendorType, string> = {
  ASR: 'Speech Recognition',
  LLM: 'Language Models',
  TTS: 'Text to Speech',
};

const Settings = () => {
  const { vendorsByType, configuredCount, totalCount, hasMinimumConfig } = useVendorConfig();
  const [editingVendor, setEditingVendor] = useState<VendorConfig | null>(null);

  const handleRemoveVendor = (vendorId: string, vendorName: string) => {
    clearVendorConfig(vendorId);
    notifyVendorConfigChange();
    toast.success(`${vendorName} configuration removed`);
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="scanline" />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Configuration</h1>
            <p className="text-sm text-muted-foreground">
              {configuredCount} of {totalCount} vendors configured
            </p>
          </div>
        </div>

        {/* Status Banner */}
        {!hasMinimumConfig && (
          <div className="terminal-panel p-4 mb-6 border-amber-500/50 bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-500">Setup Required</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure at least one vendor from each category (ASR, LLM, TTS) to start testing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Sections */}
        <div className="space-y-6">
          {(['ASR', 'LLM', 'TTS'] as VendorType[]).map((type) => (
            <div key={type} className="terminal-panel overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-display font-semibold">{typeLabels[type]}</h2>
                <p className="text-xs text-muted-foreground">
                  {vendorsByType[type].filter((v) => v.isConfigured).length} of{' '}
                  {vendorsByType[type].length} configured
                </p>
              </div>
              <div className="divide-y divide-border">
                {vendorsByType[type].map((vendor) => (
                  <div key={vendor.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          vendor.isConfigured
                            ? 'bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                      <div>
                        <h3 className="font-medium text-sm">{vendor.name}</h3>
                        <p className="text-xs text-muted-foreground">{vendor.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {vendor.isConfigured ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingVendor(vendor)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveVendor(vendor.id, vendor.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => setEditingVendor(vendor)}
                        >
                          Configure
                        </Button>
                      )}
                      <a
                        href={vendor.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <VendorConfigModal vendor={editingVendor} open={!!editingVendor} onClose={() => setEditingVendor(null)} />
    </div>
  );
};

export default Settings;
