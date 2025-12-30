'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Timer } from './Timer';
import { TranscriptDisplay, TranscriptEntry } from './TranscriptDisplay';
import { Mic, MicOff } from 'lucide-react';

interface SessionViewProps {
  maxDuration: number;
  isActive: boolean;
  transcriptEntries: TranscriptEntry[];
  error: string | null;
  onEndSession: () => void;
}

export function SessionView({
  maxDuration,
  isActive,
  transcriptEntries,
  error,
  onEndSession,
}: SessionViewProps) {
  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header Section */}
      <div className="flex-shrink-0 p-6 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-lg font-semibold">Session Active</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Speak into your microphone to test the voice pipeline
            </p>
          </div>
          <Button
            onClick={onEndSession}
            variant="destructive"
            size="sm"
          >
            End Session
          </Button>
        </div>
        <div className="mt-4">
          <Timer maxDuration={maxDuration} isActive={isActive} />
        </div>
      </div>

      {/* Microphone Indicator */}
      <div className="flex-shrink-0 bg-background border-b py-6">
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 p-4 bg-background border-b">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Transcript Display - Scrollable */}
      <div className="flex-1 overflow-auto">
        <TranscriptDisplay entries={transcriptEntries} />
      </div>
    </div>
  );
}
