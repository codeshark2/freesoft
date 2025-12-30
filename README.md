# Voice AI Testing Tool

## Why I Built This

I built this tool because, honestly, testing voice AI pipelines can be a headache—and an expensive one at that. You want to try out Deepgram vs. AssemblyAI, or see if ElevenLabs is worth the extra cost over OpenAI TTS, but setting up a full environment for every combination is a pain.

**That's where this project comes in.**

The beauty of this tool is that it creates **small, short-lived, ephemeral execution environments**. You spin it up, test your hypothesis, and tear it down. No data leakage, no persistent storage, no hidden costs piling up in a forgotten database. It's really lightweight, and it's designed to let you fail fast or succeed faster without the infrastructure baggage.

The refactoring pain is real, and doing it early is cheaper than doing it later when you have more sessions/state to worry about.

## What's The Big Deal?

*   **Save Money:** Testing multiple vendors saves you a lot of cost in the long run. Find the best bang-for-your-buck combination before you commit to a production contract.
*   **Ephemeral & Secure:** We deal with API keys in memory only. Once the session ends, the data is gone. ZERO leakage.
*   **Real-Time & Raw:** See exactly what the ASR hears and how the LLM thinks, token by token.
*   **Cost Transparency:** I added a calculator that tells you exactly how much that 30-second conversation costs with your current stack.

## Architecture: Under the Hood

I wanted to keep this clean and modular. Here is how everything fits together:

### 1. Client Side (The Interface)
Built with **Next.js 14** (Static Export) and **React 19**.
*   **Web Audio API:** Captures your microphone stream raw.
*   **WebSocket Client:** Manages the real-time bidirectional stream.
*   **UI/UX:** Simple, no-nonsense interface to input keys and watch the magic happen.

### 2. Server Side (The Brain)
Built with **Node.js** and **Express**.
*   **WebSocket Server:** The heavy lifter. It creates a unique `Session` for every connection.
*   **Orchestrator:** Manages the flow from Audio → Text → Intelligence → Audio.
*   **Ephemeral State:** Everything lives in the `Session` object. When the socket closes, the object is garbage collected. Poof.

### 3. Service Layer (The Integrations)
This is where the vendor-specific logic lives.
*   **Deepgram Integration:** Handles the live audio stream for ASR.
*   **OpenAI Integration:** Manages the context window and streaming responses.
*   **ElevenLabs Integration:** deeply integrated for low-latency TTS streaming.

## Future Scope

This is just the beginning. My vision is to create a robust **Voice Pipeline Playground**.

*   **More Vendors:** I plan to add Google, Azure, and Anthropic soon.
*   **Integration Testing:** Imagine using this as a library to run automated integration tests against your own voice agents.
*   **"Test & Config":** The ultimate goal? Test your stack here, and if you like it, export a configuration file to plug directly into your own production codebase.

---

## Quick Start

Let's get you running in 5 minutes or less.

### 1. Clone It
```bash
git clone <your-repo-url>
cd voice-ai-tester
```

### 2. Install It
We use `pnpm` because it's fast and efficient for monorepos.
```bash
pnpm install
```

### 3. Run It
This command fires up both the Frontend (port 3000) and the specific Backend (port 8080) in parallel.
```bash
pnpm dev
```

Open `http://localhost:3000` and you're good to go.

---

## A Note on "Work in Progress"

You might see some type errors if you run `pnpm build`. That's expected right now! I'm actively working on syncing the shared types between the server and client. But functionally? **It works.** You can run it locally and test your agents today.

## Contributing

got an idea? Found a bug? Want to add a new vendor? **PRs are welcome!** This is an open-source project, so feel free to fork it, break it, and fix it.

Let's build the future of voice AI, one ephemeral session at a time.
