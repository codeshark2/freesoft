'use client';

import { useState, useCallback, useEffect } from 'react';
import { SessionMetrics } from '@voice-ai-tester/shared';
import { ApiKeys, SessionConfig } from '@/components/ApiKeyForm';
import { ApiKeyPanel } from '@/components/ApiKeyPanel';
import { WelcomeView } from '@/components/WelcomeView';
import { SessionView } from '@/components/SessionView';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { TranscriptEntry } from '@/components/TranscriptDisplay';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

type AppState = 'welcome' | 'session' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [config, setConfig] = useState<SessionConfig>({
    sttProvider: 'deepgram',
    llmProvider: 'openai',
    llmModel: 'gpt-4.1',
    ttsProvider: 'openai-tts',
    ttsModel: 'tts-1'
  });
  const [maxDuration, setMaxDuration] = useState(60);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    []
  );
  const [currentAssistantText, setCurrentAssistantText] = useState('');
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ws = useWebSocket();
  const audioCapture = useAudioCapture();
  const audioPlayback = useAudioPlayback();

  // Display audio capture errors
  useEffect(() => {
    if (audioCapture.error) {
      setError(`Microphone error: ${audioCapture.error}`);
    }
  }, [audioCapture.error]);

  // Handle WebSocket messages
  useEffect(() => {
    ws.on('session_started', (message) => {
      setMaxDuration(message.payload.maxDuration);
      setAppState('session');
      setError(null);
    });

    ws.on('transcript_partial', (message) => {
      // Interrupt audio playback when user starts speaking
      if (audioPlayback.isPlaying) {
        console.log('[Session] User started speaking - interrupting AI audio');
        audioPlayback.interrupt();
      }

      // Update or add partial transcript
      setTranscriptEntries((prev) => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.speaker === 'user' && !lastEntry.isFinal) {
          return [
            ...prev.slice(0, -1),
            { ...lastEntry, text: message.payload.text },
          ];
        }
        return [
          ...prev,
          {
            speaker: 'user',
            text: message.payload.text,
            isFinal: false,
            timestamp: message.timestamp,
          },
        ];
      });
    });

    ws.on('transcript_final', (message) => {
      setTranscriptEntries((prev) => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.speaker === 'user' && !lastEntry.isFinal) {
          return [
            ...prev.slice(0, -1),
            { ...lastEntry, text: message.payload.text, isFinal: true },
          ];
        }
        return [
          ...prev,
          {
            speaker: 'user',
            text: message.payload.text,
            isFinal: true,
            timestamp: message.timestamp,
          },
        ];
      });
    });

    ws.on('llm_token', (message) => {
      if (message.payload.isComplete) {
        // Finalize assistant message
        setTranscriptEntries((prev) => {
          const lastEntry = prev[prev.length - 1];
          if (
            lastEntry &&
            lastEntry.speaker === 'assistant' &&
            !lastEntry.isFinal
          ) {
            return [
              ...prev.slice(0, -1),
              { ...lastEntry, isFinal: true },
            ];
          }
          return prev;
        });
        setCurrentAssistantText('');
      } else {
        // Accumulate tokens
        const newText = currentAssistantText + message.payload.token;
        setCurrentAssistantText(newText);

        setTranscriptEntries((prev) => {
          const lastEntry = prev[prev.length - 1];
          if (
            lastEntry &&
            lastEntry.speaker === 'assistant' &&
            !lastEntry.isFinal
          ) {
            return [
              ...prev.slice(0, -1),
              { ...lastEntry, text: newText },
            ];
          }
          return [
            ...prev,
            {
              speaker: 'assistant',
              text: newText,
              isFinal: false,
              timestamp: message.timestamp,
            },
          ];
        });
      }
    });

    ws.on('tts_audio', (message) => {
      audioPlayback.playAudio(message.payload.audio);
    });

    ws.on('session_ended', (message) => {
      setMetrics(message.payload.metrics);
      setAppState('results');
      audioCapture.stopCapture();
      audioPlayback.stop();
    });

    ws.on('error', (message) => {
      setError(message.payload.message);
    });

    return () => {
      ws.off('session_started');
      ws.off('transcript_partial');
      ws.off('transcript_final');
      ws.off('llm_token');
      ws.off('tts_audio');
      ws.off('session_ended');
      ws.off('error');
    };
  }, [ws, audioCapture, audioPlayback, currentAssistantText]);

  const handleStartSession = useCallback(
    async (keys: ApiKeys, prompt: string, sessionConfig: SessionConfig) => {
      console.log('[Session] Starting session with config:', sessionConfig);

      // Save configuration to state
      setApiKeys(keys);
      setSystemPrompt(prompt);
      setConfig(sessionConfig);
      setTranscriptEntries([]);
      setCurrentAssistantText('');
      setError(null);

      try {
        console.log('[Session] Connecting to WebSocket...');
        await Promise.race([
          ws.connect(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000)
          )
        ]);

        console.log('[Session] WebSocket connected, sending start_session message...');
        ws.send({
          type: 'start_session',
          payload: {
            apiKeys: keys,
            systemPrompt: prompt,
            config: {
              sttProvider: sessionConfig.sttProvider,
              llmProvider: sessionConfig.llmProvider,
              llmModel: sessionConfig.llmModel,
              ttsProvider: sessionConfig.ttsProvider,
              ttsModel: sessionConfig.ttsModel,
            },
          },
          timestamp: Date.now(),
        });

        console.log('[Session] Waiting 500ms for server initialization...');
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[Session] Starting audio capture...');
        let audioChunksSent = 0;
        await audioCapture.startCapture((audioData) => {
          // Convert ArrayBuffer to base64 (browser-compatible)
          const uint8Array = new Uint8Array(audioData);
          let binaryString = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
          }
          const base64Audio = btoa(binaryString);

          audioChunksSent++;
          if (audioChunksSent % 50 === 0) {
            console.log('[Session] Sent', audioChunksSent, 'audio chunks to server');
          }

          ws.send({
            type: 'audio_chunk',
            payload: {
              audio: base64Audio,
            },
            timestamp: Date.now(),
          });
        });

        console.log('[Session] Audio capture started successfully!');
      } catch (error: any) {
        console.error('[Session] Session start error:', error);
        setError(error.message || 'Failed to connect to server');
      }
    },
    [ws, audioCapture]
  );

  const handleEndSession = useCallback(() => {
    ws.send({
      type: 'end_session',
      payload: {},
      timestamp: Date.now(),
    });
    audioCapture.stopCapture();
    audioPlayback.stop();
  }, [ws, audioCapture, audioPlayback]);

  const handleReset = useCallback(() => {
    setAppState('welcome');
    setTranscriptEntries([]);
    setCurrentAssistantText('');
    setMetrics(null);
    setError(null);
    ws.disconnect();
  }, [ws]);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - API Key Panel */}
      <div className="w-[400px] border-r flex-shrink-0">
        <ApiKeyPanel
          apiKeys={apiKeys}
          systemPrompt={systemPrompt}
          config={config}
          isSessionActive={appState === 'session'}
          onStart={handleStartSession}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {appState === 'welcome' && <WelcomeView />}

        {appState === 'session' && (
          <SessionView
            maxDuration={maxDuration}
            isActive={true}
            transcriptEntries={transcriptEntries}
            error={error}
            onEndSession={handleEndSession}
          />
        )}

        {appState === 'results' && metrics && (
          <div className="h-full overflow-auto p-12">
            <div className="max-w-4xl mx-auto space-y-6">
              <MetricsDashboard metrics={metrics} />
              <Button onClick={handleReset} className="w-full" size="lg">
                Start New Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
