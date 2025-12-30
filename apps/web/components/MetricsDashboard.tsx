'use client';

import { SessionMetrics } from '@voice-ai-tester/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
          Here are your performance metrics
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
          <CardTitle>Conversation Exchanges</CardTitle>
          <CardDescription>Transcript and responses with latencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.exchanges && metrics.exchanges.length > 0 ? (
              metrics.exchanges.map((exchange, index) => (
                <div key={index} className="pb-4 border-b last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-muted-foreground">
                      Exchange {index + 1}
                    </div>
                    <div className="text-xs font-semibold text-primary">
                      {formatLatency(exchange.latency)}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="deepgram">STT</Badge>
                        <span className="text-xs text-muted-foreground">You said:</span>
                      </div>
                      <div className="text-sm bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                        {exchange.transcript}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="openai">LLM</Badge>
                        <span className="text-xs text-muted-foreground">AI responded:</span>
                      </div>
                      <div className="text-sm bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                        {exchange.response}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No exchanges recorded
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
