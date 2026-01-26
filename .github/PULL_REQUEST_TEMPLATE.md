## Description
Brief description of what this PR does.

## Type of Change
Please check the relevant options:
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] New vendor integration (ASR/LLM/TTS)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] UI/UX enhancement

## Related Issues
Closes #(issue number)
Related to #(issue number)

## Changes Made
List the specific changes made in this PR:
-
-
-

## Testing Performed
Please confirm you have completed the following testing:

### General Testing
- [ ] Code builds successfully (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Tested in development mode (`npm run dev`)
- [ ] No console errors in browser dev tools

### Voice Pipeline Testing (if applicable)
- [ ] Voice pipeline tested end-to-end (ASR → LLM → TTS)
- [ ] Tested with multiple vendor combinations
- [ ] Metrics are collected and displayed correctly
- [ ] Audio input/output works as expected
- [ ] Interruption handling works (if modified)

### Vendor Integration Testing (if adding new vendor)
- [ ] API authentication works correctly
- [ ] All models/voices listed are functional
- [ ] Error handling works for invalid API keys
- [ ] Streaming works correctly (if supported)
- [ ] Environment variables documented in `.env.example`
- [ ] Vendor added to registry (`src/lib/vendors/registry.ts`)

### Browser Testing
Tested on the following browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Other (specify):

## Screenshots/Recordings
If applicable, add screenshots or screen recordings to demonstrate the changes.

## Breaking Changes
Does this PR introduce any breaking changes?
- [ ] No
- [ ] Yes (please describe below)

If yes, describe what breaks and migration steps:

## Additional Notes
Any additional information, context, or considerations for reviewers.

## Checklist
- [ ] My code follows the existing code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code where necessary, particularly in complex areas
- [ ] My changes generate no new warnings or errors
- [ ] I have updated documentation where applicable
- [ ] My changes maintain backwards compatibility (or breaking changes are documented)
