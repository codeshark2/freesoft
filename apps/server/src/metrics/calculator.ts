import {
  Event,
  EventLog,
  SessionMetrics,
  LatencyMetrics,
  UsageMetrics,
  calculateCosts,
} from '@voice-ai-tester/shared';

/**
 * Metrics calculator that processes event logs to compute latencies and costs
 */
export class MetricsCalculator {
  static calculate(eventLog: EventLog): SessionMetrics {
    const events = eventLog.events;

    const latencies = this.calculateLatencies(events);
    const usage = this.calculateUsage(events);
    const costs = calculateCosts(usage);

    return {
      latencies,
      costs,
      usage,
    };
  }

  private static calculateLatencies(events: Event[]): LatencyMetrics {
    // Time to first response: speech end → first TTS audio
    const asrFinalEvents = events.filter((e) => e.type === 'asr_final');
    const ttsAudioEvents = events.filter(
      (e) => e.type === 'tts_audio_chunk' && e.data.isFirst
    );

    let timeToFirstResponse = 0;
    if (asrFinalEvents.length > 0 && ttsAudioEvents.length > 0) {
      const lastSpeechEnd = asrFinalEvents[asrFinalEvents.length - 1];
      const firstTTSAudio = ttsAudioEvents.find(
        (e) => e.timestamp > lastSpeechEnd.timestamp
      );
      if (firstTTSAudio && lastSpeechEnd.type === 'asr_final') {
        timeToFirstResponse =
          firstTTSAudio.timestamp - lastSpeechEnd.data.speechEndTime;
      }
    }

    // ASR latencies: audio received → transcript
    const audioChunkEvents = events.filter(
      (e) => e.type === 'audio_chunk_received'
    );
    const asrLatencies: number[] = [];

    asrFinalEvents.forEach((asrEvent) => {
      if (asrEvent.type === 'asr_final') {
        // Find the closest audio chunk before this transcript
        const priorAudio = audioChunkEvents
          .filter((a) => a.timestamp < asrEvent.timestamp)
          .sort((a, b) => b.timestamp - a.timestamp)[0];

        if (priorAudio) {
          asrLatencies.push(asrEvent.timestamp - priorAudio.timestamp);
        }
      }
    });

    const asrMetrics = {
      average:
        asrLatencies.length > 0
          ? asrLatencies.reduce((a, b) => a + b, 0) / asrLatencies.length
          : 0,
      min: asrLatencies.length > 0 ? Math.min(...asrLatencies) : 0,
      max: asrLatencies.length > 0 ? Math.max(...asrLatencies) : 0,
    };

    // LLM latencies
    const llmStartEvents = events.filter((e) => e.type === 'llm_start');
    const llmTokenEvents = events.filter((e) => e.type === 'llm_token');
    const llmCompleteEvents = events.filter((e) => e.type === 'llm_complete');

    let llmTimeToFirstToken = 0;
    let llmTimeToComplete = 0;

    if (llmStartEvents.length > 0) {
      const lastLLMStart = llmStartEvents[llmStartEvents.length - 1];
      const firstToken = llmTokenEvents.find(
        (e) =>
          e.timestamp > lastLLMStart.timestamp &&
          e.type === 'llm_token' &&
          e.data.isFirst
      );

      if (firstToken) {
        llmTimeToFirstToken = firstToken.timestamp - lastLLMStart.timestamp;
      }

      const complete = llmCompleteEvents.find(
        (e) => e.timestamp > lastLLMStart.timestamp
      );
      if (complete) {
        llmTimeToComplete = complete.timestamp - lastLLMStart.timestamp;
      }
    }

    // TTS latencies
    const ttsStartEvents = events.filter((e) => e.type === 'tts_start');
    let ttsTimeToFirstChunk = 0;

    if (ttsStartEvents.length > 0 && ttsAudioEvents.length > 0) {
      const lastTTSStart = ttsStartEvents[ttsStartEvents.length - 1];
      const firstChunk = ttsAudioEvents.find(
        (e) => e.timestamp > lastTTSStart.timestamp
      );

      if (firstChunk) {
        ttsTimeToFirstChunk = firstChunk.timestamp - lastTTSStart.timestamp;
      }
    }

    return {
      timeToFirstResponse,
      asr: asrMetrics,
      llm: {
        timeToFirstToken: llmTimeToFirstToken,
        timeToComplete: llmTimeToComplete,
      },
      tts: {
        timeToFirstChunk: ttsTimeToFirstChunk,
      },
    };
  }

  private static calculateUsage(events: Event[]): UsageMetrics {
    // Calculate audio minutes
    const sessionStart = events.find((e) => e.type === 'session_start');
    const sessionEnd = events.find((e) => e.type === 'session_end');

    let audioMinutes = 0;
    if (sessionStart && sessionEnd && sessionEnd.type === 'session_end') {
      audioMinutes = sessionEnd.data.duration / 1000 / 60;
    }

    // Calculate tokens
    const llmCompleteEvents = events.filter((e) => e.type === 'llm_complete');
    let tokensInput = 0;
    let tokensOutput = 0;

    llmCompleteEvents.forEach((event) => {
      if (event.type === 'llm_complete') {
        tokensInput += event.data.tokensInput;
        tokensOutput += event.data.tokensOutput;
      }
    });

    // Calculate TTS characters
    const ttsStartEvents = events.filter((e) => e.type === 'tts_start');
    let characters = 0;

    ttsStartEvents.forEach((event) => {
      if (event.type === 'tts_start') {
        characters += event.data.characterCount;
      }
    });

    return {
      audioMinutes,
      tokensInput,
      tokensOutput,
      characters,
    };
  }
}
