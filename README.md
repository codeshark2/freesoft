# Voice AI Testing Tool

A real-time web application for testing voice AI pipelines with live ASR → LLM → TTS processing. Test your voice agents with metrics and cost tracking.

## Features

- **Real-time Voice Pipeline**: Stream audio through Deepgram ASR → OpenAI LLM → ElevenLabs TTS
- **Live Transcription**: See your speech and AI responses transcribed in real-time
- **Performance Metrics**: Track latencies for each component (ASR, LLM, TTS)
- **Cost Analysis**: Get detailed cost breakdowns for your session
- **No Storage**: API keys are held in memory only, never persisted
- **Single Deploy**: One container serves both frontend and WebSocket server

## Architecture

### Monorepo Structure

```
voice-ai-tester/
├── apps/
│   ├── web/              # Next.js 14+ static export
│   └── server/           # Express + WebSocket server
├── packages/
│   └── shared/           # Shared TypeScript types
├── Dockerfile            # Single container deployment
└── pnpm-workspace.yaml   # Monorepo configuration
```

### Technology Stack

**Frontend:**
- Next.js 14+ (static export)
- React 19
- Tailwind CSS + shadcn/ui
- WebSocket client
- Web Audio API

**Backend:**
- Node.js + Express
- WebSocket (ws library)
- Deepgram SDK (ASR)
- OpenAI SDK (LLM)
- ElevenLabs WebSocket API (TTS)

**Infrastructure:**
- pnpm workspaces
- Turborepo for builds
- Docker for deployment
- Railway-ready

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- API keys for:
  - [Deepgram](https://deepgram.com) (ASR)
  - [OpenAI](https://openai.com) (LLM)
  - [ElevenLabs](https://elevenlabs.io) (TTS)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd voice-ai-tester
```

2. Install dependencies:

```bash
pnpm install
```

### Development

**Important**: In development, the frontend and backend run on different ports.

1. The WebSocket configuration is already set up in `apps/web/.env.local`:
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

2. Run all services in development mode:
```bash
pnpm dev
```

This starts:
- **Frontend dev server**: `http://localhost:3000`
- **Backend WebSocket server**: `http://localhost:8080` (WebSocket on `ws://localhost:8080`)

3. Open your browser to `http://localhost:3000`
   - The frontend will automatically connect to the backend WebSocket server on port 8080
   - Check browser console for successful WebSocket connection

### Building

Build all packages for production:

```bash
pnpm build
```

This will:
1. Build shared types
2. Build Next.js app as static export → `apps/web/out`
3. Build server TypeScript → `apps/server/dist`

### Running Production Build

```bash
pnpm start
```

The server will:
- Serve static files from `apps/web/out`
- Handle WebSocket connections
- Run on port 8080 (configurable via `PORT` env var)

## Deployment

### Docker

Build the Docker image:

```bash
docker build -t voice-ai-tester .
```

Run the container:

```bash
docker run -p 8080:8080 voice-ai-tester
```

### Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Dockerfile
3. Set environment variables:
   - `PORT=8080` (optional, defaults to 8080)
   - `NODE_ENV=production`
4. Deploy

**Note**: User API keys are NOT environment variables. Users provide them at runtime.

## How It Works

### Session Flow

1. **Setup**: User enters API keys and system prompt
2. **Connection**: WebSocket connects, session starts
3. **Capture**: Microphone audio streams to server
4. **ASR**: Deepgram transcribes speech in real-time
5. **LLM**: OpenAI generates response when user stops speaking
6. **TTS**: ElevenLabs synthesizes speech from LLM output
7. **Playback**: Audio streams back to browser
8. **Metrics**: All events logged with timestamps
9. **Results**: Latencies and costs calculated from event log

### WebSocket Message Flow

**Client → Server:**
- `start_session`: Initialize with API keys and config
- `audio_chunk`: Stream microphone audio
- `end_session`: Terminate session

**Server → Client:**
- `session_started`: Confirmation with session ID
- `transcript_partial`: Real-time transcription
- `transcript_final`: Complete user utterance
- `llm_token`: Streaming LLM response
- `tts_audio`: Audio chunks for playback
- `session_ended`: Final metrics
- `error`: Error messages

### Event Logging

All pipeline events are captured with timestamps:
- `audio_chunk_received`
- `asr_partial` / `asr_final`
- `llm_start` / `llm_token` / `llm_complete`
- `tts_start` / `tts_audio_chunk` / `tts_complete`

### Metrics Calculation

From the event log:
- **Time to First Response**: Speech end → first TTS audio
- **ASR Latency**: Audio received → transcript (avg/min/max)
- **LLM Latency**: Prompt sent → first token, total completion
- **TTS Latency**: Text sent → first audio chunk

### Cost Estimation

Based on current pricing (2025):
- **Deepgram**: $0.0043/minute (nova-2)
- **OpenAI**: $0.0025/1K input + $0.01/1K output tokens (gpt-4o)
- **ElevenLabs**: $0.0003/character (turbo_v2)

## Project Structure

### Shared Package (`packages/shared`)

```typescript
// WebSocket messages
export interface StartSessionMessage { ... }
export interface AudioChunkMessage { ... }
// ... more message types

// Events for logging
export interface ASRFinalEvent { ... }
export interface LLMTokenEvent { ... }
// ... more event types

// Metrics
export interface SessionMetrics { ... }
```

### Server (`apps/server`)

```
src/
├── index.ts              # Express + WebSocket setup
├── websocket/
│   └── handler.ts        # WebSocket connection handler
├── session/
│   ├── manager.ts        # Session lifecycle management
│   └── session.ts        # Individual session logic
├── pipeline/
│   ├── orchestrator.ts   # ASR → LLM → TTS flow
│   ├── deepgram.ts       # Deepgram client
│   ├── openai.ts         # OpenAI client
│   └── elevenlabs.ts     # ElevenLabs client
├── events/
│   └── logger.ts         # Event logging
└── metrics/
    └── calculator.ts     # Metrics computation
```

### Frontend (`apps/web`)

```
app/
├── page.tsx              # Main app with state management
├── layout.tsx
└── globals.css

components/
├── ApiKeyForm.tsx        # Initial setup form
├── SessionView.tsx       # Active session UI
├── TranscriptDisplay.tsx # Live conversation transcript
├── MetricsDashboard.tsx  # Results visualization
├── Timer.tsx             # Session countdown
└── ui/                   # shadcn/ui components

hooks/
├── useWebSocket.ts       # WebSocket connection
├── useAudioCapture.ts    # Microphone streaming
└── useAudioPlayback.ts   # TTS audio playback
```

## Security & Privacy

- API keys are **never stored** on the server
- Keys are held in memory only during the session
- No databases, no persistence
- Keys are transmitted once at session start
- Session data is cleared when connection closes

## Limitations

- Maximum session duration: 60 seconds
- Single concurrent session per connection
- No conversation history persistence
- Static export means no server-side rendering

## Configuration

### LLM Model

Default: `gpt-4o`

Change in frontend when starting session (future enhancement) or modify default in `apps/server/src/pipeline/openai.ts`.

### TTS Voice

Default: Rachel (`21m00Tcm4TlvDq8ikWAM`)

Change in frontend config or modify default in `apps/server/src/pipeline/elevenlabs.ts`.

### Session Duration

Default: 60 seconds

Modify `MAX_SESSION_DURATION` in `apps/server/src/session/session.ts`.

## Troubleshooting

### WebSocket Connection Failed

- Ensure server is running
- Check firewall/proxy settings
- Verify port 8080 is accessible

### No Audio Playback

- Check browser permissions for microphone
- Ensure HTTPS in production (WebRTC requirement)
- Check browser console for errors

### High Latency

- Check network connection
- Verify provider API status
- Review metrics to identify bottleneck (ASR/LLM/TTS)

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## Development Tips

- Run `pnpm typecheck` to catch TypeScript errors
- Use `pnpm lint` for code quality
- Frontend hot-reloads in dev mode
- Server uses `tsx watch` for hot reload
- Check `turbo.json` for build caching

## Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Voice providers: [Deepgram](https://deepgram.com), [OpenAI](https://openai.com), [ElevenLabs](https://elevenlabs.io)
