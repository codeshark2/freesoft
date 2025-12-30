'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ClientMessage, ServerMessage } from '@voice-ai-tester/shared';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (message: any) => void>>(
    new Map()
  );

  const connect = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If already open, just update state and return
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        setIsConnected(true);
        resolve();
        return;
      }

      // If already connecting, wait for it
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        // Wait for existing connection to complete
        const checkInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            clearInterval(checkInterval);
            setIsConnected(true);
            resolve();
          } else if (wsRef.current?.readyState === WebSocket.CLOSED) {
            clearInterval(checkInterval);
            reject(new Error('WebSocket connection failed'));
          }
        }, 100);
        return;
      }

      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Use environment variable in dev, auto-detect in production
      let wsUrl: string;

      if (process.env.NEXT_PUBLIC_WS_URL) {
        // Development: use explicit WebSocket URL
        wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      } else {
        // Use relative WebSocket URL (same host that served the page) unless overridden by env var
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}`;
      }

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        resolve();
      };

      ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);

          // Call type-specific handler if registered
          const handler = messageHandlersRef.current.get(message.type);
          if (handler) {
            handler(message);
          }

          // Also call generic handler
          const genericHandler = messageHandlersRef.current.get('*');
          if (genericHandler) {
            genericHandler(message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket error occurred');
        console.error('WebSocket error:', event);
        reject(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
      };

      wsRef.current = ws;
    });
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const on = useCallback(
    (type: string, handler: (message: any) => void) => {
      messageHandlersRef.current.set(type, handler);
    },
    []
  );

  const off = useCallback((type: string) => {
    messageHandlersRef.current.delete(type);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    send,
    on,
    off,
  };
}
