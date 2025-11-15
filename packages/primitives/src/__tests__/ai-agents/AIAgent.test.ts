import { describe, it, expect, beforeEach } from 'vitest';
import { AIAgent } from '../../ai-agents/AIAgent.js';
import { AgentResult } from '../../ai-agents/AgentResult.js';
import { AgentContext } from '../../ai-agents/AgentContext.js';
import { EntityId } from '../../core/EntityId.js';
import { AgentVersionFactory, AgentCapabilities } from '../../ai-agents/types.js';
import type { ModelConfig, AgentMemory, MemoryEntry, MemoryType } from '../../ai-agents/types.js';

// Mock implementation of AgentMemory for testing
class MockAgentMemory implements AgentMemory {
  private storage = new Map<string, MemoryEntry>();

  async store(key: string, value: unknown, type: MemoryType): Promise<void> {
    this.storage.set(key, { value, type, timestamp: new Date() });
  }

  async retrieve(key: string): Promise<MemoryEntry | null> {
    return this.storage.get(key) || null;
  }

  async retrieveByType(type: MemoryType): Promise<MemoryEntry[]> {
    return Array.from(this.storage.values()).filter((entry) => entry.type === type);
  }

  async clear(type?: MemoryType): Promise<void> {
    if (type) {
      for (const [key, entry] of this.storage.entries()) {
        if (entry.type === type) {
          this.storage.delete(key);
        }
      }
    } else {
      this.storage.clear();
    }
  }
}

// Test implementation of AIAgent
class TestAgent extends AIAgent<{ input: string }, { output: string }> {
  readonly name = 'Test Agent';
  readonly description = 'A simple test agent';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.CUSTOMER_SUPPORT];
  readonly model: ModelConfig = {
    provider: 'test',
    model: 'test-model',
    temperature: 0.7,
    maxTokens: 100,
  };

  async execute(input: { input: string }): Promise<AgentResult<{ output: string }>> {
    return AgentResult.success(
      { output: `Processed: ${input.input}` },
      { model: this.model.model, duration: 100 }
    );
  }
}

describe('AIAgent', () => {
  describe('basic properties', () => {
    let agent: TestAgent;

    beforeEach(() => {
      agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
    });

    it('should have required properties', () => {
      expect(agent.name).toBe('Test Agent');
      expect(agent.description).toBe('A simple test agent');
      expect(agent.version.value).toBe('1.0.0');
      expect(agent.capabilities).toContain(AgentCapabilities.CUSTOMER_SUPPORT);
    });

    it('should have model configuration', () => {
      expect(agent.model.provider).toBe('test');
      expect(agent.model.model).toBe('test-model');
      expect(agent.model.temperature).toBe(0.7);
      expect(agent.model.maxTokens).toBe(100);
    });

    it('should have unique agent ID', () => {
      const agent1 = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
      const agent2 = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());

      expect(agent1.getAgentId()).not.toBe(agent2.getAgentId());
    });

    it('should check capabilities', () => {
      expect(agent.hasCapability(AgentCapabilities.CUSTOMER_SUPPORT)).toBe(true);
      expect(agent.hasCapability(AgentCapabilities.DATA_ANALYSIS)).toBe(false);
    });
  });

  describe('execute', () => {
    let agent: TestAgent;

    beforeEach(() => {
      agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
    });

    it('should execute and return result', async () => {
      const result = await agent.execute({ input: 'test' });

      expect(result.isSuccess()).toBe(true);
      expect(result.data?.output).toBe('Processed: test');
    });

    it('should handle different inputs', async () => {
      const result1 = await agent.execute({ input: 'hello' });
      const result2 = await agent.execute({ input: 'world' });

      expect(result1.data?.output).toBe('Processed: hello');
      expect(result2.data?.output).toBe('Processed: world');
    });
  });

  describe('context management', () => {
    let agent: TestAgent;
    let context: AgentContext;

    beforeEach(() => {
      agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
      context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });
    });

    it('should set context', () => {
      // setContext doesn't throw, so we just verify it can be called
      expect(() => agent.setContext(context)).not.toThrow();
    });
  });

  describe('memory management', () => {
    let agent: TestAgent;
    let memory: MockAgentMemory;

    beforeEach(() => {
      agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
      memory = new MockAgentMemory();
    });

    it('should set memory', () => {
      // setMemory doesn't throw, so we just verify it can be called
      expect(() => agent.setMemory(memory)).not.toThrow();
    });
  });

  describe('metadata', () => {
    it('should return metadata', () => {
      const agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());

      const metadata = agent.toMetadata();

      expect(metadata.name).toBe('Test Agent');
      expect(metadata.description).toBe('A simple test agent');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.capabilities).toContain(AgentCapabilities.CUSTOMER_SUPPORT);
      expect(metadata.model.provider).toBe('test');
    });

    it('should support multiple capabilities', () => {
      const agent = new (class extends TestAgent {
        readonly capabilities = [
          AgentCapabilities.CUSTOMER_SUPPORT,
          AgentCapabilities.DATA_ANALYSIS,
          AgentCapabilities.KNOWLEDGE_RETRIEVAL,
        ];
      })(EntityId.create<'AIAgent'>(), new Date(), new Date());

      expect(agent.capabilities).toHaveLength(3);
      expect(agent.hasCapability(AgentCapabilities.CUSTOMER_SUPPORT)).toBe(true);
      expect(agent.hasCapability(AgentCapabilities.DATA_ANALYSIS)).toBe(true);
      expect(agent.hasCapability(AgentCapabilities.KNOWLEDGE_RETRIEVAL)).toBe(true);
    });

    it('should support semantic versioning', () => {
      const v1 = AgentVersionFactory.create('1.0.0');
      const v2 = AgentVersionFactory.create('2.3.5');

      expect(v1.major).toBe(1);
      expect(v1.minor).toBe(0);
      expect(v1.patch).toBe(0);

      expect(v2.major).toBe(2);
      expect(v2.minor).toBe(3);
      expect(v2.patch).toBe(5);
    });
  });

  describe('domain events', () => {
    let agent: TestAgent;

    beforeEach(() => {
      agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
    });

    it('should record execution started event', async () => {
      await agent.executeWithEvents({ input: 'test' });

      const events = agent.pullDomainEvents();
      const startedEvent = events.find((e: any) => e.eventType === 'AgentExecutionStarted');

      expect(startedEvent).toBeDefined();
      expect(startedEvent).toMatchObject({
        eventType: 'AgentExecutionStarted',
        agentId: agent.id.value,
        agentName: 'Test Agent',
        input: { input: 'test' },
      });
    });

    it('should record execution completed event', async () => {
      await agent.executeWithEvents({ input: 'test' });

      const events = agent.pullDomainEvents();
      const completedEvent = events.find((e: any) => e.eventType === 'AgentExecutionCompleted');

      expect(completedEvent).toBeDefined();
      expect(completedEvent).toMatchObject({
        eventType: 'AgentExecutionCompleted',
        agentId: agent.id.value,
        agentName: 'Test Agent',
        output: { output: 'Processed: test' },
      });
      expect((completedEvent as any).durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should record execution failed event on error', async () => {
      const errorAgent = new (class extends TestAgent {
        async execute(): Promise<AgentResult<{ output: string }>> {
          throw new Error('Test error');
        }
      })(EntityId.create<'AIAgent'>(), new Date(), new Date());

      await expect(errorAgent.executeWithEvents({ input: 'test' })).rejects.toThrow('Test error');

      const events = errorAgent.pullDomainEvents();
      const failedEvent = events.find((e: any) => e.eventType === 'AgentExecutionFailed');

      expect(failedEvent).toBeDefined();
      expect(failedEvent).toMatchObject({
        eventType: 'AgentExecutionFailed',
        agentId: errorAgent.id.value,
        agentName: 'Test Agent',
        error: 'Test error',
      });
      expect((failedEvent as any).durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should record context updated event', () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });
      context.addMessage({ role: 'user', content: 'Hello', timestamp: new Date() });

      agent.setContext(context);

      const events = agent.pullDomainEvents();
      const contextEvent = events.find((e: any) => e.eventType === 'AgentContextUpdated');

      expect(contextEvent).toBeDefined();
      expect(contextEvent).toMatchObject({
        eventType: 'AgentContextUpdated',
        agentId: agent.id.value,
        agentName: 'Test Agent',
        contextId: 'session-456',
        messagesCount: 1,
      });
    });

    it('should record memory stored event', async () => {
      const memory = new MockAgentMemory();
      agent.setMemory(memory);

      const testAgent = agent as any;
      await testAgent.remember('test-key', 'test-value', 'short');

      const events = agent.pullDomainEvents();
      const memoryEvent = events.find((e: any) => e.eventType === 'AgentMemoryStored');

      expect(memoryEvent).toBeDefined();
      expect(memoryEvent).toMatchObject({
        eventType: 'AgentMemoryStored',
        agentId: agent.id.value,
        agentName: 'Test Agent',
        memoryKey: 'test-key',
        memoryType: 'short',
      });
    });

    it('should clear events after pulling', async () => {
      await agent.executeWithEvents({ input: 'test' });

      const events1 = agent.pullDomainEvents();
      expect(events1.length).toBeGreaterThan(0);

      const events2 = agent.pullDomainEvents();
      expect(events2.length).toBe(0);
    });

    it('should check if has domain events', async () => {
      expect(agent.hasDomainEvents()).toBe(false);

      await agent.executeWithEvents({ input: 'test' });

      expect(agent.hasDomainEvents()).toBe(true);

      agent.pullDomainEvents();

      expect(agent.hasDomainEvents()).toBe(false);
    });

    it('should include context ID in execution events', async () => {
      const context = new AgentContext({
        userId: 'user-123',
        sessionId: 'session-456',
        environment: 'development',
      });
      agent.setContext(context);

      await agent.executeWithEvents({ input: 'test' });

      const events = agent.pullDomainEvents();
      const startedEvent = events.find((e: any) => e.eventType === 'AgentExecutionStarted');
      const completedEvent = events.find((e: any) => e.eventType === 'AgentExecutionCompleted');

      expect((startedEvent as any).contextId).toBe('session-456');
      expect((completedEvent as any).contextId).toBe('session-456');
    });

    it('should include cost and token metrics in completed event', async () => {
      const agentWithMetrics = new (class extends TestAgent {
        async execute(input: { input: string }): Promise<AgentResult<{ output: string }>> {
          return AgentResult.success(
            { output: `Processed: ${input.input}` },
            { model: this.model.model, duration: 100, totalTokens: 500, cost: 0.01 }
          );
        }
      })(EntityId.create<'AIAgent'>(), new Date(), new Date());

      await agentWithMetrics.executeWithEvents({ input: 'test' });

      const events = agentWithMetrics.pullDomainEvents();
      const completedEvent = events.find((e: any) => e.eventType === 'AgentExecutionCompleted');

      expect((completedEvent as any).tokensUsed).toBe(500);
      expect((completedEvent as any).cost).toBe(0.01);
    });
  });
});
