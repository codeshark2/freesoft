/**
 * Event types for internal logging and metrics calculation
 */

export type EventType =
  | 'session_start'
  | 'session_end'
  | 'audio_chunk_received'
  | 'asr_partial'
  | 'asr_final'
  | 'llm_start'
  | 'llm_token'
  | 'llm_complete'
  | 'tts_start'
  | 'tts_audio_chunk'
  | 'tts_complete'
  | 'error';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  sessionId: string;
}

export interface SessionStartEvent extends BaseEvent {
  type: 'session_start';
  data: {
    systemPrompt: string;
    config: {
      llmModel: string;
      ttsVoice: string;
    };
  };
}

export interface SessionEndEvent extends BaseEvent {
  type: 'session_end';
  data: {
    reason: 'user_requested' | 'timeout' | 'error';
    duration: number; // ms
  };
}

export interface AudioChunkReceivedEvent extends BaseEvent {
  type: 'audio_chunk_received';
  data: {
    size: number; // bytes
  };
}

export interface ASRPartialEvent extends BaseEvent {
  type: 'asr_partial';
  data: {
    text: string;
    confidence?: number;
  };
}

export interface ASRFinalEvent extends BaseEvent {
  type: 'asr_final';
  data: {
    text: string;
    confidence?: number;
    speechEndTime: number; // timestamp when user stopped speaking
  };
}

export interface LLMStartEvent extends BaseEvent {
  type: 'llm_start';
  data: {
    prompt: string;
  };
}

export interface LLMTokenEvent extends BaseEvent {
  type: 'llm_token';
  data: {
    token: string;
    isFirst: boolean;
  };
}

export interface LLMCompleteEvent extends BaseEvent {
  type: 'llm_complete';
  data: {
    fullText: string;
    tokensInput: number;
    tokensOutput: number;
  };
}

export interface TTSStartEvent extends BaseEvent {
  type: 'tts_start';
  data: {
    text: string;
    characterCount: number;
  };
}

export interface TTSAudioChunkEvent extends BaseEvent {
  type: 'tts_audio_chunk';
  data: {
    size: number; // bytes
    isFirst: boolean;
  };
}

export interface TTSCompleteEvent extends BaseEvent {
  type: 'tts_complete';
  data: {
    totalChunks: number;
    totalSize: number; // bytes
  };
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  data: {
    message: string;
    code?: string;
    provider?: 'deepgram' | 'openai' | 'elevenlabs';
  };
}

export type Event =
  | SessionStartEvent
  | SessionEndEvent
  | AudioChunkReceivedEvent
  | ASRPartialEvent
  | ASRFinalEvent
  | LLMStartEvent
  | LLMTokenEvent
  | LLMCompleteEvent
  | TTSStartEvent
  | TTSAudioChunkEvent
  | TTSCompleteEvent
  | ErrorEvent;

export interface EventLog {
  sessionId: string;
  events: Event[];
}
