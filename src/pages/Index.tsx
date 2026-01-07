import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import { VendorSelector } from '@/components/config/VendorSelector';
import TestConsole from '@/components/dashboard/TestConsole';
import { VendorType, VendorSelection, ASRModelConfig, TTSModelConfig } from '@/lib/vendors/types';
import { useVendorConfig } from '@/hooks/useVendorConfig';
import { getVendorById } from '@/lib/vendors/registry';

const Index = () => {
  const { vendorsByType, hasMinimumConfig } = useVendorConfig();
  const [selectedVendors, setSelectedVendors] = useState<Record<VendorType, VendorSelection | null>>({
    ASR: null,
    LLM: null,
    TTS: null,
  });

  // Auto-select first configured vendor of each type with default model
  useEffect(() => {
    const newSelection: Record<VendorType, VendorSelection | null> = { ASR: null, LLM: null, TTS: null };

    (['ASR', 'LLM', 'TTS'] as VendorType[]).forEach((type) => {
      const configured = vendorsByType[type].find((v) => v.isConfigured);
      if (configured && !selectedVendors[type]) {
        const vendor = getVendorById(configured.id);
        if (vendor) {
          const models = vendor.modelConfig.models;
          const selection: VendorSelection = {
            vendorId: vendor.id,
            modelId: models[0]?.id || '',
          };

          if (type === 'ASR') {
            const asrConfig = vendor.modelConfig as ASRModelConfig;
            selection.languageCode = asrConfig.languages?.[0]?.code || 'en-US';
          }

          if (type === 'TTS') {
            const ttsConfig = vendor.modelConfig as TTSModelConfig;
            selection.voiceId = ttsConfig.voices?.[0]?.id;
          }

          newSelection[type] = selection;
        }
      } else if (selectedVendors[type]) {
        newSelection[type] = selectedVendors[type];
      }
    });

    // Only update if there's a change
    if (JSON.stringify(newSelection) !== JSON.stringify(selectedVendors)) {
      setSelectedVendors(newSelection);
    }
  }, [vendorsByType]);

  const handleVendorSelect = (type: VendorType, selection: VendorSelection) => {
    setSelectedVendors((prev) => ({ ...prev, [type]: selection }));
  };

  // Build test config summary
  const getConfigSummary = () => {
    const summary: string[] = [];
    
    if (selectedVendors.ASR) {
      const vendor = getVendorById(selectedVendors.ASR.vendorId);
      const model = vendor?.modelConfig.models.find(m => m.id === selectedVendors.ASR?.modelId);
      summary.push(`ASR: ${vendor?.name} → ${model?.name || selectedVendors.ASR.modelId}`);
    }
    
    if (selectedVendors.LLM) {
      const vendor = getVendorById(selectedVendors.LLM.vendorId);
      const model = vendor?.modelConfig.models.find(m => m.id === selectedVendors.LLM?.modelId);
      summary.push(`LLM: ${vendor?.name} → ${model?.name || selectedVendors.LLM.modelId}`);
    }
    
    if (selectedVendors.TTS) {
      const vendor = getVendorById(selectedVendors.TTS.vendorId);
      const model = vendor?.modelConfig.models.find(m => m.id === selectedVendors.TTS?.modelId);
      const ttsConfig = vendor?.modelConfig as TTSModelConfig;
      const voice = ttsConfig?.voices?.find(v => v.id === selectedVendors.TTS?.voiceId);
      summary.push(`TTS: ${vendor?.name} → ${model?.name || selectedVendors.TTS.modelId}${voice ? ` (${voice.name})` : ''}`);
    }
    
    return summary;
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="fixed inset-0 scanline pointer-events-none z-50 opacity-30" />

      <Header />

      <main className="container py-8 px-4 max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            <span className="text-foreground">Test Your </span>
            <span className="text-primary glow-text-cyan">Voice AI</span>
            <span className="text-foreground"> Pipeline</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compare ASR, LLM, and TTS vendors side-by-side.
            <span className="text-accent"> Open source</span> and built for the AI community.
          </p>
        </section>

        {/* Vendor Selection */}
        <section>
          <VendorSelector selectedVendors={selectedVendors} onVendorSelect={handleVendorSelect} />
        </section>

        {/* Configuration Summary */}
        {hasMinimumConfig && getConfigSummary().length > 0 && (
          <section className="terminal-panel p-4 max-w-2xl mx-auto">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Test Configuration
            </h4>
            <div className="space-y-1 font-mono text-sm">
              {getConfigSummary().map((line, i) => (
                <div key={i} className="text-foreground">
                  <span className="text-primary">→</span> {line}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Test Console */}
        <section className="max-w-2xl mx-auto">
          <TestConsole />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with 💚 for the <span className="text-primary">AI Community</span> •{' '}
            <a
              href="https://github.com/codeshark2/freevoicetesting"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
