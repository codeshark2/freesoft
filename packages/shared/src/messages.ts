/**
 * WebSocket message types for client ↔ server communication
 */

// Client → Server messages
export interface StartSessionMessage {
  type: 'start_session';
  payload: {
    apiKeys: {
      deepgram: string;
      openai: string;
      elevenlabs?: string; // Optional now that OpenAI TTS is available
    };
    systemPrompt: string;
    config?: {
      llmModel?: string;
      ttsVoice?: string;
      ttsProvider?: 'openai-tts' | 'elevenlabs'; // TTS provider selection
    };
  };
  timestamp: number;
}

export interface AudioChunkMessage {
  type: 'audio_chunk';
  payload: {
    audio: ArrayBuffer | string; // base64 encoded or raw
  };
  timestamp: number;
}

export interface EndSessionMessage {
  type: 'end_session';
  payload: {};
  timestamp: number;
}

export type ClientMessage = StartSessionMessage | AudioChunkMessage | EndSessionMessage;

// Server → Client messages
export interface SessionStartedMessage {
  type: 'session_started';
  payload: {
    sessionId: string;
    maxDuration: number; // in seconds
  };
  timestamp: number;
}

export interface TranscriptPartialMessage {
  type: 'transcript_partial';
  payload: {
    text: string;
    isFinal: false;
  };
  timestamp: number;
}

export interface TranscriptFinalMessage {
  type: 'transcript_final';
  payload: {
    text: string;
    isFinal: true;
  };
  timestamp: number;
}

export interface LLMTokenMessage {
  type: 'llm_token';
  payload: {
    token: string;
    isComplete: boolean;
  };
  timestamp: number;
}

export interface TTSAudioMessage {
  type: 'tts_audio';
  payload: {
    audio: ArrayBuffer | string; // base64 encoded audio chunk
  };
  timestamp: number;
}

export interface SessionEndedMessage {
  type: 'session_ended';
  payload: {
    reason: 'user_requested' | 'timeout' | 'error';
    metrics: SessionMetrics;
  };
  timestamp: number;
}

export interface ErrorMessage {
  type: 'error';
  payload: {
    message: string;
    code?: string;
  };
  timestamp: number;
}

export type ServerMessage =
  | SessionStartedMessage
  | TranscriptPartialMessage
  | TranscriptFinalMessage
  | LLMTokenMessage
  | TTSAudioMessage
  | SessionEndedMessage
  | ErrorMessage;

import { SessionMetrics } from './metrics';
