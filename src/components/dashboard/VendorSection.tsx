import { useState } from "react";
import { Mic, Brain, Volume2, Radio, Sparkles, AudioWaveform } from "lucide-react";
import VendorCard from "./VendorCard";
import { useVendorConfig } from "@/hooks/useVendorConfig";
import { VendorType, VendorWithStatus } from "@/lib/vendors/types";

const typeIcons = {
  ASR: Mic,
  LLM: Brain,
  TTS: Volume2,
};

const sectionConfig: Record<VendorType, { title: string; subtitle: string; icon: typeof Radio; gradient: string }> = {
  ASR: {
    title: "Speech Recognition",
    subtitle: "ASR Vendors",
    icon: Radio,
    gradient: "from-primary/20 to-transparent",
  },
  LLM: {
    title: "Language Models", 
    subtitle: "LLM Vendors",
    icon: Sparkles,
    gradient: "from-secondary/20 to-transparent",
  },
  TTS: {
    title: "Text to Speech",
    subtitle: "TTS Vendors", 
    icon: AudioWaveform,
    gradient: "from-accent/20 to-transparent",
  },
};

const VendorSection = () => {
  const { vendorsByType } = useVendorConfig();
  
  const [selectedVendors, setSelectedVendors] = useState<Record<VendorType, string | null>>({
    ASR: null,
    LLM: null,
    TTS: null,
  });

  // Auto-select first configured vendor for each type
  useState(() => {
    const newSelections: Record<VendorType, string | null> = { ASR: null, LLM: null, TTS: null };
    (['ASR', 'LLM', 'TTS'] as VendorType[]).forEach((type) => {
      const configured = vendorsByType[type].find((v) => v.isConfigured);
      if (configured) {
        newSelections[type] = configured.id;
      }
    });
    setSelectedVendors(newSelections);
  });

  const toggleVendor = (type: VendorType, vendorId: string) => {
    setSelectedVendors(prev => ({
      ...prev,
      [type]: vendorId,
    }));
  };

  const getVendorStatus = (vendor: VendorWithStatus): "online" | "offline" | "pending" | "not_configured" => {
    if (!vendor.isConfigured) return "not_configured";
    // For now, configured vendors show as "online" - real status would come from connection tests
    return "online";
  };

  const types: VendorType[] = ["ASR", "LLM", "TTS"];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {types.map((type) => {
        const config = sectionConfig[type];
        const SectionIcon = config.icon;
        const typeVendors = vendorsByType[type];
        const configuredCount = typeVendors.filter((v) => v.isConfigured).length;
        
        return (
          <div key={type} className="terminal-panel overflow-hidden">
            <div className={`bg-gradient-to-b ${config.gradient} p-4 border-b border-border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SectionIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h2 className="font-display font-semibold text-foreground">{config.title}</h2>
                    <p className="text-xs text-muted-foreground">{config.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {configuredCount}/{typeVendors.length}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {typeVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  name={vendor.name}
                  type={vendor.type}
                  icon={typeIcons[vendor.type]}
                  status={getVendorStatus(vendor)}
                  isSelected={selectedVendors[type] === vendor.id}
                  isConfigured={vendor.isConfigured}
                  docsUrl={vendor.docsUrl}
                  onClick={() => toggleVendor(type, vendor.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VendorSection;