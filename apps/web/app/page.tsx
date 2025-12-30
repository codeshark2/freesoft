'use client';

import { useState, useCallback, useEffect } from 'react';
import { SessionMetrics } from '@voice-ai-tester/shared';
import { ApiKeyForm, ApiKeys, SessionConfig } from '@/components/ApiKeyForm';
import { SessionView } from '@/components/SessionView';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { TranscriptEntry } from '@/components/TranscriptDisplay';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

type AppState = 'setup' | 'session' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('setup');
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
    async (apiKeys: ApiKeys, systemPrompt: string, config: SessionConfig) => {
      setTranscriptEntries([]);
      setCurrentAssistantText('');
      setError(null);

      try {
        await Promise.race([
          ws.connect(),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000)
          )
        ]);
        ws.send({
          type: 'start_session',
          payload: {
            apiKeys,
            systemPrompt,
            config: {
              ttsProvider: config.ttsProvider,
              ttsVoice: config.ttsVoice,
            },
          },
          timestamp: Date.now(),
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        await audioCapture.startCapture((audioData) => {
          if (ws.isConnected) {
            ws.send({
              type: 'audio_chunk',
              payload: {
                audio: Buffer.from(audioData).toString('base64'),
              },
              timestamp: Date.now(),
            });
          }
        });
      } catch (error: any) {
        console.error('Session start error:', error);
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
    setAppState('setup');
    setTranscriptEntries([]);
    setCurrentAssistantText('');
    setMetrics(null);
    setError(null);
    ws.disconnect();
  }, [ws]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto">
        {appState === 'setup' && <ApiKeyForm onStart={handleStartSession} />}

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
          <div className="max-w-4xl mx-auto space-y-6">
            <MetricsDashboard metrics={metrics} />
            <Button onClick={handleReset} className="w-full" size="lg">
              Start New Session
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
