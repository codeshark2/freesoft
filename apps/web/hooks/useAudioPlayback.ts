'use client';

import { useCallback, useRef, useState } from 'react';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  const initializeContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 44100 });
    }
  }, []);

  const playQueue = useCallback(() => {
    const context = audioContextRef.current;
    if (!context || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const buffer = audioQueueRef.current.shift();
    if (!buffer) return;

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    // Schedule playback
    const startTime = Math.max(context.currentTime, nextStartTimeRef.current);
    source.start(startTime);

    // Update next start time
    nextStartTimeRef.current = startTime + buffer.duration;

    // Play next in queue when this finishes
    source.onended = () => {
      playQueue();
    };
  }, []);

  const playAudio = useCallback(
    async (base64Audio: string) => {
      initializeContext();

      const context = audioContextRef.current;
      if (!context) {
        return;
      }

      try {
        // Decode base64 to array buffer
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Use browser's built-in audio decoder to handle any format (MP3, PCM, etc.)
        const audioBuffer = await context.decodeAudioData(bytes.buffer);

        // Add to queue
        audioQueueRef.current.push(audioBuffer);

        // Start playback if not already playing
        if (!isPlayingRef.current) {
          playQueue();
        }
      } catch (err) {
        console.error('[Audio Playback] Failed to decode audio:', err);
      }
    },
    [initializeContext, playQueue]
  );

  const stop = useCallback(() => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextStartTimeRef.current = 0;
    setIsPlaying(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return {
    isPlaying,
    playAudio,
    stop,
  };
}
