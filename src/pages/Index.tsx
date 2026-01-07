import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import { VendorSelector } from '@/components/config/VendorSelector';
import TestConsole from '@/components/dashboard/TestConsole';
import { VendorType } from '@/lib/vendors/types';
import { useVendorConfig } from '@/hooks/useVendorConfig';

const Index = () => {
  const { vendorsByType, hasMinimumConfig } = useVendorConfig();
  const [selectedVendors, setSelectedVendors] = useState<Record<VendorType, string | null>>({
    ASR: null,
    LLM: null,
    TTS: null,
  });

  // Auto-select first configured vendor of each type
  useEffect(() => {
    const newSelection: Record<VendorType, string | null> = { ASR: null, LLM: null, TTS: null };

    (['ASR', 'LLM', 'TTS'] as VendorType[]).forEach((type) => {
      const configured = vendorsByType[type].find((v) => v.isConfigured);
      if (configured) {
        newSelection[type] = configured.id;
      }
    });

    setSelectedVendors(newSelection);
  }, [vendorsByType]);

  const handleVendorSelect = (type: VendorType, vendorId: string) => {
    setSelectedVendors((prev) => ({ ...prev, [type]: vendorId }));
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
