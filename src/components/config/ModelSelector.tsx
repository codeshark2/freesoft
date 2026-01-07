import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VendorConfig, VendorType, ASRModelConfig, LLMModelConfig, TTSModelConfig, VendorSelection } from '@/lib/vendors/types';
import { cn } from '@/lib/utils';
import { Zap, Scale, Gem } from 'lucide-react';

interface ModelSelectorProps {
  vendor: VendorConfig;
  selection: VendorSelection;
  onSelectionChange: (selection: VendorSelection) => void;
  compact?: boolean;
}

const tierIcons = {
  fast: Zap,
  balanced: Scale,
  quality: Gem,
};

const tierColors = {
  fast: 'text-accent',
  balanced: 'text-secondary',
  quality: 'text-primary',
};

export const ModelSelector = ({ vendor, selection, onSelectionChange, compact = false }: ModelSelectorProps) => {
  const config = vendor.modelConfig;
  const isASR = vendor.type === 'ASR';
  const isTTS = vendor.type === 'TTS';

  const handleModelChange = (modelId: string) => {
    onSelectionChange({ ...selection, modelId });
  };

  const handleLanguageChange = (languageCode: string) => {
    onSelectionChange({ ...selection, languageCode });
  };

  const handleVoiceChange = (voiceId: string) => {
    onSelectionChange({ ...selection, voiceId });
  };

  const models = config.models;
  const languages = isASR ? (config as ASRModelConfig).languages : [];
  const voices = isTTS ? (config as TTSModelConfig).voices : [];

  const selectedModel = useMemo(() => 
    models.find(m => m.id === selection.modelId), 
    [models, selection.modelId]
  );

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Select value={selection.modelId} onValueChange={handleModelChange}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] bg-muted/50 border-border text-xs">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => {
              const TierIcon = model.tier ? tierIcons[model.tier] : null;
              return (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  <span className="flex items-center gap-2">
                    {TierIcon && <TierIcon className={cn('w-3 h-3', tierColors[model.tier!])} />}
                    {model.name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {isASR && languages.length > 0 && (
          <Select value={selection.languageCode || 'en-US'} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-8 w-auto min-w-[100px] bg-muted/50 border-border text-xs">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isTTS && voices.length > 0 && (
          <Select value={selection.voiceId || voices[0]?.id} onValueChange={handleVoiceChange}>
            <SelectTrigger className="h-8 w-auto min-w-[100px] bg-muted/50 border-border text-xs">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id} className="text-xs">
                  {voice.name} {voice.gender && `(${voice.gender})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Model</label>
        <Select value={selection.modelId} onValueChange={handleModelChange}>
          <SelectTrigger className="bg-muted/50 border-border">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => {
              const TierIcon = model.tier ? tierIcons[model.tier] : null;
              return (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-3">
                    {TierIcon && <TierIcon className={cn('w-4 h-4', tierColors[model.tier!])} />}
                    <div>
                      <span className="font-medium">{model.name}</span>
                      {model.description && (
                        <span className="text-muted-foreground text-xs ml-2">— {model.description}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {selectedModel && (
          <div className="flex gap-2">
            {selectedModel.tier && (
              <Badge variant="outline" className="text-xs">
                {selectedModel.tier}
              </Badge>
            )}
            {selectedModel.costTier && (
              <Badge variant="outline" className="text-xs">
                {selectedModel.costTier} cost
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Language Selection (ASR only) */}
      {isASR && languages.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Language</label>
          <Select value={selection.languageCode || 'en-US'} onValueChange={handleLanguageChange}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Voice Selection (TTS only) */}
      {isTTS && voices.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voice</label>
          <Select value={selection.voiceId || voices[0]?.id} onValueChange={handleVoiceChange}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center gap-2">
                    <span>{voice.name}</span>
                    {voice.gender && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {voice.gender}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
