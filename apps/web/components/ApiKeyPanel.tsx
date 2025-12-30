'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { maskApiKey } from '@/lib/maskApiKey';
import { Settings, Check } from 'lucide-react';
import { ApiKeys, SessionConfig } from './ApiKeyForm';

interface ApiKeyPanelProps {
  apiKeys: ApiKeys | null;
  systemPrompt: string;
  config: SessionConfig;
  isSessionActive: boolean;
  onStart: (apiKeys: ApiKeys, systemPrompt: string, config: SessionConfig) => void;
}

export function ApiKeyPanel({
  apiKeys: existingKeys,
  systemPrompt: initialPrompt,
  config: initialConfig,
  isSessionActive,
  onStart,
}: ApiKeyPanelProps) {
  const [editMode, setEditMode] = useState(!existingKeys);
  const [openAccordion, setOpenAccordion] = useState<string>('stt');
  const [apiKeys, setApiKeys] = useState<ApiKeys>(
    existingKeys || {
      stt: '',
      llm: '',
      tts: '',
    }
  );
  const [systemPrompt, setSystemPrompt] = useState(
    initialPrompt || 'You are a helpful AI assistant. Respond concisely and naturally in conversation.'
  );
  const [sttProvider, setSttProvider] = useState<'deepgram' | 'assemblyai' | 'google-speech' | 'azure-speech'>(
    initialConfig?.sttProvider || 'deepgram'
  );
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic' | 'google-gemini'>(
    initialConfig?.llmProvider || 'openai'
  );
  const [llmModel, setLlmModel] = useState<string>(
    initialConfig?.llmModel || 'gpt-4.1'
  );
  const [ttsProvider, setTtsProvider] = useState<'openai-tts' | 'elevenlabs' | 'google-tts'>(
    initialConfig?.ttsProvider || 'openai-tts'
  );
  const [ttsModel, setTtsModel] = useState<string>(
    initialConfig?.ttsModel || 'tts-1'
  );

  // Model options for each LLM provider
  const llmModels = {
    'openai': ['gpt-4.1', 'gpt-5.2', 'o4-mini'],
    'anthropic': ['claude-sonnet-4.5', 'claude-opus-4.5', 'claude-opus-4.1'],
    'google-gemini': ['gemini-3-flash', 'gemini-3-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  };

  // Model options for each TTS provider
  const ttsModels = {
    'openai-tts': ['tts-1', 'tts-1-hd'],
    'elevenlabs': ['eleven_turbo_v2_5', 'eleven_multilingual_v2', 'eleven_flash_v2_5'],
    'google-tts': [],
  };

  // Check if each section is complete
  const isSttComplete = !!apiKeys.stt;
  const isLlmComplete = !!apiKeys.llm && !!llmModel;
  const isTtsComplete = ttsProvider === 'google-tts' || !!apiKeys.tts;

  const isValid = isSttComplete && isLlmComplete && isTtsComplete && !!systemPrompt;

  const handleStart = () => {
    console.log('handleStart called', {
      isValid,
      isSttComplete,
      isLlmComplete,
      isTtsComplete,
      apiKeys,
      systemPrompt,
      config: { sttProvider, llmProvider, llmModel, ttsProvider, ttsModel }
    });

    if (isValid) {
      onStart(apiKeys, systemPrompt, {
        sttProvider,
        llmProvider,
        llmModel,
        ttsProvider,
        ttsModel: ttsProvider !== 'google-tts' ? ttsModel : undefined
      });
      setEditMode(false);
    } else {
      console.log('Validation failed:', {
        isSttComplete,
        isLlmComplete,
        isTtsComplete,
        hasSystemPrompt: !!systemPrompt,
      });
    }
  };

  // Get provider display name
  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      'deepgram': 'Deepgram',
      'assemblyai': 'AssemblyAI',
      'google-speech': 'Google Speech',
      'azure-speech': 'Azure Speech',
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'google-gemini': 'Google Gemini',
      'openai-tts': 'OpenAI TTS',
      'elevenlabs': 'ElevenLabs',
      'google-tts': 'Google TTS',
    };
    return names[provider] || provider;
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-6 border-b bg-background">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </h2>
          {!editMode && !isSessionActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          )}
        </div>
        {isSessionActive && (
          <p className="text-sm text-muted-foreground">Session Active</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Accordion
          type="single"
          value={openAccordion}
          onValueChange={setOpenAccordion}
          collapsible
          disabled={isSessionActive}
          className="space-y-2"
        >
          {/* STT Configuration */}
          <AccordionItem value="stt" className="border rounded-lg bg-background">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">STT Configuration</span>
                  {isSttComplete && <Check className="h-4 w-4 text-green-600" />}
                </div>
                {isSttComplete && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{getProviderName(sttProvider)}</span>
                    <span>•</span>
                    <code className="font-mono">{maskApiKey(apiKeys.stt)}</code>
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stt-provider">Provider</Label>
                <Select
                  value={sttProvider}
                  onValueChange={(value: 'deepgram' | 'assemblyai' | 'google-speech' | 'azure-speech') => setSttProvider(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepgram">Deepgram</SelectItem>
                    <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                    <SelectItem value="google-speech">Google Speech-to-Text</SelectItem>
                    <SelectItem value="azure-speech">Azure Speech</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stt-key">API Key</Label>
                <Input
                  id="stt-key"
                  type="password"
                  placeholder={`Enter ${getProviderName(sttProvider)} API key`}
                  value={apiKeys.stt}
                  onChange={(e) => setApiKeys({ ...apiKeys, stt: e.target.value })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* LLM Configuration */}
          <AccordionItem value="llm" className="border rounded-lg bg-background">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">LLM Configuration</span>
                  {isLlmComplete && <Check className="h-4 w-4 text-green-600" />}
                </div>
                {isLlmComplete && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{getProviderName(llmProvider)}</span>
                    <span>•</span>
                    <span>{llmModel}</span>
                    <span>•</span>
                    <code className="font-mono">{maskApiKey(apiKeys.llm)}</code>
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="llm-provider">Provider</Label>
                <Select
                  value={llmProvider}
                  onValueChange={(value: 'openai' | 'anthropic' | 'google-gemini') => {
                    setLlmProvider(value);
                    setLlmModel(llmModels[value][0]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google-gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-model">Model</Label>
                <Select value={llmModel} onValueChange={setLlmModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {llmModels[llmProvider].map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm-key">API Key</Label>
                <Input
                  id="llm-key"
                  type="password"
                  placeholder={`Enter ${getProviderName(llmProvider)} API key`}
                  value={apiKeys.llm}
                  onChange={(e) => setApiKeys({ ...apiKeys, llm: e.target.value })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* TTS Configuration */}
          <AccordionItem value="tts" className="border rounded-lg bg-background">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">TTS Configuration</span>
                  {isTtsComplete && <Check className="h-4 w-4 text-green-600" />}
                </div>
                {isTtsComplete && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{getProviderName(ttsProvider)}</span>
                    {ttsProvider !== 'google-tts' && (
                      <>
                        <span>•</span>
                        <span>{ttsModel}</span>
                        <span>•</span>
                        <code className="font-mono">{maskApiKey(apiKeys.tts || '')}</code>
                      </>
                    )}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tts-provider">Provider</Label>
                <Select
                  value={ttsProvider}
                  onValueChange={(value: 'openai-tts' | 'elevenlabs' | 'google-tts') => {
                    setTtsProvider(value);
                    if (ttsModels[value].length > 0) {
                      setTtsModel(ttsModels[value][0]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai-tts">OpenAI TTS</SelectItem>
                    <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    <SelectItem value="google-tts">Google TTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ttsProvider !== 'google-tts' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tts-model">Model</Label>
                    <Select value={ttsModel} onValueChange={setTtsModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ttsModels[ttsProvider].map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tts-key">API Key</Label>
                    <Input
                      id="tts-key"
                      type="password"
                      placeholder={`Enter ${getProviderName(ttsProvider)} API key`}
                      value={apiKeys.tts || ''}
                      onChange={(e) => setApiKeys({ ...apiKeys, tts: e.target.value })}
                    />
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* System Prompt Section */}
        <div className="space-y-2">
          <Label htmlFor="prompt">System Prompt</Label>
          <Textarea
            id="prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            disabled={isSessionActive}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Privacy:</p>
          <p>API keys are never stored and exist only in memory during your session.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-background">
        {editMode ? (
          <div className="space-y-3">
            {!isValid && (
              <div className="text-xs text-destructive">
                Please complete all required configurations:
                {!isSttComplete && <div>• STT Configuration</div>}
                {!isLlmComplete && <div>• LLM Configuration</div>}
                {!isTtsComplete && <div>• TTS Configuration</div>}
                {!systemPrompt && <div>• System Prompt</div>}
              </div>
            )}
            <Button
              onClick={handleStart}
              disabled={!isValid || isSessionActive}
              className="w-full"
            >
              {existingKeys ? 'Update & Start Session' : 'Start Session'}
            </Button>
            {existingKeys && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setApiKeys(existingKeys);
                }}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={() => setEditMode(true)} disabled={isSessionActive} className="w-full">
            Start New Session
          </Button>
        )}
      </div>
    </div>
  );
}
