import { describe, it, expect } from 'vitest';
import { AgentResult } from '../../ai-agents/AgentResult.js';
import { EntityId } from '../../core/EntityId.js';

describe('AgentResult', () => {
  describe('success', () => {
    it('should create a successful result', () => {
      const data = { message: 'Hello' };
      const metadata = { model: 'gpt-4', duration: 100, cost: 0.01 };
      const result = AgentResult.success(data, metadata);

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.data).toEqual(data);
      expect(result.metadata).toEqual(metadata);
      expect(result.error).toBeUndefined();
    });

    it('should support any data type', () => {
      const stringResult = AgentResult.success('hello', { duration: 100 });
      const numberResult = AgentResult.success(42, { duration: 100 });
      const arrayResult = AgentResult.success([1, 2, 3], { duration: 100 });
      const objectResult = AgentResult.success({ id: 1, name: 'test' }, { duration: 100 });

      expect(stringResult.data).toBe('hello');
      expect(numberResult.data).toBe(42);
      expect(arrayResult.data).toEqual([1, 2, 3]);
      expect(objectResult.data).toEqual({ id: 1, name: 'test' });
    });

    it('should include optional metadata fields', () => {
      const result = AgentResult.success(
        { result: 'ok' },
        {
          model: 'gpt-4',
          duration: 150,
          cost: 0.02,
          totalTokens: 500,
          retries: 1,
        }
      );

      expect(result.metadata.model).toBe('gpt-4');
      expect(result.metadata.duration).toBe(150);
      expect(result.metadata.cost).toBe(0.02);
      expect(result.metadata.totalTokens).toBe(500);
      expect(result.metadata.retries).toBe(1);
    });
  });

  describe('failure', () => {
    it('should create a failed result', () => {
      const error = new Error('Something went wrong');
      const metadata = { duration: 50 };
      const result = AgentResult.failure<string>(error, metadata);

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe(error);
      expect(result.data).toBeUndefined();
      expect(result.metadata).toEqual(metadata);
    });

    it('should support custom error types', () => {
      class CustomError extends Error {
        constructor(
          public code: string,
          message: string
        ) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('AGENT_ERROR', 'Agent execution failed');
      const result = AgentResult.failure<string>(error, { duration: 100 });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(CustomError);
      expect((result.error as CustomError).code).toBe('AGENT_ERROR');
    });

    it('should include metadata even on failure', () => {
      const result = AgentResult.failure<string>(new Error('fail'), {
        model: 'gpt-4',
        duration: 200,
        cost: 0.01,
        retries: 3,
      });

      expect(result.metadata.model).toBe('gpt-4');
      expect(result.metadata.duration).toBe(200);
      expect(result.metadata.cost).toBe(0.01);
      expect(result.metadata.retries).toBe(3);
    });
  });

  describe('unwrap', () => {
    it('should return data for successful result', () => {
      const data = { message: 'Success' };
      const result = AgentResult.success(data, { duration: 100 });

      expect(result.unwrap()).toEqual(data);
    });

    it('should throw error for failed result', () => {
      const error = new Error('Failed');
      const result = AgentResult.failure<string>(error, { duration: 100 });

      expect(() => result.unwrap()).toThrow(error);
    });
  });

  describe('unwrapOr', () => {
    it('should return data for successful result', () => {
      const data = { message: 'Success' };
      const result = AgentResult.success(data, { duration: 100 });
      const fallback = { message: 'Fallback' };

      expect(result.unwrapOr(fallback)).toEqual(data);
    });

    it('should return fallback for failed result', () => {
      const result = AgentResult.failure<{ message: string }>(new Error('Failed'), {
        duration: 100,
      });
      const fallback = { message: 'Fallback' };

      expect(result.unwrapOr(fallback)).toEqual(fallback);
    });

    it('should handle different fallback types', () => {
      const stringResult = AgentResult.failure<string>(new Error('fail'), { duration: 100 });
      const numberResult = AgentResult.failure<number>(new Error('fail'), { duration: 100 });
      const arrayResult = AgentResult.failure<number[]>(new Error('fail'), { duration: 100 });

      expect(stringResult.unwrapOr('default')).toBe('default');
      expect(numberResult.unwrapOr(0)).toBe(0);
      expect(arrayResult.unwrapOr([])).toEqual([]);
    });
  });

  describe('withTrace', () => {
    it('should attach execution trace', () => {
      const agentId = EntityId.create<'AIAgent'>();
      const trace = new (class {
        constructor(
          public agentId: any,
          public startTime: Date
        ) {}
        complete() {}
        getSteps() {
          return [];
        }
        getLLMCalls() {
          return [];
        }
        getToolCalls() {
          return [];
        }
      })(agentId, new Date());

      const result = AgentResult.success({ data: 'test' }, { duration: 100 });
      const withTrace = result.withTrace(trace as any);

      expect(withTrace.trace).toBe(trace);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle agent execution flow', () => {
      interface Input {
        query: string;
      }
      interface Output {
        response: string;
        confidence: number;
      }

      const executeAgent = (input: Input): AgentResult<Output> => {
        if (!input.query) {
          return AgentResult.failure(new Error('Query is required'), { duration: 10 });
        }

        return AgentResult.success(
          { response: `Answer to: ${input.query}`, confidence: 0.95 },
          { model: 'gpt-4', duration: 150, cost: 0.02 }
        );
      };

      const successResult = executeAgent({ query: 'What is AI?' });
      const failureResult = executeAgent({ query: '' });

      expect(successResult.isSuccess()).toBe(true);
      expect(successResult.data?.response).toContain('What is AI?');
      expect(failureResult.isFailure()).toBe(true);
    });

    it('should handle cost tracking', () => {
      const results = [
        AgentResult.success('result1', { cost: 0.01, duration: 100 }),
        AgentResult.success('result2', { cost: 0.02, duration: 150 }),
        AgentResult.failure<string>(new Error('fail'), { cost: 0.005, duration: 50 }),
      ];

      const totalCost = results.reduce((sum, result) => {
        return sum + (result.metadata.cost || 0);
      }, 0);

      expect(totalCost).toBeCloseTo(0.035, 10);
    });

    it('should handle result aggregation', () => {
      const results = [
        AgentResult.success(10, { duration: 100 }),
        AgentResult.success(20, { duration: 150 }),
        AgentResult.success(30, { duration: 200 }),
      ];

      const sum = results
        .filter((r) => r.isSuccess())
        .map((r) => r.data!)
        .reduce((acc, val) => acc + val, 0);

      expect(sum).toBe(60);
    });

    it('should handle retry scenarios', () => {
      const attempts = [
        AgentResult.failure<string>(new Error('Rate limit'), { retries: 0, duration: 50 }),
        AgentResult.failure<string>(new Error('Timeout'), { retries: 1, duration: 100 }),
        AgentResult.success('Success', { retries: 2, duration: 150 }),
      ];

      const finalResult = attempts[attempts.length - 1];
      expect(finalResult.isSuccess()).toBe(true);
      expect(finalResult.metadata.retries).toBe(2);
    });
  });
});
