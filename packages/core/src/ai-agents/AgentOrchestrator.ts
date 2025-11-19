import type { AIAgent } from './AIAgent.js';
import type { AgentId } from './types.js';
import type { AgentResult } from './AgentResult.js';
import type { AgentContext } from './AgentContext.js';

/**
 * Orchestrates the execution of AI agents.
 *
 * The orchestrator manages agent registration, execution, and coordination
 * between multiple agents.
 *
 * @example
 * ```typescript
 * class StratixAgentOrchestrator implements AgentOrchestrator {
 *   private agents = new Map<string, AIAgent<any, any>>();
 *
 *   registerAgent(agent: AIAgent<any, any>): void {
 *     this.agents.set(agent.id.value, agent);
 *   }
 *
 *   async executeAgent<TInput, TOutput>(
 *     agentId: AgentId,
 *     input: TInput,
 *     context: AgentContext
 *   ): Promise<AgentResult<TOutput>> {
 *     const agent = this.agents.get(agentId.value);
 *     if (!agent) throw new Error('Agent not found');
 *
 *     agent.setContext(context);
 *     return await agent.execute(input);
 *   }
 * }
 * ```
 */
export interface AgentOrchestrator {
  /**
   * Registers an agent with the orchestrator
   *
   * @param agent - The agent to register
   */
  registerAgent(agent: AIAgent<unknown, unknown>): void;

  /**
   * Unregisters an agent from the orchestrator
   *
   * @param agentId - ID of the agent to unregister
   */
  unregisterAgent(agentId: AgentId): void;

  /**
   * Executes a single agent
   *
   * @param agentId - ID of the agent to execute
   * @param input - Input data for the agent
   * @param context - Execution context
   * @returns The agent execution result
   */
  executeAgent<TInput, TOutput>(
    agentId: AgentId,
    input: TInput,
    context: AgentContext
  ): Promise<AgentResult<TOutput>>;

  /**
   * Executes multiple agents sequentially
   *
   * Each agent receives the output of the previous agent as input.
   *
   * @param agents - Array of agents to execute in sequence
   * @param input - Initial input data
   * @param context - Execution context
   * @returns The final agent result
   */
  executeSequential(
    agents: AIAgent<unknown, unknown>[],
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<unknown>>;

  /**
   * Executes multiple agents in parallel
   *
   * All agents receive the same input and execute simultaneously.
   *
   * @param agents - Array of agents to execute in parallel
   * @param input - Input data (same for all agents)
   * @param context - Execution context
   * @returns Array of agent results
   */
  executeParallel(
    agents: AIAgent<unknown, unknown>[],
    input: unknown,
    context: AgentContext
  ): Promise<AgentResult<unknown>[]>;

  /**
   * Delegates execution from one agent to another
   *
   * @param fromAgent - The delegating agent
   * @param toAgent - The agent to delegate to
   * @param input - Input data for the target agent
   * @returns The result from the target agent
   */
  delegateToAgent(
    fromAgent: AIAgent<unknown, unknown>,
    toAgent: AIAgent<unknown, unknown>,
    input: unknown
  ): Promise<AgentResult<unknown>>;
}
