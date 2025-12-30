'use client';

import { SessionMetrics } from '@voice-ai-tester/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatLatency, formatCost } from '@/lib/utils';

interface MetricsDashboardProps {
  metrics: SessionMetrics;
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Session Complete</h2>
        <p className="text-muted-foreground">
          Here are your performance metrics and cost breakdown
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time to First Response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLatency(metrics.latencies.timeToFirstResponse)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ASR Latency (avg)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLatency(metrics.latencies.asr.average)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Min: {formatLatency(metrics.latencies.asr.min)} | Max:{' '}
              {formatLatency(metrics.latencies.asr.max)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>LLM Latency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLatency(metrics.latencies.llm.timeToFirstToken)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              First token | Complete:{' '}
              {formatLatency(metrics.latencies.llm.timeToComplete)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>TTS Latency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLatency(metrics.latencies.tts.timeToFirstChunk)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Estimated costs for this session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <div className="font-medium">Deepgram (ASR)</div>
                <div className="text-sm text-muted-foreground">
                  {metrics.usage.audioMinutes.toFixed(2)} minutes
                </div>
              </div>
              <div className="font-semibold">
                {formatCost(metrics.costs.deepgram)}
              </div>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <div className="font-medium">OpenAI (LLM)</div>
                <div className="text-sm text-muted-foreground">
                  {metrics.usage.tokensInput} input + {metrics.usage.tokensOutput}{' '}
                  output tokens
                </div>
              </div>
              <div className="font-semibold">
                {formatCost(metrics.costs.openai)}
              </div>
            </div>

            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <div className="font-medium">ElevenLabs (TTS)</div>
                <div className="text-sm text-muted-foreground">
                  {metrics.usage.characters} characters
                </div>
              </div>
              <div className="font-semibold">
                {formatCost(metrics.costs.elevenlabs)}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-lg font-bold">Total Cost</div>
              <div className="text-2xl font-bold text-primary">
                {formatCost(metrics.costs.total)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
