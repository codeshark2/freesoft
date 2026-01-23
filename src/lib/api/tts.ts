// TTS (Text-to-Speech) API Clients

export interface TTSMetrics {
  ttfb: number;  // Time to first byte
  total: number; // Total processing time
}

export interface TTSResult {
  audioBlob: Blob;
  metrics: TTSMetrics;
}

export interface TTSConfig {
  vendorId: string;
  apiKey: string;
  model: string;
  voiceId: string;
  userId?: string; // For PlayHT
}

// ElevenLabs TTS
async function synthesizeElevenLabs(text: string, config: TTSConfig): Promise<TTSResult> {
  const startTime = performance.now();
  let ttfb = 0;

  const response = await fetch(`/api/elevenlabs/v1/text-to-speech/${config.voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: config.model,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs error: ${response.status} - ${error}`);
  }

  const audioBlob = await response.blob();
  const total = performance.now() - startTime;

  return {
    audioBlob,
    metrics: { ttfb, total },
  };
}

// OpenAI TTS
async function synthesizeOpenAI(text: string, config: TTSConfig): Promise<TTSResult> {
  const startTime = performance.now();
  let ttfb = 0;

  const response = await fetch('/api/openai/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'tts-1',
      input: text,
      voice: config.voiceId || 'alloy',
      response_format: 'mp3',
    }),
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS error: ${response.status} - ${error}`);
  }

  const audioBlob = await response.blob();
  const total = performance.now() - startTime;

  return {
    audioBlob,
    metrics: { ttfb, total },
  };
}

// PlayHT TTS
async function synthesizePlayHT(text: string, config: TTSConfig): Promise<TTSResult> {
  const startTime = performance.now();
  let ttfb = 0;

  const response = await fetch('/api/playht/api/v2/tts/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'X-User-ID': config.userId || '',
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      voice: config.voiceId,
      output_format: 'mp3',
      voice_engine: config.model || 'PlayHT2.0',
    }),
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PlayHT error: ${response.status} - ${error}`);
  }

  const audioBlob = await response.blob();
  const total = performance.now() - startTime;

  return {
    audioBlob,
    metrics: { ttfb, total },
  };
}

// Main TTS function
export async function synthesize(text: string, config: TTSConfig): Promise<TTSResult> {
  switch (config.vendorId) {
    case 'elevenlabs':
      return synthesizeElevenLabs(text, config);
    case 'openai-tts':
      return synthesizeOpenAI(text, config);
    case 'playht':
      return synthesizePlayHT(text, config);
    default:
      throw new Error(`Unsupported TTS vendor: ${config.vendorId}`);
  }
}

// Audio playback utility
export function playAudio(audioBlob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Audio playback failed: ${e}`));
    };

    audio.play().catch(reject);
  });
}
