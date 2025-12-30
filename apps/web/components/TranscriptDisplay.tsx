'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export interface TranscriptEntry {
  speaker: 'user' | 'assistant';
  text: string;
  isFinal: boolean;
  timestamp: number;
}

interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
}

export function TranscriptDisplay({ entries }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-96 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg"
        >
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Start speaking to see the transcript...
            </p>
          ) : (
            entries.map((entry, index) => (
              <div
                key={index}
                className={`flex ${
                  entry.speaker === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    entry.speaker === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  } ${!entry.isFinal ? 'opacity-60 italic' : ''}`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {entry.speaker === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm">{entry.text}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
