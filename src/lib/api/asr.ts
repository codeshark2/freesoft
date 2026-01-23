// ASR (Speech-to-Text) API Clients

export interface ASRMetrics {
  ttfb: number;  // Time to first byte
  total: number; // Total processing time
}

export interface ASRResult {
  transcript: string;
  metrics: ASRMetrics;
}

export interface ASRConfig {
  vendorId: string;
  apiKey: string;
  model: string;
  languageCode: string;
  region?: string;
}

// Convert audio blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Deepgram ASR
async function transcribeDeepgram(audioBlob: Blob, config: ASRConfig): Promise<ASRResult> {
  const startTime = performance.now();
  let ttfb = 0;

  const response = await fetch(`/api/deepgram/v1/listen?model=${config.model}&language=${config.languageCode}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${config.apiKey}`,
      'Content-Type': audioBlob.type || 'audio/webm',
    },
    body: audioBlob,
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    throw new Error(`Deepgram error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const total = performance.now() - startTime;

  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

  return {
    transcript,
    metrics: { ttfb, total },
  };
}

// OpenAI Whisper ASR
async function transcribeOpenAI(audioBlob: Blob, config: ASRConfig): Promise<ASRResult> {
  const startTime = performance.now();
  let ttfb = 0;

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', config.model || 'whisper-1');
  formData.append('language', config.languageCode.split('-')[0]); // 'en-US' -> 'en'

  const response = await fetch('/api/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: formData,
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Whisper error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const total = performance.now() - startTime;

  return {
    transcript: data.text || '',
    metrics: { ttfb, total },
  };
}

// AssemblyAI ASR (uses polling since it's async)
async function transcribeAssemblyAI(audioBlob: Blob, config: ASRConfig): Promise<ASRResult> {
  const startTime = performance.now();
  let ttfb = 0;

  // First, upload the audio
  const uploadResponse = await fetch('/api/assemblyai/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': config.apiKey,
      'Content-Type': audioBlob.type || 'audio/webm',
    },
    body: audioBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`AssemblyAI upload error: ${uploadResponse.status}`);
  }

  const { upload_url } = await uploadResponse.json();
  ttfb = performance.now() - startTime;

  // Create transcription job
  const transcriptResponse = await fetch('/api/assemblyai/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: upload_url,
      language_code: config.languageCode.split('-')[0],
    }),
  });

  if (!transcriptResponse.ok) {
    throw new Error(`AssemblyAI transcript error: ${transcriptResponse.status}`);
  }

  const { id } = await transcriptResponse.json();

  // Poll for completion
  let transcript = '';
  while (true) {
    const pollResponse = await fetch(`/api/assemblyai/v2/transcript/${id}`, {
      headers: { 'Authorization': config.apiKey },
    });

    const result = await pollResponse.json();

    if (result.status === 'completed') {
      transcript = result.text || '';
      break;
    } else if (result.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${result.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const total = performance.now() - startTime;

  return {
    transcript,
    metrics: { ttfb, total },
  };
}

// Main ASR function
export async function transcribe(audioBlob: Blob, config: ASRConfig): Promise<ASRResult> {
  switch (config.vendorId) {
    case 'deepgram':
      return transcribeDeepgram(audioBlob, config);
    case 'openai-whisper':
      return transcribeOpenAI(audioBlob, config);
    case 'assemblyai':
      return transcribeAssemblyAI(audioBlob, config);
    default:
      throw new Error(`Unsupported ASR vendor: ${config.vendorId}`);
  }
}
