import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isActive?: boolean;
  barCount?: number;
}

const WaveformVisualizer = ({ isActive = false, barCount = 32 }: WaveformVisualizerProps) => {
  const [heights, setHeights] = useState<number[]>(new Array(barCount).fill(20));

  useEffect(() => {
    if (!isActive) {
      setHeights(new Array(barCount).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, () => 
          Math.random() * 80 + 20
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div className="terminal-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Audio Waveform
        </span>
        <span className={`text-xs ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
          {isActive ? '● Recording' : '○ Idle'}
        </span>
      </div>
      <div className="flex items-end justify-center gap-[2px] h-16">
        {heights.map((height, index) => (
          <div
            key={index}
            className="w-1 rounded-full transition-all duration-100"
            style={{
              height: `${height}%`,
              background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--secondary)))`,
              opacity: isActive ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaveformVisualizer;
