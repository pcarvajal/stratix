import { describe, it, expect, beforeEach } from 'vitest';
import { AgentTool, type ToolDefinition } from '../../ai-agents/AgentTool.js';

// Test implementation of AgentTool
class TestTool extends AgentTool<{ value: number }, { result: number }> {
  readonly name = 'test_tool';
  readonly description = 'A simple test tool';
  readonly requiresApproval = false;

  async execute(input: { value: number }): Promise<{ result: number }> {
    return { result: input.value * 2 };
  }

  async validate(input: unknown): Promise<{ value: number }> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;
    if (typeof obj.value !== 'number') {
      throw new Error('value must be a number');
    }

    return { value: obj.value };
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Input value to double' },
        },
        required: ['value'],
      },
    };
  }
}

// Tool that requires approval
class ApprovalRequiredTool extends AgentTool<{ value: number }, { result: number }> {
  readonly name = 'approval_tool';
  readonly description = 'A tool that requires approval';
  readonly requiresApproval = true;

  async execute(input: { value: number }): Promise<{ result: number }> {
    return { result: input.value * 2 };
  }

  async validate(input: unknown): Promise<{ value: number }> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;
    if (typeof obj.value !== 'number') {
      throw new Error('value must be a number');
    }

    return { value: obj.value };
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Input value' },
        },
        required: ['value'],
      },
    };
  }
}

// Tool that can fail
class FailingTool extends AgentTool<{ fail: boolean }, { success: boolean }> {
  readonly name = 'failing_tool';
  readonly description = 'A tool that can fail';

  async execute(input: { fail: boolean }): Promise<{ success: boolean }> {
    if (input.fail) {
      throw new Error('Tool execution failed');
    }
    return { success: true };
  }

  async validate(input: unknown): Promise<{ fail: boolean }> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;
    if (typeof obj.fail !== 'boolean') {
      throw new Error('fail must be a boolean');
    }

    return { fail: obj.fail };
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          fail: { type: 'boolean', description: 'Whether to fail' },
        },
        required: ['fail'],
      },
    };
  }
}

describe('AgentTool', () => {
  describe('basic properties', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should have name and description', () => {
      expect(tool.name).toBe('test_tool');
      expect(tool.description).toBe('A simple test tool');
    });

    it('should not require approval by default', () => {
      expect(tool.requiresApproval).toBe(false);
    });

    it('should support tools that require approval', () => {
      const approvalTool = new ApprovalRequiredTool();
      expect(approvalTool.requiresApproval).toBe(true);
    });
  });

  describe('execute', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should execute with valid input', async () => {
      const result = await tool.execute({ value: 5 });

      expect(result).toEqual({ result: 10 });
    });

    it('should handle different inputs', async () => {
      const result1 = await tool.execute({ value: 10 });
      const result2 = await tool.execute({ value: 100 });

      expect(result1).toEqual({ result: 20 });
      expect(result2).toEqual({ result: 200 });
    });
  });

  describe('validate', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should validate correct input', async () => {
      const validated = await tool.validate({ value: 42 });

      expect(validated).toEqual({ value: 42 });
    });

    it('should reject null input', async () => {
      await expect(tool.validate(null)).rejects.toThrow('Input must be an object');
    });

    it('should reject non-object input', async () => {
      await expect(tool.validate('string')).rejects.toThrow('Input must be an object');
      await expect(tool.validate(123)).rejects.toThrow('Input must be an object');
      await expect(tool.validate(true)).rejects.toThrow('Input must be an object');
    });

    it('should reject object without value field', async () => {
      await expect(tool.validate({})).rejects.toThrow('value must be a number');
      await expect(tool.validate({ other: 'field' })).rejects.toThrow('value must be a number');
    });

    it('should reject non-number value', async () => {
      await expect(tool.validate({ value: 'string' })).rejects.toThrow('value must be a number');
      await expect(tool.validate({ value: true })).rejects.toThrow('value must be a number');
      await expect(tool.validate({ value: {} })).rejects.toThrow('value must be a number');
    });
  });

  describe('executeValidated', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should validate and execute with valid input', async () => {
      const result = await tool.executeValidated({ value: 7 });

      expect(result).toEqual({ result: 14 });
    });

    it('should throw on invalid input', async () => {
      await expect(tool.executeValidated({ value: 'invalid' })).rejects.toThrow(
        'value must be a number'
      );
      await expect(tool.executeValidated(null)).rejects.toThrow('Input must be an object');
      await expect(tool.executeValidated({})).rejects.toThrow('value must be a number');
    });

    it('should handle execution errors', async () => {
      const failingTool = new FailingTool();

      await expect(failingTool.executeValidated({ fail: true })).rejects.toThrow(
        'Tool execution failed'
      );
    });

    it('should succeed with valid input for failing tool', async () => {
      const failingTool = new FailingTool();
      const result = await failingTool.executeValidated({ fail: false });

      expect(result).toEqual({ success: true });
    });
  });

  describe('getDefinition', () => {
    let tool: TestTool;

    beforeEach(() => {
      tool = new TestTool();
    });

    it('should return tool definition', () => {
      const definition = tool.getDefinition();

      expect(definition.name).toBe('test_tool');
      expect(definition.description).toBe('A simple test tool');
      expect(definition.parameters).toHaveProperty('type', 'object');
      expect(definition.parameters).toHaveProperty('properties');
      expect(definition.parameters).toHaveProperty('required');
    });

    it('should include parameter schema', () => {
      const definition = tool.getDefinition();

      expect(definition.parameters).toMatchObject({
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Input value to double' },
        },
        required: ['value'],
      });
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle database query tool pattern', async () => {
      class DatabaseQueryTool extends AgentTool<
        { query: string; limit: number },
        { rows: unknown[]; count: number }
      > {
        readonly name = 'database_query';
        readonly description = 'Execute database query';

        async execute(input: { query: string; limit: number }) {
          // Simulate database query
          const mockRows = Array.from({ length: Math.min(input.limit, 5) }, (_, i) => ({
            id: i + 1,
            data: `Row ${i + 1}`,
          }));

          return { rows: mockRows, count: mockRows.length };
        }

        async validate(input: unknown) {
          if (typeof input !== 'object' || input === null) {
            throw new Error('Invalid input');
          }

          const obj = input as Record<string, unknown>;
          if (typeof obj.query !== 'string' || typeof obj.limit !== 'number') {
            throw new Error('Invalid parameters');
          }

          return { query: obj.query, limit: obj.limit };
        }

        getDefinition(): ToolDefinition {
          return {
            name: this.name,
            description: this.description,
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                limit: { type: 'number' },
              },
              required: ['query', 'limit'],
            },
          };
        }
      }

      const tool = new DatabaseQueryTool();
      const result = await tool.executeValidated({ query: 'SELECT * FROM users', limit: 3 });

      expect(result.rows).toHaveLength(3);
      expect(result.count).toBe(3);
    });

    it('should handle search tool pattern', async () => {
      class SearchTool extends AgentTool<
        { query: string; maxResults: number },
        { results: Array<{ id: string; title: string; score: number }> }
      > {
        readonly name = 'search';
        readonly description = 'Search knowledge base';

        async execute(input: { query: string; maxResults: number }) {
          // Simulate search
          const mockResults = Array.from({ length: Math.min(input.maxResults, 3) }, (_, i) => ({
            id: `doc-${i + 1}`,
            title: `Document ${i + 1} about ${input.query}`,
            score: 1 - i * 0.1,
          }));

          return { results: mockResults };
        }

        async validate(input: unknown) {
          if (typeof input !== 'object' || input === null) {
            throw new Error('Invalid input');
          }

          const obj = input as Record<string, unknown>;
          if (typeof obj.query !== 'string') {
            throw new Error('query must be a string');
          }
          if (typeof obj.maxResults !== 'number' || obj.maxResults <= 0) {
            throw new Error('maxResults must be a positive number');
          }

          return { query: obj.query, maxResults: obj.maxResults };
        }

        getDefinition(): ToolDefinition {
          return {
            name: this.name,
            description: this.description,
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                maxResults: { type: 'number', minimum: 1 },
              },
              required: ['query', 'maxResults'],
            },
          };
        }
      }

      const tool = new SearchTool();
      const result = await tool.executeValidated({ query: 'AI agents', maxResults: 2 });

      expect(result.results).toHaveLength(2);
      expect(result.results[0].title).toContain('AI agents');
      expect(result.results[0].score).toBeGreaterThan(result.results[1].score);
    });

    it('should handle tool that requires approval', async () => {
      class CreateRefundTool extends AgentTool<
        { orderId: string; amount: number; reason: string },
        { refundId: string; status: string }
      > {
        readonly name = 'create_refund';
        readonly description = 'Create customer refund';
        readonly requiresApproval = true;

        async execute(_input: { orderId: string; amount: number; reason: string }) {
          return {
            refundId: `ref-${Date.now()}`,
            status: 'pending_approval',
          };
        }

        async validate(input: unknown) {
          if (typeof input !== 'object' || input === null) {
            throw new Error('Invalid input');
          }

          const obj = input as Record<string, unknown>;
          if (
            typeof obj.orderId !== 'string' ||
            typeof obj.amount !== 'number' ||
            typeof obj.reason !== 'string'
          ) {
            throw new Error('Invalid parameters');
          }

          if (obj.amount <= 0) {
            throw new Error('Amount must be positive');
          }

          return { orderId: obj.orderId, amount: obj.amount, reason: obj.reason };
        }

        getDefinition(): ToolDefinition {
          return {
            name: this.name,
            description: this.description,
            parameters: {
              type: 'object',
              properties: {
                orderId: { type: 'string' },
                amount: { type: 'number' },
                reason: { type: 'string' },
              },
              required: ['orderId', 'amount', 'reason'],
            },
          };
        }
      }

      const tool = new CreateRefundTool();

      expect(tool.requiresApproval).toBe(true);

      const result = await tool.executeValidated({
        orderId: 'order-123',
        amount: 50.0,
        reason: 'Product damaged',
      });

      expect(result.status).toBe('pending_approval');
      expect(result.refundId).toMatch(/^ref-/);
    });
  });
});
