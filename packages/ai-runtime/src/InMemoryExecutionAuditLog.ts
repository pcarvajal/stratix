import type { AgentId, ExecutionTrace } from '@stratix/core';
import type {
  ExecutionAuditLog,
  AgentExecution,
  ExecutionFilter,
  ExecutionStatistics,
} from '@stratix/core';

/**
 * In-memory implementation of ExecutionAuditLog.
 *
 * Stores execution records in memory for auditing and analytics.
 * For production use, consider a database-backed implementation.
 *
 * @example
 * ```typescript
 * const auditLog = new InMemoryExecutionAuditLog();
 *
 * await auditLog.logExecution(execution);
 *
 * const history = await auditLog.getAgentHistory(agentId, 10);
 * const stats = await auditLog.getStatistics({ agentId });
 * ```
 */
export class InMemoryExecutionAuditLog implements ExecutionAuditLog {
  private executions = new Map<string, AgentExecution>();
  private agentIndex = new Map<string, Set<string>>();

  logExecution(execution: AgentExecution): Promise<void> {
    // Store execution
    this.executions.set(execution.id, execution);

    // Update agent index
    const agentId = execution.agentId.value;
    let executionSet = this.agentIndex.get(agentId);
    if (!executionSet) {
      executionSet = new Set<string>();
      this.agentIndex.set(agentId, executionSet);
    }
    executionSet.add(execution.id);

    return Promise.resolve();
  }

  queryExecutions(filter: ExecutionFilter): Promise<AgentExecution[]> {
    let results = Array.from(this.executions.values());

    // Apply filters
    if (filter.agentId) {
      const executionIds = this.agentIndex.get(filter.agentId.value);
      if (!executionIds) {
        return Promise.resolve([]);
      }
      results = results.filter((e) => executionIds.has(e.id));
    }

    if (filter.userId !== undefined) {
      results = results.filter((e) => e.userId === filter.userId);
    }

    if (filter.success !== undefined) {
      results = results.filter((e) => e.success === filter.success);
    }

    if (filter.startTimeFrom) {
      results = results.filter((e) => e.startTime >= filter.startTimeFrom!);
    }

    if (filter.startTimeTo) {
      results = results.filter((e) => e.startTime <= filter.startTimeTo!);
    }

    if (filter.minCost !== undefined) {
      results = results.filter((e) => e.cost >= filter.minCost!);
    }

    if (filter.maxCost !== undefined) {
      results = results.filter((e) => e.cost <= filter.maxCost!);
    }

    if (filter.minDuration !== undefined) {
      results = results.filter((e) => e.duration >= filter.minDuration!);
    }

    if (filter.maxDuration !== undefined) {
      results = results.filter((e) => e.duration <= filter.maxDuration!);
    }

    // Sort by start time descending (most recent first)
    results.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    return Promise.resolve(results);
  }

  getAgentHistory(agentId: AgentId, limit: number = 100): Promise<AgentExecution[]> {
    const executionIds = this.agentIndex.get(agentId.value);
    if (!executionIds) {
      return Promise.resolve([]);
    }

    const executions: AgentExecution[] = [];
    for (const id of executionIds) {
      const execution = this.executions.get(id);
      if (execution) {
        executions.push(execution);
      }
    }

    // Sort by start time descending
    executions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    // Apply limit
    return Promise.resolve(executions.slice(0, limit));
  }

  getExecutionTrace(executionId: string): Promise<ExecutionTrace | null> {
    const execution = this.executions.get(executionId);
    return Promise.resolve(execution?.trace ?? null);
  }

  async getStatistics(filter: ExecutionFilter): Promise<ExecutionStatistics> {
    const executions = await this.queryExecutions(filter);

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter((e) => e.success).length;
    const failedExecutions = totalExecutions - successfulExecutions;

    const totalDuration = executions.reduce((sum, e) => sum + e.duration, 0);
    const averageDuration = totalExecutions > 0 ? totalDuration / totalExecutions : 0;

    const totalCost = executions.reduce((sum, e) => sum + e.cost, 0);
    const averageCost = totalExecutions > 0 ? totalCost / totalExecutions : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageDuration,
      totalCost,
      averageCost,
    };
  }

  /**
   * Clears all execution records
   * Useful for testing
   */
  clear(): void {
    this.executions.clear();
    this.agentIndex.clear();
  }

  /**
   * Gets the total number of executions logged
   */
  count(): number {
    return this.executions.size;
  }

  /**
   * Gets all executions (useful for debugging)
   */
  getAll(): AgentExecution[] {
    return Array.from(this.executions.values());
  }
}
