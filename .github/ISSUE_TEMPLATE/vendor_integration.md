---
name: Vendor Integration Request
about: Propose adding support for a new ASR, LLM, or TTS vendor
title: '[VENDOR] Add support for [Vendor Name]'
labels: vendor, enhancement
assignees: ''
---

## Vendor Information
**Vendor Name**: (e.g., Azure, Google, Deepgram, etc.)

**Vendor Category**:
- [ ] ASR (Automatic Speech Recognition)
- [ ] LLM (Large Language Model)
- [ ] TTS (Text-to-Speech)

**Official Website**:

**API Documentation**:

## Proposed Integration Details

### Models/Voices to Support
List the specific models or voices you'd like to see supported:
- Model 1: (e.g., GPT-4, Whisper-large, etc.)
- Model 2:
- Voice 1: (for TTS vendors)
- Voice 2:

### API Features
Which features does this vendor's API support?
- [ ] Streaming support
- [ ] Real-time processing
- [ ] WebSocket support
- [ ] REST API support
- [ ] Multiple languages
- [ ] Custom voice training (TTS)
- [ ] Custom model fine-tuning (LLM/ASR)

### Authentication
How does the vendor handle authentication?
- [ ] API Key
- [ ] OAuth
- [ ] JWT tokens
- [ ] Other (please specify)

## Special Requirements
Are there any special requirements for this integration?
- Specific SDK required?
- Regional endpoints?
- Rate limiting considerations?
- Minimum account tier needed?
- Special audio format requirements?

## Why This Vendor?
Explain why this vendor would be valuable for FreeVoiceTesting users:
- Unique features?
- Better performance?
- Cost advantages?
- Popular/widely used?
- Regional availability?

## Implementation Willingness
Are you willing to help implement this integration?
- [ ] Yes, I can implement this myself
- [ ] Yes, with guidance
- [ ] No, but I can test it
- [ ] No, just requesting

## Additional Context
Add any other context, code samples, or examples of this vendor's API usage.

## Checklist for Implementation
If you're implementing this yourself, here's what needs to be done:
- [ ] Add vendor to `src/lib/vendors/registry.ts`
- [ ] Create API client in `src/lib/api/asr.ts`, `llm.ts`, or `tts.ts`
- [ ] Add environment variables to `.env.example`
- [ ] Test integration end-to-end
- [ ] Update documentation if needed
