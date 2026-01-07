import { useState } from "react";
import { Mic, Brain, Volume2, Radio, Sparkles, AudioWaveform } from "lucide-react";
import VendorCard from "./VendorCard";

interface Vendor {
  id: string;
  name: string;
  type: "ASR" | "LLM" | "TTS";
  status: "online" | "offline" | "pending";
  latency?: number;
}

const vendors: Vendor[] = [
  // ASR Vendors
  { id: "deepgram", name: "Deepgram", type: "ASR", status: "online", latency: 120 },
  { id: "assemblyai", name: "AssemblyAI", type: "ASR", status: "online", latency: 150 },
  { id: "whisper", name: "OpenAI Whisper", type: "ASR", status: "online", latency: 200 },
  { id: "azure-stt", name: "Azure Speech", type: "ASR", status: "pending" },
  
  // LLM Vendors
  { id: "openai", name: "OpenAI GPT-4", type: "LLM", status: "online", latency: 450 },
  { id: "claude", name: "Anthropic Claude", type: "LLM", status: "online", latency: 380 },
  { id: "gemini", name: "Google Gemini", type: "LLM", status: "pending" },
  
  // TTS Vendors
  { id: "elevenlabs", name: "ElevenLabs", type: "TTS", status: "online", latency: 180 },
  { id: "openai-tts", name: "OpenAI TTS", type: "TTS", status: "online", latency: 220 },
  { id: "playht", name: "PlayHT", type: "TTS", status: "pending" },
  { id: "azure-tts", name: "Azure TTS", type: "TTS", status: "offline" },
];

const typeIcons = {
  ASR: Mic,
  LLM: Brain,
  TTS: Volume2,
};

const sectionConfig = {
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
  const [selectedVendors, setSelectedVendors] = useState<Record<string, string>>({
    ASR: "deepgram",
    LLM: "openai",
    TTS: "elevenlabs",
  });

  const toggleVendor = (type: "ASR" | "LLM" | "TTS", vendorId: string) => {
    setSelectedVendors(prev => ({
      ...prev,
      [type]: vendorId,
    }));
  };

  const types: Array<"ASR" | "LLM" | "TTS"> = ["ASR", "LLM", "TTS"];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {types.map((type) => {
        const config = sectionConfig[type];
        const SectionIcon = config.icon;
        const typeVendors = vendors.filter(v => v.type === type);
        
        return (
          <div key={type} className="terminal-panel overflow-hidden">
            <div className={`bg-gradient-to-b ${config.gradient} p-4 border-b border-border`}>
              <div className="flex items-center gap-2">
                <SectionIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h2 className="font-display font-semibold text-foreground">{config.title}</h2>
                  <p className="text-xs text-muted-foreground">{config.subtitle}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {typeVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  name={vendor.name}
                  type={vendor.type}
                  icon={typeIcons[vendor.type]}
                  status={vendor.status}
                  latency={vendor.latency}
                  isSelected={selectedVendors[type] === vendor.id}
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
