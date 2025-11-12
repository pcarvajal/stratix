import { AggregateRoot } from '../core/AggregateRoot.js';
import type { AgentId, AgentVersion, AgentCapability, ModelConfig } from './types.js';
import type { AgentResult } from './AgentResult.js';
import type { AgentContext } from './AgentContext.js';
import type { AgentMemory } from './AgentMemory.js';

/**
 * Base class for AI Agents in the Stratix framework.
 *
 * An AI Agent is an aggregate root that encapsulates AI capabilities,
 * manages its own state, memory, and execution context.
 *
 * @template TInput - The type of input the agent accepts
 * @template TOutput - The type of output the agent produces
 *
 * @example
 * ```typescript
 * class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
 *   readonly name = 'Customer Support Agent';
 *   readonly description = 'Handles customer support tickets';
 *   readonly version = AgentVersionFactory.create('1.0.0');
 *   readonly capabilities = [AgentCapability.CUSTOMER_SUPPORT];
 *   readonly model = {
 *     provider: 'anthropic',
 *     model: 'claude-3-sonnet',
 *     temperature: 0.7,
 *     maxTokens: 2000
 *   };
 *
 *   async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export abstract class AIAgent<TInput, TOutput> extends AggregateRoot<'AIAgent'> {
  /**
   * Human-readable name of the agent
   */
  abstract readonly name: string;

  /**
   * Description of what the agent does
   */
  abstract readonly description: string;

  /**
   * Version of the agent
   */
  abstract readonly version: AgentVersion;

  /**
   * Capabilities this agent has
   */
  abstract readonly capabilities: AgentCapability[];

  /**
   * LLM model configuration
   */
  abstract readonly model: ModelConfig;

  /**
   * Current execution context
   */
  protected currentContext?: AgentContext;

  /**
   * Agent memory for storing and retrieving information
   */
  protected memory?: AgentMemory;

  /**
   * Main execution method for the agent.
   * Must be implemented by concrete agent classes.
   *
   * @param input - The input data for the agent
   * @returns A promise resolving to the agent result
   */
  abstract execute(input: TInput): Promise<AgentResult<TOutput>>;

  /**
   * Optional hook called before execution
   *
   * @param input - The input that will be executed
   */
  protected async beforeExecute?(input: TInput): Promise<void>;

  /**
   * Optional hook called after successful execution
   *
   * @param result - The execution result
   */
  protected async afterExecute?(result: AgentResult<TOutput>): Promise<void>;

  /**
   * Optional hook called when an error occurs
   *
   * @param error - The error that occurred
   */
  protected async onError?(error: Error): Promise<void>;

  /**
   * Sets the execution context for this agent
   *
   * @param context - The execution context
   */
  setContext(context: AgentContext): void {
    this.currentContext = context;
  }

  /**
   * Sets the memory system for this agent
   *
   * @param memory - The memory implementation
   */
  setMemory(memory: AgentMemory): void {
    this.memory = memory;
  }

  /**
   * Stores a value in agent memory
   *
   * @param key - The key to store under
   * @param value - The value to store
   * @param type - Memory type: 'short' for session, 'long' for persistent
   */
  protected async remember(
    key: string,
    value: unknown,
    type: 'short' | 'long' = 'short'
  ): Promise<void> {
    if (!this.memory) {
      throw new Error('Memory not configured for this agent');
    }
    await this.memory.store(key, value, type);
  }

  /**
   * Retrieves a value from agent memory
   *
   * @param key - The key to retrieve
   * @returns The stored value, or null if not found
   */
  protected async recall(key: string): Promise<unknown> {
    if (!this.memory) {
      throw new Error('Memory not configured for this agent');
    }
    return await this.memory.retrieve(key);
  }

  /**
   * Searches memory semantically
   *
   * @param query - The search query
   * @param limit - Maximum results to return
   * @returns Array of relevant values
   */
  protected async searchMemory(query: string, limit: number = 5): Promise<unknown[]> {
    if (!this.memory) {
      throw new Error('Memory not configured for this agent');
    }
    return await this.memory.search(query, limit);
  }

  /**
   * Removes a value from memory
   *
   * @param type - Type of memory to clear
   */
  protected async forget(type: 'short' | 'long' | 'all' = 'short'): Promise<void> {
    if (!this.memory) {
      throw new Error('Memory not configured for this agent');
    }
    await this.memory.clear(type);
  }

  /**
   * Gets the agent's unique identifier
   */
  getAgentId(): AgentId {
    return this.id as AgentId;
  }

  /**
   * Checks if this agent has a specific capability
   *
   * @param capability - The capability to check for
   */
  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.includes(capability);
  }

  /**
   * Gets agent metadata as a plain object
   */
  toMetadata(): {
    id: string;
    name: string;
    description: string;
    version: string;
    capabilities: string[];
    model: ModelConfig;
  } {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      version: this.version.value,
      capabilities: this.capabilities,
      model: this.model,
    };
  }
}
