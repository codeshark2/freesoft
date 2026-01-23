import { useState, useCallback, useEffect } from "react";
import { Play, Square, RotateCcw, Terminal, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoiceSession, SessionState, Turn, SessionSummary, SessionConfig } from "@/lib/voice/VoiceSession";
import { VendorSelection } from "@/lib/vendors/types";
import { getVendorConfig } from "@/lib/storage/apiKeyStorage";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "user" | "assistant" | "metric";
  message: string;
}

const logTypeStyles = {
  info: "text-muted-foreground",
  success: "text-accent",
  error: "text-destructive",
  user: "text-primary",
  assistant: "text-cyan-400",
  metric: "text-yellow-400",
};

interface TestConsoleProps {
  selectedVendors: {
    ASR: VendorSelection | null;
    LLM: VendorSelection | null;
    TTS: VendorSelection | null;
  };
}

const TestConsole = ({ selectedVendors }: TestConsoleProps) => {
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const now = new Date();
    const timestamp = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    setLogs(prev => [...prev, { id: crypto.randomUUID(), timestamp, type, message }]);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const formatMetric = (ms: number) => {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const isConfigured = selectedVendors.ASR && selectedVendors.LLM && selectedVendors.TTS;

  const handleStart = useCallback(async () => {
    if (!selectedVendors.ASR || !selectedVendors.LLM || !selectedVendors.TTS) {
      addLog('error', 'Please configure ASR, LLM, and TTS vendors first');
      return;
    }

    // Get vendor configs
    const asrConfig = getVendorConfig(selectedVendors.ASR.vendorId);
    const llmConfig = getVendorConfig(selectedVendors.LLM.vendorId);
    const ttsConfig = getVendorConfig(selectedVendors.TTS.vendorId);

    if (!asrConfig?.apiKey || !llmConfig?.apiKey || !ttsConfig?.apiKey) {
      addLog('error', 'Missing API keys. Please configure all vendors in Settings.');
      return;
    }

    setLogs([]);
    setSummary(null);
    setTimeRemaining(60000);

    const sessionConfig: SessionConfig = {
      asr: {
        vendorId: selectedVendors.ASR.vendorId,
        apiKey: asrConfig.apiKey,
        model: selectedVendors.ASR.modelId,
        languageCode: selectedVendors.ASR.languageCode || 'en-US',
        region: asrConfig.region,
      },
      llm: {
        vendorId: selectedVendors.LLM.vendorId,
        apiKey: llmConfig.apiKey,
        model: selectedVendors.LLM.modelId,
      },
      tts: {
        vendorId: selectedVendors.TTS.vendorId,
        apiKey: ttsConfig.apiKey,
        model: selectedVendors.TTS.modelId,
        voiceId: selectedVendors.TTS.voiceId || 'alloy',
        userId: ttsConfig.userId,
      },
      maxDuration: 60000,
    };

    const newSession = new VoiceSession(sessionConfig);
    setSession(newSession);

    addLog('info', 'Initializing voice pipeline...');

    try {
      await newSession.start({
        onStateChange: (state) => {
          setSessionState(state);
        },
        onTurnStart: () => {
          addLog('info', 'Connected to Deepgram. Listening...');
        },
        onInterimTranscript: (text) => {
          // Update last log if it's an interim transcript, otherwise just show in UI
          // For now, we'll skip logging interim to avoid clutter
        },
        onTranscript: (text, metrics) => {
          addLog('user', `You: "${text}"`);
          addLog('metric', `ASR: TTFB ${formatMetric(metrics.ttfb)} | Total ${formatMetric(metrics.total)}`);
        },
        onResponse: (text, metrics) => {
          addLog('assistant', `Assistant: "${text}"`);
          addLog('metric', `LLM: TTFB ${formatMetric(metrics.ttfb)} | Total ${formatMetric(metrics.total)}`);
        },
        onAudioStart: (metrics) => {
          addLog('metric', `TTS: TTFB ${formatMetric(metrics.ttfb)} | Total ${formatMetric(metrics.total)}`);
        },
        onTurnComplete: (turn) => {
          addLog('success', `Turn ${turn.id} complete | Round trip: ${formatMetric(turn.metrics.roundTrip)}`);
        },
        onTimeUpdate: (remaining) => {
          setTimeRemaining(remaining);
        },
        onSessionEnd: (sessionSummary) => {
          setSummary(sessionSummary);
          addLog('info', `Session ended. ${sessionSummary.turns.length} turns completed.`);
        },
        onError: (error, stage) => {
          addLog('error', `${stage.toUpperCase()} Error: ${error.message}`);
        },
      });

      addLog('success', 'Pipeline ready. Start speaking...');
    } catch (error) {
      addLog('error', `Failed to start: ${(error as Error).message}`);
      setSessionState('error');
    }
  }, [selectedVendors, addLog]);

  const handleStop = useCallback(() => {
    session?.stop();
    setSession(null);
    setSessionState('idle');
  }, [session]);

  const handleClear = useCallback(() => {
    setLogs([]);
    setSummary(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      session?.stop();
    };
  }, [session]);

  const isRunning = sessionState !== 'idle' && sessionState !== 'error';

  return (
    <div className="terminal-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-sm">Test Console</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <span className="h-2 w-2 rounded-full status-online animate-pulse" />
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleStop}
              className="h-7 text-xs"
            >
              <Square className="mr-1 h-3 w-3" />
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleStart}
              disabled={!isConfigured}
              className="h-7 text-xs cyber-button"
            >
              <Play className="mr-1 h-3 w-3" />
              Run Test
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="h-7 text-xs text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {isRunning && (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {sessionState === 'listening' && <Mic className="h-4 w-4 text-accent animate-pulse" />}
            {sessionState === 'processing' && <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />}
            {sessionState === 'speaking' && <MicOff className="h-4 w-4 text-primary" />}
            <span className="text-xs capitalize">{sessionState}</span>
          </div>
          <span className="text-xs text-muted-foreground">Deepgram VAD</span>
        </div>
      )}

      {/* Logs */}
      <div className="flex-1 overflow-auto p-3 font-mono text-sm bg-terminal-bg">
        {logs.length === 0 && !summary ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            {!isConfigured ? (
              <>
                <MicOff className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Configure ASR, LLM, and TTS to start testing</span>
              </>
            ) : (
              <>
                <Mic className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Click "Run Test" to begin</span>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {logs.filter(Boolean).map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-muted-foreground/50 shrink-0">
                  [{log.timestamp}]
                </span>
                <span className={cn(logTypeStyles[log.type])}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && summary.turns.length > 0 && (
        <div className="border-t border-border p-3 bg-muted/30">
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Session Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">Turns:</span>{' '}
              <span className="text-foreground">{summary.turns.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>{' '}
              <span className="text-foreground">{formatMetric(summary.totalDuration)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg ASR:</span>{' '}
              <span className="text-accent">{formatMetric(summary.averageMetrics.asr.total)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg LLM:</span>{' '}
              <span className="text-yellow-400">{formatMetric(summary.averageMetrics.llm.total)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg TTS:</span>{' '}
              <span className="text-primary">{formatMetric(summary.averageMetrics.tts.total)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Round Trip:</span>{' '}
              <span className="text-cyan-400">{formatMetric(summary.averageMetrics.roundTrip)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestConsole;
