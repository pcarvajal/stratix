import type { AIAgent } from './AIAgent.js';
import type { AgentId, AgentCapability } from './types.js';

/**
 * Repository for persisting and retrieving AI agents.
 *
 * @example
 * ```typescript
 * class InMemoryAgentRepository implements AgentRepository {
 *   private agents = new Map<string, AIAgent<any, any>>();
 *
 *   async findById(id: AgentId): Promise<AIAgent<any, any> | null> {
 *     return this.agents.get(id.value) ?? null;
 *   }
 *
 *   async save(agent: AIAgent<any, any>): Promise<void> {
 *     this.agents.set(agent.id.value, agent);
 *   }
 * }
 * ```
 */
export interface AgentRepository {
  /**
   * Finds an agent by its unique ID
   *
   * @param id - The agent ID
   * @returns The agent, or null if not found
   */
  findById(id: AgentId): Promise<AIAgent<unknown, unknown> | null>;

  /**
   * Finds all agents with a specific capability
   *
   * @param capability - The capability to search for
   * @returns Array of agents with the capability
   */
  findByCapability(capability: AgentCapability): Promise<AIAgent<unknown, unknown>[]>;

  /**
   * Finds all registered agents
   *
   * @returns Array of all agents
   */
  findAll(): Promise<AIAgent<unknown, unknown>[]>;

  /**
   * Saves an agent (create or update)
   *
   * @param agent - The agent to save
   */
  save(agent: AIAgent<unknown, unknown>): Promise<void>;

  /**
   * Deletes an agent
   *
   * @param id - ID of the agent to delete
   */
  delete(id: AgentId): Promise<void>;

  /**
   * Checks if an agent exists
   *
   * @param id - The agent ID
   * @returns true if the agent exists
   */
  exists(id: AgentId): Promise<boolean>;
}
