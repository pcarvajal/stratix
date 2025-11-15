import { describe, it, expect, beforeEach } from 'vitest';
import { AgentContext } from '../../ai-agents/AgentContext.js';
import type { AgentCost } from '../../ai-agents/types.js';

describe('AgentContext', () => {
  describe('construction', () => {
    it('should create context with required fields', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });

      expect(context.userId).toBe('user-123');
      expect(context.sessionId).toBe('session-456');
    });

    it('should create context with optional fields', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'production',
        metadata: { region: 'us-east-1', version: '1.0.0' },
      });

      expect(context.environment).toBe('production');
      expect(context.metadata).toEqual({ region: 'us-east-1', version: '1.0.0' });
    });

    it('should set environment correctly', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });

      expect(context.environment).toBe('development');
    });
  });

  describe('budget management', () => {
    let context: AgentContext;

    beforeEach(() => {
      context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });
    });

    it('should set budget', () => {
      context.setBudget(10.0);
      // Budget is tracked internally, check via remaining budget
      expect(context.getRemainingBudget()).toBe(10.0);
    });

    it('should throw error for negative budget', () => {
      expect(() => context.setBudget(-1)).toThrow('Budget must be positive');
    });

    it('should throw error for zero budget', () => {
      expect(() => context.setBudget(0)).toThrow('Budget must be positive');
    });

    it('should allow updating budget', () => {
      context.setBudget(5.0);
      expect(context.getRemainingBudget()).toBe(5.0);

      context.setBudget(10.0);
      expect(context.getRemainingBudget()).toBe(10.0);
    });

    it('should return undefined when no budget is set', () => {
      expect(context.getRemainingBudget()).toBeUndefined();
    });
  });

  describe('cost tracking', () => {
    let context: AgentContext;

    beforeEach(() => {
      context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });
    });

    it('should record a single cost', () => {
      const cost: AgentCost = {
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.015,
      };

      context.recordCost(cost);
      expect(context.getCosts()).toHaveLength(1);
      expect(context.getCosts()[0]).toEqual(cost);
    });

    it('should record multiple costs', () => {
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.015,
      });

      context.recordCost({
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        inputTokens: 200,
        outputTokens: 100,
        cost: 0.012,
      });

      expect(context.getCosts()).toHaveLength(2);
    });

    it('should calculate total cost', () => {
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.01,
      });
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 200,
        outputTokens: 100,
        cost: 0.02,
      });
      context.recordCost({
        provider: 'anthropic',
        model: 'claude-3',
        inputTokens: 150,
        outputTokens: 75,
        cost: 0.015,
      });

      expect(context.getTotalCost()).toBe(0.045);
    });

    it('should return zero when no costs recorded', () => {
      expect(context.getTotalCost()).toBe(0);
    });

    it('should handle floating point precision', () => {
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.1,
      });
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.2,
      });

      expect(context.getTotalCost()).toBeCloseTo(0.3, 10);
    });
  });

  describe('budget enforcement', () => {
    let context: AgentContext;

    beforeEach(() => {
      context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });
    });

    it('should not exceed budget when no budget is set', () => {
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 1000,
        outputTokens: 500,
        cost: 10.0,
      });
      expect(context.isBudgetExceeded()).toBe(false);
    });

    it('should not exceed budget when under limit', () => {
      context.setBudget(1.0);
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.5,
      });

      expect(context.isBudgetExceeded()).toBe(false);
    });

    it('should exceed budget when at limit', () => {
      context.setBudget(1.0);
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 1.0,
      });

      expect(context.isBudgetExceeded()).toBe(true);
    });

    it('should exceed budget when over limit', () => {
      context.setBudget(1.0);
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.6,
      });
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.5,
      });

      expect(context.isBudgetExceeded()).toBe(true);
    });

    it('should calculate remaining budget', () => {
      context.setBudget(5.0);
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 1.5,
      });

      expect(context.getRemainingBudget()).toBe(3.5);
    });

    it('should return undefined remaining budget when no budget set', () => {
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 1.5,
      });

      expect(context.getRemainingBudget()).toBeUndefined();
    });

    it('should return zero remaining budget when exceeded', () => {
      context.setBudget(1.0);
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 1.5,
      });

      // getRemainingBudget returns Math.max(0, budget - cost), so it never goes negative
      expect(context.getRemainingBudget()).toBe(0);
      expect(context.isBudgetExceeded()).toBe(true);
    });
  });

  describe('metadata management', () => {
    it('should store and retrieve metadata', () => {
      const metadata = {
        requestId: 'req-123',
        source: 'api',
        priority: 'high',
      };

      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
        metadata,
      });

      expect(context.metadata).toEqual(metadata);
    });

    it('should handle complex metadata', () => {
      const metadata = {
        user: {
          id: 'user-123',
          name: 'Alice',
          roles: ['admin', 'developer'],
        },
        request: {
          timestamp: new Date('2025-01-01'),
          headers: { 'x-api-key': 'secret' },
        },
      };

      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
        metadata,
      });

      expect(context.metadata).toEqual(metadata);
    });

    it('should return empty object when no metadata provided', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });

      expect(context.metadata).toEqual({});
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle multi-step agent execution with budget', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });

      context.setBudget(1.0);

      // Step 1: Initial query
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.3,
      });
      expect(context.isBudgetExceeded()).toBe(false);

      // Step 2: Follow-up query
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 150,
        outputTokens: 75,
        cost: 0.4,
      });
      expect(context.isBudgetExceeded()).toBe(false);

      // Step 3: Final query
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 200,
        outputTokens: 100,
        cost: 0.5,
      });
      expect(context.isBudgetExceeded()).toBe(true);

      expect(context.getTotalCost()).toBe(1.2);
      // getRemainingBudget returns Math.max(0, ...), so it's 0 when exceeded
      expect(context.getRemainingBudget()).toBe(0);
    });

    it('should handle mixed provider costs', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });

      context.setBudget(2.0);

      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.5,
      });
      context.recordCost({
        provider: 'anthropic',
        model: 'claude-3-opus',
        inputTokens: 200,
        outputTokens: 100,
        cost: 0.75,
      });
      context.recordCost({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        inputTokens: 300,
        outputTokens: 150,
        cost: 0.05,
      });

      expect(context.getTotalCost()).toBe(1.3);
      expect(context.getRemainingBudget()).toBe(0.7);
      expect(context.isBudgetExceeded()).toBe(false);
    });

    it('should track costs per provider', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });

      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.3,
      });
      context.recordCost({
        provider: 'openai',
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.3,
      });
      context.recordCost({
        provider: 'anthropic',
        model: 'claude-3',
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.2,
      });

      const costs = context.getCosts();
      const openaiCosts = costs.filter((c) => c.provider === 'openai');
      const anthropicCosts = costs.filter((c) => c.provider === 'anthropic');

      expect(openaiCosts).toHaveLength(2);
      expect(anthropicCosts).toHaveLength(1);

      const openaiTotal = openaiCosts.reduce((sum, c) => sum + c.cost, 0);
      const anthropicTotal = anthropicCosts.reduce((sum, c) => sum + c.cost, 0);

      expect(openaiTotal).toBe(0.6);
      expect(anthropicTotal).toBe(0.2);
    });

    it('should handle production context with metadata', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'production',
        metadata: {
          organizationId: 'org-789',
          tier: 'enterprise',
          maxBudget: 10.0,
          region: 'us-east-1',
        },
      });

      context.setBudget(10.0);

      expect(context.environment).toBe('production');
      expect(context.metadata.tier).toBe('enterprise');
      expect(context.getRemainingBudget()).toBe(10.0);
    });
  });
});
