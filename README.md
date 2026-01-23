# freevoicetesting

This repo is a **voice AI testing harness**.

It lets you spin up a real-time voice pipeline (**ASR → LLM → TTS**), try different providers, interrupt it, observe how it behaves, and measure latency — without wiring up a backend or committing to any one vendor.

Nothing is “built in.”
You bring the providers. The system just runs them and shows you what happened.

---

## Why this exists

If you’ve built voice agents before, you know the problem:

Two setups can sound “similar,” but behave very differently once you care about:

* time-to-first-sound
* interruption handling
* streaming lag
* vendor quirks

Most tools blur execution and intelligence together.

This project doesn’t.
It’s intentionally dumb. It just **executes and observes**.

---

## How it works (mentally)

1. You pick ASR, LLM, and TTS in the UI
2. You add your own API keys (stored locally in the browser)
3. The system runs a real-time voice interaction
4. Everything that happens is captured and timed
5. When the run ends, it’s gone

Each test is meant to be **isolated, repeatable, and disposable**.

---

## Running it locally

No environment setup required.

```bash
git clone https://github.com/codeshark2/freevoicetesting.git
cd freevoicetesting
npm install
npm run dev
```

Open:

```
http://localhost:8080
```

All configuration (vendors, models, voices, API keys) happens **inside the UI**.

---

## What you can do with it

* Compare ASR / LLM / TTS vendors side-by-side
* Feel real latency differences (not just see numbers)
* Test interruption behavior
* Debug streaming issues visually
* Experiment with prompts and pipelines before committing to a stack

---

## What this is not

* Not a production voice framework
* Not a hosted service
* Not a no-code product

It’s a **developer tool** for people who want to understand how voice systems actually behave.

