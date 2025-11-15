import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryExecutionAuditLog } from '../InMemoryExecutionAuditLog.js';
import { EntityId, ExecutionTrace } from '@stratix/primitives';
import type { AgentId, AgentExecutionMetadata } from '@stratix/primitives';
import type { AgentExecution } from '@stratix/abstractions';

// Helper to create test executions
function createExecution(
  agentId: AgentId,
  options: {
    id?: string;
    userId?: string;
    success?: boolean;
    cost?: number;
    duration?: number;
    startTime?: Date;
    input?: unknown;
    output?: unknown;
    error?: string;
    trace?: ExecutionTrace;
  } = {}
): AgentExecution {
  const startTime = options.startTime || new Date();
  const metadata: AgentExecutionMetadata = {
    duration: options.duration ?? 100,
    cost: options.cost ?? 0.01,
  };

  return {
    id: options.id || `exec-${Date.now()}-${Math.random()}`,
    agentId,
    userId: options.userId,
    success: options.success ?? true,
    startTime,
    endTime: new Date(startTime.getTime() + (options.duration ?? 100)),
    duration: options.duration ?? 100,
    cost: options.cost ?? 0.01,
    input: options.input ?? { test: 'input' },
    output: options.success !== false ? (options.output ?? { test: 'output' }) : undefined,
    error: options.error,
    metadata,
    trace: options.trace,
  };
}

describe('InMemoryExecutionAuditLog', () => {
  let auditLog: InMemoryExecutionAuditLog;
  let agentId: AgentId;

  beforeEach(() => {
    auditLog = new InMemoryExecutionAuditLog();
    agentId = EntityId.create<'AIAgent'>();
  });

  describe('logExecution', () => {
    it('should log an execution', async () => {
      const execution = createExecution(agentId);

      await auditLog.logExecution(execution);

      expect(auditLog.count()).toBe(1);
    });

    it('should log multiple executions', async () => {
      const execution1 = createExecution(agentId, { id: 'exec-1' });
      const execution2 = createExecution(agentId, { id: 'exec-2' });
      const execution3 = createExecution(agentId, { id: 'exec-3' });

      await auditLog.logExecution(execution1);
      await auditLog.logExecution(execution2);
      await auditLog.logExecution(execution3);

      expect(auditLog.count()).toBe(3);
    });

    it('should update agent index', async () => {
      const agentId1 = EntityId.create<'AIAgent'>();
      const agentId2 = EntityId.create<'AIAgent'>();

      await auditLog.logExecution(createExecution(agentId1));
      await auditLog.logExecution(createExecution(agentId2));

      const history1 = await auditLog.getAgentHistory(agentId1);
      const history2 = await auditLog.getAgentHistory(agentId2);

      expect(history1).toHaveLength(1);
      expect(history2).toHaveLength(1);
    });
  });

  describe('queryExecutions', () => {
    beforeEach(async () => {
      const agentId1 = EntityId.create<'AIAgent'>();
      const agentId2 = EntityId.create<'AIAgent'>();

      await auditLog.logExecution(
        createExecution(agentId1, {
          id: 'exec-1',
          userId: 'user-1',
          success: true,
          cost: 0.01,
          duration: 100,
          startTime: new Date('2025-01-01T10:00:00Z'),
        })
      );

      await auditLog.logExecution(
        createExecution(agentId1, {
          id: 'exec-2',
          userId: 'user-1',
          success: false,
          cost: 0.005,
          duration: 50,
          startTime: new Date('2025-01-01T11:00:00Z'),
          error: 'Execution failed',
        })
      );

      await auditLog.logExecution(
        createExecution(agentId2, {
          id: 'exec-3',
          userId: 'user-2',
          success: true,
          cost: 0.02,
          duration: 200,
          startTime: new Date('2025-01-01T12:00:00Z'),
        })
      );

      await auditLog.logExecution(
        createExecution(agentId1, {
          id: 'exec-4',
          userId: 'user-2',
          success: true,
          cost: 0.03,
          duration: 300,
          startTime: new Date('2025-01-01T13:00:00Z'),
        })
      );
    });

    it('should return all executions when no filter', async () => {
      const results = await auditLog.queryExecutions({});

      expect(results).toHaveLength(4);
    });

    it('should filter by agentId', async () => {
      const agentId1 = EntityId.create<'AIAgent'>();
      await auditLog.logExecution(createExecution(agentId1, { id: 'test-1' }));

      const results = await auditLog.queryExecutions({ agentId: agentId1 });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-1');
    });

    it('should filter by userId', async () => {
      const results = await auditLog.queryExecutions({ userId: 'user-1' });

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.userId === 'user-1')).toBe(true);
    });

    it('should filter by success', async () => {
      const successResults = await auditLog.queryExecutions({ success: true });
      const failureResults = await auditLog.queryExecutions({ success: false });

      expect(successResults).toHaveLength(3);
      expect(failureResults).toHaveLength(1);
      expect(failureResults[0].success).toBe(false);
    });

    it('should filter by time range', async () => {
      const results = await auditLog.queryExecutions({
        startTimeFrom: new Date('2025-01-01T11:30:00Z'),
        startTimeTo: new Date('2025-01-01T12:30:00Z'),
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('exec-3');
    });

    it('should filter by cost range', async () => {
      const results = await auditLog.queryExecutions({
        minCost: 0.015,
        maxCost: 0.025,
      });

      expect(results).toHaveLength(1);
      expect(results[0].cost).toBe(0.02);
    });

    it('should filter by duration range', async () => {
      const results = await auditLog.queryExecutions({
        minDuration: 150,
        maxDuration: 250,
      });

      expect(results).toHaveLength(1);
      expect(results[0].duration).toBe(200);
    });

    it('should combine multiple filters', async () => {
      const results = await auditLog.queryExecutions({
        userId: 'user-1',
        success: true,
        minCost: 0.008,
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('exec-1');
    });

    it('should return results sorted by start time descending', async () => {
      const results = await auditLog.queryExecutions({});

      expect(results[0].id).toBe('exec-4'); // Most recent
      expect(results[3].id).toBe('exec-1'); // Oldest
    });
  });

  describe('getAgentHistory', () => {
    it('should return agent execution history', async () => {
      await auditLog.logExecution(createExecution(agentId, { id: 'exec-1' }));
      await auditLog.logExecution(createExecution(agentId, { id: 'exec-2' }));
      await auditLog.logExecution(createExecution(agentId, { id: 'exec-3' }));

      const history = await auditLog.getAgentHistory(agentId);

      expect(history).toHaveLength(3);
    });

    it('should limit results', async () => {
      for (let i = 0; i < 10; i++) {
        await auditLog.logExecution(createExecution(agentId, { id: `exec-${i}` }));
      }

      const history = await auditLog.getAgentHistory(agentId, 5);

      expect(history).toHaveLength(5);
    });

    it('should return empty array for non-existent agent', async () => {
      const nonExistentId = EntityId.create<'AIAgent'>();
      const history = await auditLog.getAgentHistory(nonExistentId);

      expect(history).toEqual([]);
    });

    it('should return history sorted by start time descending', async () => {
      const exec1 = createExecution(agentId, {
        id: 'exec-1',
        startTime: new Date('2025-01-01T10:00:00Z'),
      });
      const exec2 = createExecution(agentId, {
        id: 'exec-2',
        startTime: new Date('2025-01-01T11:00:00Z'),
      });
      const exec3 = createExecution(agentId, {
        id: 'exec-3',
        startTime: new Date('2025-01-01T12:00:00Z'),
      });

      await auditLog.logExecution(exec1);
      await auditLog.logExecution(exec2);
      await auditLog.logExecution(exec3);

      const history = await auditLog.getAgentHistory(agentId);

      expect(history[0].id).toBe('exec-3'); // Most recent
      expect(history[2].id).toBe('exec-1'); // Oldest
    });
  });

  describe('getExecutionTrace', () => {
    it('should return execution trace', async () => {
      const trace = new ExecutionTrace(agentId, new Date());
      const execution = createExecution(agentId, { id: 'exec-1', trace });

      await auditLog.logExecution(execution);

      const retrievedTrace = await auditLog.getExecutionTrace('exec-1');

      expect(retrievedTrace).toBe(trace);
    });

    it('should return null for non-existent execution', async () => {
      const trace = await auditLog.getExecutionTrace('non-existent');

      expect(trace).toBeNull();
    });

    it('should return null for execution without trace', async () => {
      const execution = createExecution(agentId, { id: 'exec-1' });

      await auditLog.logExecution(execution);

      const trace = await auditLog.getExecutionTrace('exec-1');

      expect(trace).toBeNull();
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      await auditLog.logExecution(
        createExecution(agentId, {
          success: true,
          cost: 0.01,
          duration: 100,
        })
      );

      await auditLog.logExecution(
        createExecution(agentId, {
          success: true,
          cost: 0.02,
          duration: 200,
        })
      );

      await auditLog.logExecution(
        createExecution(agentId, {
          success: false,
          cost: 0.005,
          duration: 50,
        })
      );
    });

    it('should calculate statistics', async () => {
      const stats = await auditLog.getStatistics({ agentId });

      expect(stats.totalExecutions).toBe(3);
      expect(stats.successfulExecutions).toBe(2);
      expect(stats.failedExecutions).toBe(1);
      expect(stats.averageDuration).toBe((100 + 200 + 50) / 3);
      expect(stats.totalCost).toBeCloseTo(0.035, 10);
      expect(stats.averageCost).toBeCloseTo(0.035 / 3, 10);
    });

    it('should return zero statistics for no executions', async () => {
      const nonExistentId = EntityId.create<'AIAgent'>();
      const stats = await auditLog.getStatistics({ agentId: nonExistentId });

      expect(stats.totalExecutions).toBe(0);
      expect(stats.successfulExecutions).toBe(0);
      expect(stats.failedExecutions).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.totalCost).toBe(0);
      expect(stats.averageCost).toBe(0);
    });

    it('should respect filters', async () => {
      const stats = await auditLog.getStatistics({
        agentId,
        success: true,
      });

      expect(stats.totalExecutions).toBe(2);
      expect(stats.successfulExecutions).toBe(2);
      expect(stats.failedExecutions).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all executions', async () => {
      await auditLog.logExecution(createExecution(agentId));
      await auditLog.logExecution(createExecution(agentId));

      expect(auditLog.count()).toBe(2);

      auditLog.clear();

      expect(auditLog.count()).toBe(0);
    });

    it('should clear agent index', async () => {
      await auditLog.logExecution(createExecution(agentId));

      auditLog.clear();

      const history = await auditLog.getAgentHistory(agentId);
      expect(history).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return execution count', async () => {
      expect(auditLog.count()).toBe(0);

      await auditLog.logExecution(createExecution(agentId));
      expect(auditLog.count()).toBe(1);

      await auditLog.logExecution(createExecution(agentId));
      expect(auditLog.count()).toBe(2);
    });
  });

  describe('getAll', () => {
    it('should return all executions', async () => {
      await auditLog.logExecution(createExecution(agentId, { id: 'exec-1' }));
      await auditLog.logExecution(createExecution(agentId, { id: 'exec-2' }));

      const all = auditLog.getAll();

      expect(all).toHaveLength(2);
    });

    it('should return empty array when no executions', () => {
      const all = auditLog.getAll();

      expect(all).toEqual([]);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should track agent performance over time', async () => {
      const agent1 = EntityId.create<'AIAgent'>();

      // Day 1: 3 executions
      for (let i = 0; i < 3; i++) {
        await auditLog.logExecution(
          createExecution(agent1, {
            success: true,
            cost: 0.01,
            duration: 100,
            startTime: new Date('2025-01-01T10:00:00Z'),
          })
        );
      }

      // Day 2: 2 executions, 1 failed
      await auditLog.logExecution(
        createExecution(agent1, {
          success: true,
          cost: 0.02,
          duration: 150,
          startTime: new Date('2025-01-02T10:00:00Z'),
        })
      );

      await auditLog.logExecution(
        createExecution(agent1, {
          success: false,
          cost: 0.005,
          duration: 50,
          startTime: new Date('2025-01-02T11:00:00Z'),
          error: 'API timeout',
        })
      );

      // Day 1 stats
      const day1Stats = await auditLog.getStatistics({
        agentId: agent1,
        startTimeFrom: new Date('2025-01-01T00:00:00Z'),
        startTimeTo: new Date('2025-01-01T23:59:59Z'),
      });

      expect(day1Stats.totalExecutions).toBe(3);
      expect(day1Stats.successfulExecutions).toBe(3);

      // Day 2 stats
      const day2Stats = await auditLog.getStatistics({
        agentId: agent1,
        startTimeFrom: new Date('2025-01-02T00:00:00Z'),
        startTimeTo: new Date('2025-01-02T23:59:59Z'),
      });

      expect(day2Stats.totalExecutions).toBe(2);
      expect(day2Stats.successfulExecutions).toBe(1);
      expect(day2Stats.failedExecutions).toBe(1);
    });

    it('should track cost by user', async () => {
      await auditLog.logExecution(
        createExecution(agentId, {
          userId: 'user-1',
          cost: 0.1,
          duration: 1000,
        })
      );

      await auditLog.logExecution(
        createExecution(agentId, {
          userId: 'user-1',
          cost: 0.15,
          duration: 1500,
        })
      );

      await auditLog.logExecution(
        createExecution(agentId, {
          userId: 'user-2',
          cost: 0.05,
          duration: 500,
        })
      );

      const user1Stats = await auditLog.getStatistics({ userId: 'user-1' });
      const user2Stats = await auditLog.getStatistics({ userId: 'user-2' });

      expect(user1Stats.totalCost).toBeCloseTo(0.25, 10);
      expect(user2Stats.totalCost).toBe(0.05);
    });

    it('should identify expensive executions', async () => {
      await auditLog.logExecution(createExecution(agentId, { cost: 0.01 }));
      await auditLog.logExecution(createExecution(agentId, { cost: 0.5 }));
      await auditLog.logExecution(createExecution(agentId, { cost: 0.02 }));
      await auditLog.logExecution(createExecution(agentId, { cost: 0.75 }));

      const expensiveExecutions = await auditLog.queryExecutions({
        minCost: 0.4,
      });

      expect(expensiveExecutions).toHaveLength(2);
      expect(expensiveExecutions.every((e) => e.cost >= 0.4)).toBe(true);
    });
  });
});
