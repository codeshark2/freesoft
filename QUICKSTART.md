# Quick Start Guide

Get your voice AI testing tool running in 5 minutes.

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Development Mode

The `.env.local` file is already configured to connect the frontend to the backend WebSocket server.

Run everything in development:

```bash
pnpm dev
```

- **Frontend**: http://localhost:3000 (open this in your browser)
- **Backend**: http://localhost:8080 (WebSocket server)
- **Connection**: Frontend automatically connects to `ws://localhost:8080`

## Step 3: Get API Keys

You'll need:

1. **Deepgram**: https://console.deepgram.com/signup
   - Create account → Get API key from dashboard

2. **OpenAI**: https://platform.openai.com/api-keys
   - Create API key (requires credit)

3. **ElevenLabs**: https://elevenlabs.io/
   - Sign up → Get API key from profile

## Step 4: Test Locally

1. Open http://localhost:3000
2. Enter your three API keys
3. Write a system prompt (or use default)
4. Click "Start Session"
5. Allow microphone access
6. Start talking!

## Production Build

```bash
# Build everything
pnpm build

# Run production server
pnpm start
```

Server runs on http://localhost:8080 and serves both frontend + WebSocket.

## Deploy to Railway

1. Push to GitHub
2. Connect repo to Railway
3. Railway auto-detects Dockerfile
4. Deploy (no environment variables needed!)

## Troubleshooting

**"WebSocket connection failed"**
- Make sure server is running (`pnpm dev` or `pnpm start`)

**"No microphone access"**
- Allow microphone in browser permissions
- HTTPS required in production

**Build fails**
```bash
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

## What's Next?

- Customize system prompts for different use cases
- Test different LLM models (edit `apps/server/src/pipeline/openai.ts`)
- Try different TTS voices (edit `apps/server/src/pipeline/elevenlabs.ts`)
- Monitor metrics to optimize latency

Enjoy testing your voice AI pipeline!
