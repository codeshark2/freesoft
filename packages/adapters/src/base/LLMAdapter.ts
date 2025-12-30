import { EventEmitter } from 'events';
import {
  LLMAdapter as ILLMAdapter,
  LLMConfig,
  LLMMessage,
  CompletionResult,
  TokenEvent,
} from '../types';

/**
 * Abstract base class for LLM (Language Model) adapters
 * Provides common functionality for text generation providers
 */
export abstract class LLMAdapter extends EventEmitter implements ILLMAdapter {
  protected config: LLMConfig;
  protected conversationHistory: LLMMessage[] = [];

  constructor(config: LLMConfig) {
    super();
    this.config = config;
  }

  // Abstract methods that must be implemented by concrete adapters
  abstract generateResponse(userMessage: string): Promise<CompletionResult>;

  // Common functionality

  setSystemPrompt(prompt: string): void {
    // Remove existing system messages
    this.conversationHistory = this.conversationHistory.filter(
      (msg) => msg.role !== 'system'
    );

    // Add new system message at the beginning
    this.conversationHistory.unshift({
      role: 'system',
      content: prompt,
    });

    this.logDebug('System prompt set', { length: prompt.length });
  }

  setConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
    this.logDebug('Config updated', config);
  }

  clearHistory(): void {
    // Preserve system message if it exists
    const systemMessage = this.conversationHistory.find(
      (msg) => msg.role === 'system'
    );
    this.conversationHistory = systemMessage ? [systemMessage] : [];
    this.logDebug('Conversation history cleared');
  }

  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.conversationHistory.push({ role, content });
    this.logDebug(`Added ${role} message`, { length: content.length });
  }

  getHistory(): LLMMessage[] {
    return [...this.conversationHistory];
  }

  isReady(): boolean {
    // LLM providers are typically stateless/always ready (no persistent connection)
    return true;
  }

  // Helper methods for consistent event emission

  protected emitToken(token: string, isFirst: boolean = false): void {
    const event: TokenEvent = {
      token,
      isFirst,
      timestamp: Date.now(),
    };
    this.emit('token', event);
  }

  protected emitError(error: Error | string): void {
    const err = typeof error === 'string' ? new Error(error) : error;
    this.emit('error', err);
    this.logError('LLM error', err);
  }

  // Logging helpers

  protected logDebug(message: string, data?: any): void {
    // No-op
  }

  protected logError(message: string, error?: any): void {
    // No-op
  }
}
