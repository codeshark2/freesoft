'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface ApiKeys {
  deepgram: string;
  openai: string;
  elevenlabs?: string;
}

export interface SessionConfig {
  ttsProvider: 'openai-tts' | 'elevenlabs';
  ttsVoice?: string;
}

interface ApiKeyFormProps {
  onStart: (apiKeys: ApiKeys, systemPrompt: string, config: SessionConfig) => void;
}

export function ApiKeyForm({ onStart }: ApiKeyFormProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    deepgram: '',
    openai: '',
    elevenlabs: '',
  });
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. Respond concisely and naturally in conversation.'
  );
  const [ttsProvider, setTtsProvider] = useState<'openai-tts' | 'elevenlabs'>('openai-tts');
  const [ttsVoice, setTtsVoice] = useState<string>('alloy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(apiKeys, systemPrompt, {
      ttsProvider,
      ttsVoice,
    });
  };

  const isValid =
    apiKeys.deepgram &&
    apiKeys.openai &&
    (ttsProvider === 'openai-tts' || apiKeys.elevenlabs) &&
    systemPrompt;

  // OpenAI TTS voices
  const openaiVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  // ElevenLabs voices (common ones)
  const elevenLabsVoices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Voice AI Testing Tool</CardTitle>
          <CardDescription>
            Test your voice pipeline with real-time ASR → LLM → TTS processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Privacy Notice</AlertTitle>
              <AlertDescription>
                Your API keys are sent directly to the respective providers and
                are never stored. They exist only in memory during your session.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deepgram">Deepgram API Key</Label>
                <Input
                  id="deepgram"
                  type="password"
                  placeholder="Enter your Deepgram API key"
                  value={apiKeys.deepgram}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, deepgram: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai">OpenAI API Key</Label>
                <Input
                  id="openai"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={apiKeys.openai}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, openai: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttsProvider">TTS Provider</Label>
                <Select
                  value={ttsProvider}
                  onValueChange={(value: 'openai-tts' | 'elevenlabs') => {
                    setTtsProvider(value);
                    setTtsVoice(value === 'openai-tts' ? 'alloy' : '21m00Tcm4TlvDq8ikWAM');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai-tts">
                      OpenAI TTS (Recommended - $15/1M chars)
                    </SelectItem>
                    <SelectItem value="elevenlabs">
                      ElevenLabs (Premium quality)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttsVoice">Voice</Label>
                <Select value={ttsVoice} onValueChange={setTtsVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ttsProvider === 'openai-tts'
                      ? openaiVoices.map((voice) => (
                          <SelectItem key={voice} value={voice}>
                            {voice.charAt(0).toUpperCase() + voice.slice(1)}
                          </SelectItem>
                        ))
                      : elevenLabsVoices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              {ttsProvider === 'elevenlabs' && (
                <div className="space-y-2">
                  <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
                  <Input
                    id="elevenlabs"
                    type="password"
                    placeholder="Enter your ElevenLabs API key"
                    value={apiKeys.elevenlabs}
                    onChange={(e) =>
                      setApiKeys({ ...apiKeys, elevenlabs: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Define how the AI should behave..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={!isValid} className="w-full">
              Start Session
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
