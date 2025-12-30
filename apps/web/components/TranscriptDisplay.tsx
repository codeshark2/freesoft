'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export interface TranscriptEntry {
  speaker: 'user' | 'assistant';
  text: string;
  isFinal: boolean;
  timestamp: number;
  service?: 'deepgram' | 'openai';
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
    <div className="p-6">
      <div
        ref={scrollRef}
        className="space-y-4 custom-scrollbar"
      >
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Start speaking to see the transcript...
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className={`flex ${
                entry.speaker === 'user' ? 'justify-end' : 'justify-start'
              } ${
                entry.speaker === 'user'
                  ? 'message-enter-user'
                  : 'message-enter-assistant'
              }`}
            >
              <div
                className={`max-w-[75%] ${
                  entry.speaker === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-green-100 dark:bg-green-900'
                } rounded-2xl px-4 py-3 shadow-sm ${
                  !entry.isFinal ? 'opacity-60 italic' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={entry.speaker === 'user' ? 'deepgram' : 'openai'}
                  >
                    {entry.speaker === 'user' ? 'STT' : 'LLM'}
                  </Badge>
                  {!entry.isFinal && (
                    <span className="text-xs text-muted-foreground">
                      (typing...)
                    </span>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-foreground">
                  {entry.text}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
