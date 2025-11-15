import {
  AIAgent,
  AgentResult,
  AgentCapabilities,
  AgentVersionFactory,
  EntityId
} from '@stratix/primitives';
import type { ModelConfig } from '@stratix/primitives';

/**
 * Input for the Echo Agent
 */
export interface EchoInput {
  message: string;
  name?: string;
}

/**
 * Output from the Echo Agent
 */
export interface EchoOutput {
  response: string;
  originalMessage: string;
  timestamp: Date;
}

/**
 * Simple Echo Agent that greets users and echoes their messages.
 *
 * This is a minimal example demonstrating the Stratix AI Agent framework.
 * It doesn't actually call an LLM - it just formats a response.
 *
 * @example
 * ```typescript
 * const agent = new EchoAgent();
 * const result = await agent.execute({
 *   message: 'Hello!',
 *   name: 'Alice'
 * });
 *
 * console.log(result.data.response);
 * // Output: "Hello Alice! You said: Hello!"
 * ```
 */
export class EchoAgent extends AIAgent<EchoInput, EchoOutput> {
  readonly name = 'Echo Agent';
  readonly description = 'A simple agent that echoes messages back with a greeting';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.CUSTOMER_SUPPORT];
  readonly model: ModelConfig = {
    provider: 'none',
    model: 'echo-v1',
    temperature: 0,
    maxTokens: 100
  };

  constructor() {
    const id = EntityId.create<'AIAgent'>();
    const now = new Date();
    super(id, now, now);
  }

  async execute(input: EchoInput): Promise<AgentResult<EchoOutput>> {
    try {
      // Simulate some processing time
      await this.sleep(100);

      // Build response
      const greeting = input.name ? `Hello ${input.name}!` : 'Hello!';
      const response = `${greeting} You said: ${input.message}`;

      // Create output
      const output: EchoOutput = {
        response,
        originalMessage: input.message,
        timestamp: new Date()
      };

      // Return success result
      return AgentResult.success(output, {
        model: this.model.model,
        duration: 100,
        cost: 0 // No LLM call, so no cost
      });
    } catch (error) {
      return AgentResult.failure(error as Error, {
        model: this.model.model,
        stage: 'execution'
      });
    }
  }

  protected async beforeExecute(input: EchoInput): Promise<void> {
    console.log(`[EchoAgent] Received message: "${input.message}"`);
  }

  protected async afterExecute(result: AgentResult<EchoOutput>): Promise<void> {
    if (result.isSuccess()) {
      console.log(`[EchoAgent] Response generated: "${result.data.response}"`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
