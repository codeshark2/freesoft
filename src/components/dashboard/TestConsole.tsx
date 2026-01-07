import { useState, useEffect } from "react";
import { Play, Square, RotateCcw, Terminal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "stream";
  message: string;
}

const mockLogs: LogEntry[] = [
  { id: "1", timestamp: "00:00.000", type: "info", message: "Initializing voice pipeline..." },
  { id: "2", timestamp: "00:00.120", type: "success", message: "ASR: Deepgram connected (120ms)" },
  { id: "3", timestamp: "00:00.450", type: "success", message: "LLM: OpenAI GPT-4 ready (330ms)" },
  { id: "4", timestamp: "00:00.680", type: "success", message: "TTS: ElevenLabs initialized (230ms)" },
  { id: "5", timestamp: "00:00.700", type: "info", message: "Pipeline ready. Waiting for input..." },
];

const logTypeStyles = {
  info: "text-muted-foreground",
  success: "text-accent",
  error: "text-destructive",
  stream: "text-primary",
};

const TestConsole = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isRunning) {
      // Simulate streaming logs
      let index = 0;
      const interval = setInterval(() => {
        if (index < mockLogs.length) {
          setLogs(prev => [...prev, mockLogs[index]]);
          index++;
        } else {
          clearInterval(interval);
          setIsRunning(false);
        }
      }, 400);
      
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleStart = () => {
    setLogs([]);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleClear = () => {
    setLogs([]);
  };

  return (
    <div className="terminal-panel h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-sm">Test Console</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <span className="h-2 w-2 rounded-full status-online animate-pulse" />
              Running
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
      
      <div className="flex-1 overflow-auto p-3 font-mono text-sm bg-terminal-bg">
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-4 w-4 text-primary" />
            <span className="opacity-50">Ready for input...</span>
            <span className="inline-block w-2 h-4 bg-primary animate-blink" />
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-muted-foreground/50 shrink-0">
                  [{log.timestamp}]
                </span>
                <span className={cn(logTypeStyles[log.type])}>
                  {log.message}
                </span>
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-primary">
                <span className="inline-block w-2 h-4 bg-primary animate-blink" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConsole;
