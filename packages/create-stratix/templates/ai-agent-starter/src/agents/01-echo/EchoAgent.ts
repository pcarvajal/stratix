import {
  AIAgent,
  AgentVersionFactory,
  AgentResult,
  AgentCapability,
  EntityId,
} from '@stratix/primitives';
import type { AgentVersion } from '@stratix/primitives';

/**
 * Input type for the Echo Agent
 */
export interface EchoInput {
  message: string;
  name?: string;
}

/**
 * Output type for the Echo Agent
 */
export interface EchoOutput {
  response: string;
  timestamp: Date;
  processedBy: string;
}

/**
 * Echo Agent - Level 1
 *
 * This is the simplest possible AI agent. It doesn't use an LLM,
 * doesn't require an API key, and simply echoes back the input message.
 *
 * This example demonstrates:
 * - Basic agent structure
 * - Agent lifecycle (creation, execution)
 * - Type-safe inputs and outputs
 * - Synchronous execution (no external calls)
 *
 * Perfect for:
 * - Understanding agent fundamentals
 * - Testing the orchestrator
 * - Learning without API costs
 */
export class EchoAgent extends AIAgent<EchoInput, EchoOutput> {
  readonly name = 'Echo Agent';
  readonly version: AgentVersion;
  readonly capabilities = [AgentCapability.CONTENT_CREATION];
  readonly description = 'A simple agent that echoes back your message. No LLM required.';
  readonly model = {
    provider: 'none',
    model: 'echo-v1',
    temperature: 0,
    maxTokens: 1000,
  };

  constructor() {
    const agentId = EntityId.create<'AIAgent'>();
    const now = new Date();
    super(agentId, now, now);
    this.version = AgentVersionFactory.create('1.0.0');
  }

  /**
   * Execute the agent
   *
   * This method is called by the orchestrator when the agent is executed.
   * It receives typed input and must return typed output.
   */
  async execute(input: EchoInput): Promise<AgentResult<EchoOutput>> {
    // Validate input
    if (!input.message || input.message.trim().length === 0) {
      return AgentResult.failure<EchoOutput>(new Error('Message cannot be empty'), {
        model: this.model.model,
      });
    }

    // Build response
    const greeting = input.name ? `Hello, ${input.name}!` : 'Hello!';
    const response = `${greeting} You said: "${input.message}"`;

    // Return successful result
    return AgentResult.success<EchoOutput>(
      {
        response,
        timestamp: new Date(),
        processedBy: this.name,
      },
      { model: this.model.model }
    );
  }

  /**
   * Health check - always healthy since there are no external dependencies
   */
  async healthCheck(): Promise<boolean> {
    return true;
  }
}
