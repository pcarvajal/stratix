import type { AgentId, AgentVersion } from './types.js';
import type { AgentContext } from './AgentContext.js';
import type { ExecutionTrace } from './ExecutionTrace.js';

/**
 * Represents a complete agent execution record for audit purposes
 */
export interface AgentExecution {
  readonly id: string;
  readonly agentId: AgentId;
  readonly agentName: string;
  readonly agentVersion: AgentVersion;
  readonly input: unknown;
  readonly output: unknown;
  readonly context: AgentContext;
  readonly trace: ExecutionTrace;
  readonly success: boolean;
  readonly error?: Error;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly cost: number;
  readonly userId?: string;
}

/**
 * Filter criteria for querying executions
 */
export interface ExecutionFilter {
  readonly agentId?: AgentId;
  readonly userId?: string;
  readonly success?: boolean;
  readonly startTimeFrom?: Date;
  readonly startTimeTo?: Date;
  readonly minCost?: number;
  readonly maxCost?: number;
  readonly minDuration?: number;
  readonly maxDuration?: number;
}

/**
 * Interface for auditing and logging agent executions.
 *
 * Provides a complete audit trail of all agent activities for
 * compliance, debugging, and analytics purposes.
 *
 * @example
 * ```typescript
 * class DatabaseAuditLog implements ExecutionAuditLog {
 *   async logExecution(execution: AgentExecution): Promise<void> {
 *     await this.db.executions.insert({
 *       ...execution,
 *       trace: JSON.stringify(execution.trace.toJSON())
 *     });
 *   }
 *
 *   async queryExecutions(filter: ExecutionFilter): Promise<AgentExecution[]> {
 *     return await this.db.executions.find(filter);
 *   }
 * }
 * ```
 */
export interface ExecutionAuditLog {
  /**
   * Logs an agent execution
   *
   * @param execution - The execution record to log
   */
  logExecution(execution: AgentExecution): Promise<void>;

  /**
   * Queries executions with optional filters
   *
   * @param filter - Filter criteria
   * @returns Array of matching executions
   */
  queryExecutions(filter: ExecutionFilter): Promise<AgentExecution[]>;

  /**
   * Gets the execution history for a specific agent
   *
   * @param agentId - The agent ID
   * @param limit - Maximum number of records to return
   * @returns Array of executions for the agent
   */
  getAgentHistory(agentId: AgentId, limit?: number): Promise<AgentExecution[]>;

  /**
   * Gets the detailed execution trace for a specific execution
   *
   * @param executionId - The execution ID
   * @returns The execution trace, or null if not found
   */
  getExecutionTrace(executionId: string): Promise<ExecutionTrace | null>;

  /**
   * Gets execution statistics
   *
   * @param filter - Filter criteria
   * @returns Aggregated statistics
   */
  getStatistics(filter: ExecutionFilter): Promise<ExecutionStatistics>;
}

/**
 * Aggregated execution statistics
 */
export interface ExecutionStatistics {
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly averageDuration: number;
  readonly totalCost: number;
  readonly averageCost: number;
}
