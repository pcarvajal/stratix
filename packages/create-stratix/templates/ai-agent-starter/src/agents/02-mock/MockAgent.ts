import {
  AIAgent,
  AgentVersionFactory,
  AgentResult,
  AgentCapability,
  EntityId,
} from '@stratix/primitives';
import type { AgentVersion } from '@stratix/primitives';
import type { LLMProvider } from '@stratix/abstractions';

/**
 * Input type for the Mock Agent
 */
export interface MockInput {
  message: string;
  context?: string;
}

/**
 * Output type for the Mock Agent
 */
export interface MockOutput {
  response: string;
  tokensUsed: number;
  cost: number;
  model: string;
}

/**
 * Mock Agent - Level 2
 *
 * This agent uses a mock LLM provider to simulate real LLM behavior
 * without making actual API calls or incurring costs.
 *
 * This example demonstrates:
 * - Using LLM providers
 * - Testing agents with mock providers
 * - Cost and token tracking
 * - Deterministic behavior for tests
 *
 * Perfect for:
 * - Testing your agents
 * - Developing without API costs
 * - Creating reproducible tests
 * - CI/CD pipelines
 */
export class MockAgent extends AIAgent<MockInput, MockOutput> {
  readonly name = 'Mock Agent';
  readonly version: AgentVersion;
  readonly capabilities = [AgentCapability.CONTENT_CREATION];
  readonly description = 'An agent that uses a mock LLM provider for testing';
  readonly model = {
    provider: 'mock',
    model: 'mock-gpt-4',
    temperature: 0.7,
    maxTokens: 500,
  };

  constructor(private llmProvider: LLMProvider) {
    const agentId = EntityId.create<'AIAgent'>();
    const now = new Date();
    super(agentId, now, now);
    this.version = AgentVersionFactory.create('1.0.0');
  }

  /**
   * Execute the agent using the mock LLM provider
   */
  async execute(input: MockInput): Promise<AgentResult<MockOutput>> {
    // Validate input
    if (!input.message || input.message.trim().length === 0) {
      return AgentResult.failure<MockOutput>(new Error('Message cannot be empty'), {
        model: this.model.model,
      });
    }

    try {
      // Build chat request
      const now = new Date();
      const messages = [
        {
          role: 'system' as const,
          content: input.context || 'You are a helpful assistant.',
          timestamp: now,
        },
        {
          role: 'user' as const,
          content: input.message,
          timestamp: now,
        },
      ];

      // Call mock LLM provider
      const chatResponse = await this.llmProvider.chat({
        messages,
        model: this.model.model,
        temperature: this.model.temperature,
        maxTokens: this.model.maxTokens,
      });

      // Return successful result with metadata
      return AgentResult.success<MockOutput>(
        {
          response: chatResponse.content,
          tokensUsed: chatResponse.usage.totalTokens,
          cost: 0, // Mock provider has no cost
          model: this.model.model,
        },
        { model: this.model.model }
      );
    } catch (error) {
      return AgentResult.failure<MockOutput>(
        error instanceof Error ? error : new Error('Unknown error'),
        { model: this.model.model }
      );
    }
  }

  /**
   * Health check - verify LLM provider is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try a simple request
      await this.llmProvider.chat({
        messages: [{ role: 'user', content: 'test', timestamp: new Date() }],
        model: this.model.model,
        maxTokens: 1,
      });
      return true;
    } catch {
      return false;
    }
  }
}
