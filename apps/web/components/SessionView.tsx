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
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              Session Active
            </div>
          </CardTitle>
          <CardDescription>
            Speak into your microphone to test the voice pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Timer maxDuration={maxDuration} isActive={isActive} />

          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Mic className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={onEndSession}
            variant="destructive"
            className="w-full"
          >
            End Session
          </Button>
        </CardContent>
      </Card>

      <TranscriptDisplay entries={transcriptEntries} />
    </div>
  );
}
