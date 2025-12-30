'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  maxDuration: number; // in seconds
  isActive: boolean;
}

export function Timer({ maxDuration, isActive }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(newElapsed);

      if (newElapsed >= maxDuration) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, maxDuration]);

  const remaining = Math.max(0, maxDuration - elapsed);
  const progress = (elapsed / maxDuration) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Session Time</span>
        <span
          className={`font-mono font-semibold ${
            remaining <= 10 ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {remaining}s
        </span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            remaining <= 10 ? 'bg-destructive' : 'bg-primary'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
