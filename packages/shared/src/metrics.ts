/**
 * Metrics types and cost calculation constants
 */

export interface LatencyMetrics {
  timeToFirstResponse: number; // ms from speech end to first TTS audio
  asr: {
    average: number;
    min: number;
    max: number;
  };
  llm: {
    timeToFirstToken: number;
    timeToComplete: number;
  };
  tts: {
    timeToFirstChunk: number;
  };
}

export interface UsageMetrics {
  audioMinutes: number;
  tokensInput: number;
  tokensOutput: number;
  characters: number;
}

export interface CostMetrics {
  deepgram: number;
  openai: number;
  elevenlabs: number;
  total: number;
}

export interface SessionMetrics {
  latencies: LatencyMetrics;
  costs: CostMetrics;
  usage: UsageMetrics;
}

// Pricing constants (as of 2025)
export const PRICING = {
  deepgram: {
    nova2: 0.0043, // per minute
  },
  openai: {
    gpt4o: {
      input: 0.0025, // per 1K tokens
      output: 0.01, // per 1K tokens
    },
  },
  elevenlabs: {
    turboV2: 0.0003, // per character
  },
};

export function calculateCosts(usage: UsageMetrics): CostMetrics {
  const deepgram = usage.audioMinutes * PRICING.deepgram.nova2;
  const openai =
    (usage.tokensInput / 1000) * PRICING.openai.gpt4o.input +
    (usage.tokensOutput / 1000) * PRICING.openai.gpt4o.output;
  const elevenlabs = usage.characters * PRICING.elevenlabs.turboV2;

  return {
    deepgram,
    openai,
    elevenlabs,
    total: deepgram + openai + elevenlabs,
  };
}
