import type {
  LLMProvider,
  ChatParams,
  ChatResponse,
  ChatChunk,
  EmbeddingParams,
  EmbeddingResponse,
} from '@stratix/abstractions';

/**
 * Configuration for the Mock LLM Provider
 */
export interface MockLLMConfig {
  /**
   * Predefined responses to return in order
   * If empty, generates generic responses
   */
  responses?: string[];

  /**
   * Cost per 1K tokens (for testing cost tracking)
   * Default: 0.001 USD
   */
  costPer1kTokens?: number;

  /**
   * Tokens to report per request
   * Default: 100
   */
  tokensPerRequest?: number;

  /**
   * Model name to report
   * Default: 'mock-gpt-4'
   */
  modelName?: string;

  /**
   * Simulate latency (ms)
   * Default: 0
   */
  latencyMs?: number;

  /**
   * Simulate failures
   * Probability 0-1, default: 0
   */
  failureRate?: number;
}

/**
 * Mock LLM Provider - Level 2
 *
 * A mock implementation of LLMProvider for testing agents without
 * making real API calls or incurring costs.
 *
 * Features:
 * - Deterministic responses (great for tests)
 * - Configurable cost and token usage
 * - Simulated latency
 * - Configurable failure rate
 * - No external dependencies
 * - Zero cost
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = 'mock';
  readonly models: string[];

  private responseIndex = 0;
  private config: Required<MockLLMConfig>;

  constructor(config: MockLLMConfig = {}) {
    this.config = {
      responses: config.responses || [],
      costPer1kTokens: config.costPer1kTokens ?? 0.001,
      tokensPerRequest: config.tokensPerRequest ?? 100,
      modelName: config.modelName || 'mock-gpt-4',
      latencyMs: config.latencyMs ?? 0,
      failureRate: config.failureRate ?? 0,
    };
    this.models = [this.config.modelName];
  }

  /**
   * Chat completion with mock response
   */
  async chat(params: ChatParams): Promise<ChatResponse> {
    // Simulate latency
    if (this.config.latencyMs > 0) {
      await this.sleep(this.config.latencyMs);
    }

    // Simulate failure
    if (this.config.failureRate > 0 && Math.random() < this.config.failureRate) {
      throw new Error('Mock LLM provider simulated failure');
    }

    // Get response
    const content = this.getNextResponse(params);

    // Calculate token usage
    const promptTokens = Math.floor(this.config.tokensPerRequest * 0.3);
    const completionTokens = Math.floor(this.config.tokensPerRequest * 0.7);
    const totalTokens = promptTokens + completionTokens;

    // Build response
    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      finishReason: 'stop',
    };
  }

  /**
   * Stream chat responses
   */
  async *streamChat(params: ChatParams): AsyncIterable<ChatChunk> {
    const response = await this.chat(params);

    // Simulate streaming by chunking the response
    const words = response.content.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield {
        content: words[i] + (i < words.length - 1 ? ' ' : ''),
        isComplete: i === words.length - 1,
      };

      // Small delay between chunks
      if (this.config.latencyMs > 0) {
        await this.sleep(Math.floor(this.config.latencyMs / 10));
      }
    }
  }

  /**
   * Generate embeddings (mock implementation)
   */
  async embeddings(params: EmbeddingParams): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(params.input) ? params.input : [params.input];

    // Generate fake embeddings (random vectors)
    const embeddings = inputs.map(() => Array.from({ length: 1536 }, () => Math.random() * 2 - 1));

    return {
      embeddings,
      usage: {
        promptTokens: inputs.length * 10,
        completionTokens: 0,
        totalTokens: inputs.length * 10,
      },
    };
  }

  /**
   * Get the next response based on configuration
   */
  private getNextResponse(params: ChatParams): string {
    // If we have predefined responses, use them
    if (this.config.responses.length > 0) {
      const response = this.config.responses[this.responseIndex % this.config.responses.length];
      this.responseIndex++;
      return response;
    }

    // Otherwise, generate a generic response based on the input
    const userMessage = params.messages.find((m) => m.role === 'user');
    if (userMessage) {
      return `Mock response to: "${userMessage.content}"`;
    }

    return 'Mock response';
  }

  /**
   * Sleep utility for simulating latency
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset the response index (useful for tests)
   */
  reset(): void {
    this.responseIndex = 0;
  }

  /**
   * Add more responses dynamically
   */
  addResponses(responses: string[]): void {
    this.config.responses.push(...responses);
  }
}
