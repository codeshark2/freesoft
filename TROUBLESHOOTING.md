# Troubleshooting Guide

## Deepgram Error: "Received network error or non-101 status code"

This error means the WebSocket connection to Deepgram is failing. Here's how to fix it:

### 1. Verify Your Deepgram API Key

**Check your key is valid:**
- Go to https://console.deepgram.com
- Navigate to API Keys section
- Verify the key you're using is active
- Try creating a new key if needed

**Common issues:**
- ❌ Key has been revoked
- ❌ Key has insufficient permissions
- ❌ Account has insufficient credits
- ❌ Copy/paste error (extra spaces, missing characters)

### 2. Test Your API Key

Test your Deepgram key directly with curl:

```bash
curl -X POST https://api.deepgram.com/v1/listen \
  -H "Authorization: Token YOUR_DEEPGRAM_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary @test-audio.wav
```

If this fails, your key is invalid.

### 3. Check Server Logs

Look at your server console output:

```bash
pnpm dev
```

You should see:
- ✅ `Initializing voice pipeline...`
- ✅ `Deepgram connection opened`
- ✅ `Voice pipeline initialized successfully`

If you see errors, they'll indicate the specific issue.

### 4. Network Issues

If your API key is valid but still failing:

**Firewall/Proxy:**
- Ensure outbound WebSocket connections are allowed
- Deepgram uses WebSocket protocol on port 443
- Some corporate networks block WebSocket

**Test connectivity:**
```bash
ping api.deepgram.com
```

### 5. SDK Version Issue

If using an outdated Deepgram SDK:

```bash
cd apps/server
pnpm update @deepgram/sdk
pnpm install
```

---

## WebSocket Connection Issues

### "WebSocket is not connected"

This means the frontend can't connect to the backend.

**Solution:**

1. Verify `.env.local` exists in `apps/web/`:
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

2. Restart dev servers:
```bash
# Stop all (Ctrl+C)
pnpm dev
```

3. Check both servers are running:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

4. Browser console should show WebSocket connection

---

## Audio Capture Issues

### "Microphone access denied"

**Solution:**
1. Browser permissions: Allow microphone access
2. HTTPS required in production (localhost is exempt)
3. Check browser console for permission errors

### No transcription appearing

**Checklist:**
- ✅ Microphone is working (test in system settings)
- ✅ Browser has microphone permission
- ✅ Speaking loud enough
- ✅ Deepgram connection successful
- ✅ No error messages in console

---

## OpenAI Errors

### "Authentication failed" or 401 errors

**Solution:**
- Verify OpenAI API key at https://platform.openai.com/api-keys
- Ensure account has credits
- Check key hasn't been revoked

### Rate limit errors

**Solution:**
- Upgrade your OpenAI plan
- Wait and retry
- Reduce session frequency

---

## ElevenLabs Errors

### "Connection failed" or TTS not working

**Solution:**
1. Verify API key at https://elevenlabs.io
2. Check character quota hasn't been exceeded
3. Ensure account is active

### Audio not playing

**Checklist:**
- ✅ Browser audio not muted
- ✅ System volume up
- ✅ Check browser console for audio playback errors
- ✅ Try different browser (Chrome/Firefox recommended)

---

## Build Issues

### Build fails with TypeScript errors

```bash
# Clean and rebuild
pnpm clean
rm -rf node_modules .next out dist
pnpm install
pnpm build
```

### Module not found errors

```bash
# Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## Production Deployment Issues

### WebSocket fails in production

**HTTPS Required:**
- Production must use HTTPS
- WebSocket will auto-upgrade to WSS
- Ensure Railway/hosting provides HTTPS

### Static export issues

```bash
# Verify Next.js build
cd apps/web
pnpm build
# Check 'out' directory exists
ls -la out/
```

---

## Getting More Help

### Enable Debug Logging

**Server logs:**
```bash
# Already enabled in development
pnpm dev
```

**Browser console:**
1. Open DevTools (F12)
2. Check Console tab
3. Check Network tab → WS (WebSocket) section

### Collect Diagnostic Info

Before asking for help, collect:
1. Error messages (exact text)
2. Server console output
3. Browser console output
4. Node version: `node --version`
5. pnpm version: `pnpm --version`

### Common Environment Issues

**Wrong Node version:**
```bash
node --version  # Should be 20+
```

**Wrong pnpm version:**
```bash
pnpm --version  # Should be 9+
```

**Install correct versions:**
```bash
# Using nvm for Node
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm@9
```

---

## Quick Fixes Summary

| Error | Quick Fix |
|-------|-----------|
| Deepgram 101 error | Verify API key, check credits |
| WebSocket not connected | Restart `pnpm dev`, check `.env.local` |
| No microphone | Allow browser permissions |
| Build fails | `pnpm clean && pnpm install && pnpm build` |
| API key invalid | Check keys at provider dashboards |
| Timeout errors | Check network, firewall, API status |

## Still Having Issues?

1. Check all three API provider status pages
2. Verify API keys are fresh (regenerate if old)
3. Test on a different network
4. Try a different browser
5. Check the README.md for additional configuration options
