// LLM (Language Model) API Clients

export interface LLMMetrics {
  ttfb: number;  // Time to first token
  total: number; // Total processing time
}

export interface LLMResult {
  response: string;
  metrics: LLMMetrics;
}

export interface LLMConfig {
  vendorId: string;
  apiKey: string;
  model: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful voice assistant. Keep responses concise and conversational since they will be spoken aloud. Aim for 1-3 sentences unless more detail is specifically requested.`;

// OpenAI Chat
async function chatOpenAI(messages: Message[], config: LLMConfig): Promise<LLMResult> {
  const startTime = performance.now();
  let ttfb = 0;

  const response = await fetch('/api/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const total = performance.now() - startTime;

  return {
    response: data.choices?.[0]?.message?.content || '',
    metrics: { ttfb, total },
  };
}

// Anthropic Claude
async function chatAnthropic(messages: Message[], config: LLMConfig): Promise<LLMResult> {
  const startTime = performance.now();
  let ttfb = 0;

  // Convert messages to Anthropic format
  const anthropicMessages = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    }),
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const total = performance.now() - startTime;

  return {
    response: data.content?.[0]?.text || '',
    metrics: { ttfb, total },
  };
}

// Google Gemini
async function chatGemini(messages: Message[], config: LLMConfig): Promise<LLMResult> {
  const startTime = performance.now();
  let ttfb = 0;

  // Convert messages to Gemini format
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  // Add system instruction as first user message if needed
  if (contents.length > 0 && contents[0].role === 'user') {
    contents[0].parts[0].text = `${SYSTEM_PROMPT}\n\nUser: ${contents[0].parts[0].text}`;
  }

  const response = await fetch(`/api/google/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    }),
  });

  ttfb = performance.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const total = performance.now() - startTime;

  return {
    response: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    metrics: { ttfb, total },
  };
}

// Main LLM function
export async function chat(messages: Message[], config: LLMConfig): Promise<LLMResult> {
  switch (config.vendorId) {
    case 'openai':
      return chatOpenAI(messages, config);
    case 'anthropic':
      return chatAnthropic(messages, config);
    case 'google-gemini':
      return chatGemini(messages, config);
    default:
      throw new Error(`Unsupported LLM vendor: ${config.vendorId}`);
  }
}
