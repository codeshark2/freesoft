'use client';

import { useCallback, useRef, useState } from 'react';

export function useAudioCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startCapture = useCallback(
    async (onAudioData: (data: ArrayBuffer) => void) => {
      try {
        console.log('[Audio] Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        console.log('[Audio] Microphone access granted, stream active:', stream.active);
        streamRef.current = stream;

        // Monitor stream status
        stream.getTracks().forEach((track) => {
          const settings = track.getSettings();
          console.log('[Audio] Track:', track.label, 'enabled:', track.enabled, 'muted:', track.muted);
          console.log('[Audio] Track settings:', settings);

          track.onended = () => {
            console.error('[Audio] Track ended unexpectedly!');
            setError('Microphone stopped unexpectedly');
            setIsCapturing(false);
          };

          track.onmute = () => {
            console.warn('[Audio] Track muted!');
          };

          track.onunmute = () => {
            console.log('[Audio] Track unmuted');
          };
        });

        // Use native sample rate instead of forcing 16000Hz
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        console.log('[Audio] AudioContext created, state:', audioContext.state, 'sampleRate:', audioContext.sampleRate);

        if (audioContext.state === 'suspended') {
          console.log('[Audio] Resuming suspended AudioContext...');
          await audioContext.resume();
        }

        console.log('[Audio] Loading audio worklet module...');
        await audioContext.audioWorklet.addModule('/audio-processor.js');

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        console.log('[Audio] MediaStreamSource created');

        const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');
        workletNodeRef.current = workletNode;
        console.log('[Audio] AudioWorkletNode created');

        let chunkCount = 0;
        workletNode.port.onmessage = (event) => {
          chunkCount++;
          if (chunkCount % 50 === 0) {
            console.log('[Audio] Received', chunkCount, 'audio chunks');
          }
          onAudioData(event.data);
        };

        source.connect(workletNode);
        workletNode.connect(audioContext.destination);

        console.log('[Audio] Audio pipeline connected successfully');
        setIsCapturing(true);
        setError(null);
      } catch (err: any) {
        console.error('[Audio] Failed to access microphone:', err);
        setError(err.message || 'Failed to access microphone');
        throw err;
      }
    },
    []
  );

  const stopCapture = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsCapturing(false);
  }, []);

  return {
    isCapturing,
    error,
    startCapture,
    stopCapture,
  };
}
