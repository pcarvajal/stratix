import type {
  LLMProvider,
  ChatParams,
  ChatResponse,
  ChatChunk,
  EmbeddingParams,
  EmbeddingResponse,
} from '@stratix/core';

/**
 * Mock response configuration
 */
export interface MockResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  delay?: number;
}

/**
 * Mock LLM Provider for testing AI agents without making actual API calls.
 *
 * @example
 * ```typescript
 * const mockProvider = new MockLLMProvider();
 *
 * // Set deterministic response
 * mockProvider.setResponse({
 *   content: '{"result": "success"}',
 *   usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
 * });
 *
 * // Use in tests
 * const agent = new MyAgent({ provider: mockProvider });
 * const result = await agent.execute(input);
 * ```
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = 'mock';
  readonly models = ['mock-model'];

  private responses: MockResponse[] = [];
  private currentResponseIndex = 0;
  private callHistory: ChatParams[] = [];

  /**
   * Sets a single response that will be returned for all calls
   */
  setResponse(response: MockResponse): void {
    this.responses = [response];
    this.currentResponseIndex = 0;
  }

  /**
   * Sets multiple responses that will be returned in sequence
   */
  setResponses(responses: MockResponse[]): void {
    this.responses = responses;
    this.currentResponseIndex = 0;
  }

  /**
   * Adds a response to the queue
   */
  addResponse(response: MockResponse): void {
    this.responses.push(response);
  }

  /**
   * Gets the call history for assertions
   */
  getCallHistory(): ReadonlyArray<ChatParams> {
    return this.callHistory;
  }

  /**
   * Gets the last call made to the provider
   */
  getLastCall(): ChatParams | undefined {
    return this.callHistory[this.callHistory.length - 1];
  }

  /**
   * Gets the number of calls made
   */
  getCallCount(): number {
    return this.callHistory.length;
  }

  /**
   * Clears all responses and call history
   */
  reset(): void {
    this.responses = [];
    this.currentResponseIndex = 0;
    this.callHistory = [];
  }

  /**
   * Implements chat method
   */
  async chat(params: ChatParams): Promise<ChatResponse> {
    this.callHistory.push(params);

    if (this.responses.length === 0) {
      throw new Error('No mock responses configured. Use setResponse() or setResponses()');
    }

    const response = this.responses[this.currentResponseIndex];

    // Cycle through responses or stick to last one
    if (this.currentResponseIndex < this.responses.length - 1) {
      this.currentResponseIndex++;
    }

    // Simulate delay if specified
    if (response.delay) {
      await new Promise((resolve) => setTimeout(resolve, response.delay));
    }

    return {
      content: response.content,
      usage: response.usage || {
        promptTokens: 10,
        completionTokens: 10,
        totalTokens: 20,
      },
      finishReason: response.finishReason || 'stop',
    };
  }

  /**
   * Implements streamChat method
   */
  async *streamChat(params: ChatParams): AsyncIterable<ChatChunk> {
    this.callHistory.push(params);

    if (this.responses.length === 0) {
      throw new Error('No mock responses configured');
    }

    const response = this.responses[this.currentResponseIndex];

    if (this.currentResponseIndex < this.responses.length - 1) {
      this.currentResponseIndex++;
    }

    // Split content into chunks
    const words = response.content.split(' ');
    const delayPerWord = response.delay !== undefined ? response.delay / words.length : 0;

    for (let i = 0; i < words.length; i++) {
      const chunk: ChatChunk = {
        content: words[i] + (i < words.length - 1 ? ' ' : ''),
        isComplete: i === words.length - 1,
      };

      if (delayPerWord > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayPerWord));
      }

      yield chunk;
    }
  }

  /**
   * Implements embeddings method
   */
  async embeddings(params: EmbeddingParams): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(params.input) ? params.input : [params.input];
    const tokenCount = inputs.join(' ').split(' ').length;

    return {
      embeddings: inputs.map(() => {
        // Generate fake embedding vector
        return Array.from({ length: 1536 }, () => Math.random());
      }),
      usage: {
        promptTokens: tokenCount,
        completionTokens: 0,
        totalTokens: tokenCount,
      },
    };
  }
}
