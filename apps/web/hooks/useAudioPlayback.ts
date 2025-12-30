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

        // Convert PCM data to AudioBuffer
        // ElevenLabs PCM format: 16kHz, 16-bit signed int, mono
        const sampleRate = 16000;
        const numberOfChannels = 1;

        // Convert bytes to Int16Array (16-bit samples)
        const samples = new Int16Array(bytes.buffer);
        const numberOfSamples = samples.length;

        // Create AudioBuffer
        const audioBuffer = context.createBuffer(
          numberOfChannels,
          numberOfSamples,
          sampleRate
        );

        // Get channel data and convert Int16 to Float32 (range -1.0 to 1.0)
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < numberOfSamples; i++) {
          channelData[i] = samples[i] / 32768.0; // Convert to float -1.0 to 1.0
        }

        // Add to queue
        audioQueueRef.current.push(audioBuffer);

        // Start playback if not already playing
        if (!isPlayingRef.current) {
          playQueue();
        }
      } catch (err) {
        // Silently fail
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
