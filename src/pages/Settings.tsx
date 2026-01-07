import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink, Key, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVendorConfig } from '@/hooks/useVendorConfig';
import { VendorType } from '@/lib/vendors/types';
import { toast } from 'sonner';

const envTemplate = `# VoiceTest.ai - Environment Configuration
# Copy this to .env and fill in your API keys

# ASR Vendors
VITE_DEEPGRAM_API_KEY=
VITE_ASSEMBLYAI_API_KEY=
VITE_OPENAI_API_KEY=
VITE_AZURE_SPEECH_KEY=
VITE_AZURE_SPEECH_REGION=eastus

# LLM Vendors (OpenAI uses same key as above)
VITE_ANTHROPIC_API_KEY=
VITE_GOOGLE_AI_KEY=

# TTS Vendors
VITE_ELEVENLABS_API_KEY=
VITE_PLAYHT_API_KEY=
VITE_PLAYHT_USER_ID=
`;

const typeLabels: Record<VendorType, string> = {
  ASR: 'Speech Recognition',
  LLM: 'Language Models',
  TTS: 'Text to Speech',
};

const Settings = () => {
  const { vendorsByType, configuredCount, totalCount, hasMinimumConfig } = useVendorConfig();
  const [copied, setCopied] = useState(false);

  const copyEnvTemplate = async () => {
    await navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    toast.success('Environment template copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="scanline" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
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

        {/* Quick Setup */}
        <div className="terminal-panel p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold">Quick Setup</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyEnvTemplate}
              className="gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy .env template'}
            </Button>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. Copy the environment template above</p>
            <p>2. Create a <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-xs">.env</code> file in your project root</p>
            <p>3. Fill in API keys for the vendors you want to use</p>
            <p>4. Restart the development server</p>
          </div>
        </div>

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
                  <div
                    key={vendor.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          vendor.isConfigured
                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                      <div>
                        <h3 className="font-medium text-sm">{vendor.name}</h3>
                        <p className="text-xs text-muted-foreground">{vendor.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground font-mono hidden sm:block">
                        {vendor.envKeys[0]}
                      </code>
                      <a
                        href={vendor.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
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
    </div>
  );
};

export default Settings;
