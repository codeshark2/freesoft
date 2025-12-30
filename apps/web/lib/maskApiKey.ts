/**
 * Masks an API key showing only first char and last 2 chars
 * Industry standard format: "s...xy"
 * @param key - The API key to mask
 * @returns Masked API key string
 * @example
 * maskApiKey("sk-1234567890abcdef") // Returns "s...ef"
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 4) {
    return '•••';
  }

  const first = key[0];
  const last = key.slice(-2);
  return `${first}...${last}`;
}

/**
 * Mask all API keys in an ApiKeys object
 * @param keys - Object containing API keys
 * @returns Object with masked API keys
 */
export function maskApiKeys(keys: {
  stt: string;
  llm: string;
  tts?: string;
}): {
  stt: string;
  llm: string;
  tts?: string;
} {
  return {
    stt: maskApiKey(keys.stt),
    llm: maskApiKey(keys.llm),
    tts: keys.tts ? maskApiKey(keys.tts) : undefined,
  };
}
