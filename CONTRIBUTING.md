# Contributing to FreeVoiceTesting

Thank you for your interest in contributing to FreeVoiceTesting! This project is a developer tool for testing and comparing voice AI pipelines (ASR → LLM → TTS). We welcome contributions of all kinds, from bug reports to new vendor integrations.

For a full understanding of what this project does and why it exists, please read the [README](README.md).

## Table of Contents
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Adding a New Vendor](#adding-a-new-vendor)
- [Coding Guidelines](#coding-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Community Guidelines](#community-guidelines)
- [Questions & Support](#questions--support)

## Ways to Contribute

### Report Bugs
Found a bug? [Open a bug report](.github/ISSUE_TEMPLATE/bug_report.md) with:
- Clear description of the issue
- Steps to reproduce
- Vendor configuration (ASR/LLM/TTS providers used)
- Browser and OS information
- Console errors or logs

### Request Features
Have an idea for improvement? [Submit a feature request](.github/ISSUE_TEMPLATE/feature_request.md) explaining:
- What you want to achieve
- Why it would be valuable
- How you envision it working

### Propose New Vendors
Want to add support for a new ASR, LLM, or TTS provider? [Open a vendor integration request](.github/ISSUE_TEMPLATE/vendor_integration.md) with details about the vendor and their API.

### Improve Documentation
Help make the project easier to understand:
- Fix typos or clarify instructions
- Add examples or use cases
- Improve code comments
- Write guides or tutorials

### Contribute Code
Fix bugs, add features, or optimize performance. See the sections below for guidelines.

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher recommended)
- **npm**, **yarn**, or **bun**
- **API keys** for at least one vendor from each category (ASR, LLM, TTS)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git fork https://github.com/codeshark2/freevoicetesting.git
   cd freevoicetesting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys. See `.env.example` for links to where to get keys for each provider.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

5. **Verify the setup**
   - Open the app in your browser
   - Go to Settings and configure at least one vendor from each category
   - Test a voice pipeline to ensure everything works

### Understanding the Vite Proxy

The development server uses Vite's proxy feature to bypass CORS restrictions when calling vendor APIs. Proxies are configured in `vite.config.ts` for:
- Deepgram, OpenAI, Anthropic, Google, ElevenLabs, PlayHT, AssemblyAI, Azure

This allows the frontend to make API calls without CORS issues during development.

## Project Structure

Understanding the codebase structure will help you navigate and contribute effectively:

```
src/
├── pages/              # Route pages
│   ├── Index.tsx       # Main testing interface
│   └── Settings.tsx    # API key configuration
│
├── components/
│   ├── ui/             # shadcn/ui base components (button, dialog, etc.)
│   ├── config/         # Vendor selection and configuration UI
│   └── dashboard/      # Main testing interface (console, waveforms, metrics)
│
├── hooks/              # React hooks
│   └── useVendorConfig.ts  # Vendor configuration state management
│
├── lib/
│   ├── vendors/
│   │   ├── types.ts        # Vendor type definitions
│   │   └── registry.ts     # ** Vendor registry - register new vendors here **
│   │
│   ├── voice/
│   │   ├── VoiceSession.ts     # ** Main ASR→LLM→TTS orchestrator **
│   │   ├── DeepgramStreaming.ts # Deepgram WebSocket client
│   │   └── SileroVAD.ts        # Voice activity detection
│   │
│   ├── api/
│   │   ├── asr.ts      # ** ASR vendor API clients **
│   │   ├── llm.ts      # ** LLM vendor API clients **
│   │   └── tts.ts      # ** TTS vendor API clients **
│   │
│   └── storage/
│       └── apiKeyStorage.ts  # LocalStorage API key management
```

### Key Files to Know

- **`src/lib/vendors/registry.ts`**: Central registry of all supported vendors. Add new vendors here.
- **`src/lib/api/asr.ts`, `llm.ts`, `tts.ts`**: API client implementations for each vendor category.
- **`src/lib/voice/VoiceSession.ts`**: The main orchestrator that coordinates the ASR→LLM→TTS pipeline.
- **`.env.example`**: Template for environment variables with links to get API keys.

## Adding a New Vendor

Adding support for a new ASR, LLM, or TTS vendor is one of the most valuable contributions you can make. Here's a step-by-step guide:

### 1. Research the Vendor's API
- Read their API documentation
- Understand authentication (API keys, OAuth, etc.)
- Identify available models/voices
- Check for streaming support
- Note any special requirements (audio formats, rate limits, etc.)

### 2. Update the Vendor Registry

Edit `src/lib/vendors/registry.ts` and add your vendor to the appropriate category:

```typescript
// Example: Adding a new TTS vendor
export const ttsVendors: VendorConfig[] = [
  // ... existing vendors ...
  {
    id: 'newvendor',
    name: 'NewVendor TTS',
    category: 'tts',
    requiresKey: true,
    keyLabel: 'NewVendor API Key',
    keyEnvVar: 'VITE_NEWVENDOR_API_KEY',
    setupUrl: 'https://newvendor.com/api-keys',
    models: [
      {
        id: 'voice-1',
        name: 'Voice 1',
        description: 'Natural voice for general use'
      },
      {
        id: 'voice-2',
        name: 'Voice 2',
        description: 'Expressive voice for storytelling'
      }
    ]
  }
];
```

### 3. Implement the API Client

Add the client function to the appropriate file (`src/lib/api/asr.ts`, `llm.ts`, or `tts.ts`):

```typescript
// Example: TTS vendor client in src/lib/api/tts.ts
export async function generateNewVendorSpeech(
  text: string,
  voice: string,
  apiKey: string
): Promise<ArrayBuffer> {
  const response = await fetch('/api/newvendor/tts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voice,
      // Add other required parameters
    })
  });

  if (!response.ok) {
    throw new Error(`NewVendor TTS failed: ${response.statusText}`);
  }

  return response.arrayBuffer();
}
```

For ASR and LLM vendors, follow the patterns used by existing vendors in those files.

### 4. Add Environment Variables

Update `.env.example` to include your new vendor:

```bash
# NewVendor TTS
VITE_NEWVENDOR_API_KEY=your_api_key_here  # Get from: https://newvendor.com/api-keys
```

### 5. Update VoiceSession (if needed)

If your vendor requires special handling, you may need to update `src/lib/voice/VoiceSession.ts`. For example:
- Custom audio format conversion
- Special streaming protocols
- Unique error handling

### 6. Add Vite Proxy Configuration

Edit `vite.config.ts` to add a proxy for your vendor's API:

```typescript
server: {
  proxy: {
    '/api/newvendor': {
      target: 'https://api.newvendor.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/newvendor/, ''),
      // Add any vendor-specific proxy options
    }
  }
}
```

### 7. Test Thoroughly

- Test with valid API keys
- Test with invalid API keys (should show clear error)
- Test all models/voices you've added
- Test in combination with other vendors
- Verify metrics are collected correctly
- Check for console errors

### 8. Update Documentation

If your vendor has any special requirements or limitations, document them in your PR description.

## Coding Guidelines

### TypeScript
- **Strict mode** is enabled - use proper types, avoid `any`
- Define interfaces for API responses
- Use existing type definitions from `src/lib/vendors/types.ts` where applicable

### React Components
- Follow **shadcn/ui** patterns for UI components
- Use **Tailwind CSS** for all styling
- Prefer functional components with hooks
- Use the provided hooks (`useVendorConfig`, `useToast`, etc.)

### State Management
- Use **React Query** (TanStack Query) for server state
- Use **localStorage** via the `apiKeyStorage` module for API keys
- Use the `useVendorConfig` hook for vendor configuration state

### Code Style
- Run `npm run lint` before committing
- Follow ESLint rules (configured in `eslint.config.js`)
- Match the style of existing code
- Use meaningful variable and function names
- Add comments for complex logic, but prefer self-documenting code

### File Organization
- Keep components focused and single-purpose
- Place vendor-specific code in the appropriate `lib/api/` file
- Don't duplicate code - extract shared logic into utilities

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/add-newvendor-tts
   ```

2. **Make your changes**
   - Follow the coding guidelines above
   - Keep commits focused and atomic
   - Write clear commit messages

3. **Test thoroughly**
   - See [Testing Guidelines](#testing-guidelines) below
   - Ensure `npm run build` completes successfully
   - Run `npm run lint` and fix any issues

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add NewVendor TTS support with 3 voices"
   ```

### Submitting the PR

1. **Push to your fork**
   ```bash
   git push origin feature/add-newvendor-tts
   ```

2. **Open a Pull Request**
   - Use the PR template (will auto-populate)
   - Provide a clear description of your changes
   - Reference any related issues
   - Fill out the testing checklist

3. **Respond to feedback**
   - Be open to suggestions and feedback
   - Make requested changes promptly
   - Keep the PR focused on its original purpose

### PR Review Process

- Maintainers will review your PR as soon as possible
- You may be asked to make changes or provide more information
- Once approved, your PR will be merged
- Your contribution will be credited in the commit history

## Testing Guidelines

Since FreeVoiceTesting doesn't have an automated test suite (yet!), thorough manual testing is critical.

### Required Testing Checklist

For **all contributions**:
- [ ] Code builds successfully: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] No console errors in browser dev tools
- [ ] Application loads and renders correctly

For **feature changes and bug fixes**:
- [ ] Test the specific feature or bug fix
- [ ] Test related functionality that might be affected
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)

For **new vendor integrations**:
- [ ] Test with **valid API key** - full pipeline works
- [ ] Test with **invalid API key** - shows clear error message
- [ ] Test **all models/voices** listed in the registry
- [ ] Test in combination with different ASR/LLM/TTS vendors
- [ ] Verify **metrics collection** (TTFB, total time)
- [ ] Test **interruption handling** (if applicable)
- [ ] Verify audio **plays correctly**

### Manual Testing Steps

1. **Start the dev server**: `npm run dev`
2. **Configure vendors**: Go to Settings, add your API keys
3. **Run voice test**: Select vendors and click "Start Listening"
4. **Speak into microphone**: Test the full ASR→LLM→TTS pipeline
5. **Check metrics**: Verify latency metrics appear
6. **Test interruption**: Try speaking while TTS is playing
7. **Check console**: Look for errors or warnings
8. **Try different combinations**: Test various vendor combinations

### What to Look For

- Audio input is captured correctly
- Transcription appears in real-time
- LLM responses are generated
- TTS audio plays back smoothly
- Metrics are displayed accurately
- No memory leaks (check browser task manager)
- Smooth UI interactions (no freezing or lag)

## Community Guidelines

### Be Respectful
- Treat all contributors with respect and courtesy
- Welcome newcomers and help them get started
- Assume good intentions
- Provide constructive feedback

### Be Constructive
- Focus on improving the project
- Explain your reasoning when giving feedback
- Suggest alternatives when pointing out issues
- Celebrate good contributions

### Be Helpful
- Answer questions when you can
- Share your knowledge and experience
- Help review PRs and test changes
- Provide clear and detailed bug reports

### Stay On Topic
- Keep discussions focused on the project
- Use GitHub Issues for bug reports and feature requests
- Use GitHub Discussions for general questions and ideas

## Questions & Support

### Where to Get Help

- **General questions**: Open a [GitHub Discussion](https://github.com/codeshark2/freevoicetesting/discussions)
- **Bug reports**: Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature ideas**: Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Vendor proposals**: Use the [vendor integration template](.github/ISSUE_TEMPLATE/vendor_integration.md)

### Before Asking

1. Check the [README](README.md) for basic information
2. Search existing issues to see if your question has been answered
3. Review this CONTRIBUTING guide
4. Check the code and documentation

## License

By contributing to FreeVoiceTesting, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to FreeVoiceTesting!** Your contributions help make voice AI testing more accessible and transparent for developers everywhere.
