'use client';

import { useCallback, useRef, useState } from 'react';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
      currentSourceRef.current = null;
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const buffer = audioQueueRef.current.shift();
    if (!buffer) return;

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    currentSourceRef.current = source;

    // Schedule playback
    const startTime = Math.max(context.currentTime, nextStartTimeRef.current);
    source.start(startTime);

    // Update next start time
    nextStartTimeRef.current = startTime + buffer.duration;

    // Play next in queue when this finishes
    source.onended = () => {
      currentSourceRef.current = null;
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

  const interrupt = useCallback(() => {
    console.log('[Audio Playback] Interrupting - stopping current audio');

    // Stop current playing source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      currentSourceRef.current = null;
    }

    // Clear the queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    interrupt();

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [interrupt]);

  return {
    isPlaying,
    playAudio,
    stop,
    interrupt,
  };
}
