import OpenAI from 'openai';
import { LLMAdapter } from '../base/LLMAdapter';
import { LLMConfig, CompletionResult } from '../types';

/**
 * OpenAI LLM adapter implementation
 * Provides chat completion with streaming using OpenAI's API
 */
export class OpenAIAdapter extends LLMAdapter {
  private client: OpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async generateResponse(userMessage: string): Promise<CompletionResult> {
    // Add user message to history
    this.addMessage('user', userMessage);

    let fullText = '';
    let isFirstToken = true;

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o',
        messages: this.conversationHistory,
        stream: true,
        stream_options: { include_usage: true },
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
      });

      let usage: any = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;

        if (delta) {
          fullText += delta;
          this.emitToken(delta, isFirstToken);
          isFirstToken = false;
        }

        // Usage data comes in the last chunk
        if (chunk.usage) {
          usage = chunk.usage;
        }
      }

      // Add assistant response to history
      this.addMessage('assistant', fullText);

      this.logDebug('Response generated', {
        tokens: usage?.total_tokens || 0,
        length: fullText.length,
      });

      return {
        fullText,
        tokensInput: usage?.prompt_tokens || 0,
        tokensOutput: usage?.completion_tokens || 0,
      };
    } catch (error) {
      this.emitError(error as Error);
      throw error;
    }
  }
}
