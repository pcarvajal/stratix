import { describe, it, expect, beforeEach } from 'vitest';
import { AIAgent } from '../../ai-agents/AIAgent.js';
import { AgentResult } from '../../ai-agents/AgentResult.js';
import { AgentContext } from '../../ai-agents/AgentContext.js';
import { InMemoryAgentMemory } from '../../ai-agents/AgentMemory.js';
import { EntityId } from '../../core/EntityId.js';
import { AgentVersionFactory, AgentCapability } from '../../ai-agents/types.js';
import type { ModelConfig } from '../../ai-agents/types.js';

// Test implementation of AIAgent
class TestAgent extends AIAgent<{ input: string }, { output: string }> {
  readonly name = 'Test Agent';
  readonly description = 'A simple test agent';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapability.CUSTOMER_SUPPORT];
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
      expect(agent.capabilities).toContain(AgentCapability.CUSTOMER_SUPPORT);
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
      expect(agent.hasCapability(AgentCapability.CUSTOMER_SUPPORT)).toBe(true);
      expect(agent.hasCapability(AgentCapability.DATA_ANALYSIS)).toBe(false);
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
    let memory: InMemoryAgentMemory;

    beforeEach(() => {
      agent = new TestAgent(EntityId.create<'AIAgent'>(), new Date(), new Date());
      memory = new InMemoryAgentMemory();
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
      expect(metadata.capabilities).toContain(AgentCapability.CUSTOMER_SUPPORT);
      expect(metadata.model.provider).toBe('test');
    });

    it('should support multiple capabilities', () => {
      const agent = new (class extends TestAgent {
        readonly capabilities = [
          AgentCapability.CUSTOMER_SUPPORT,
          AgentCapability.DATA_ANALYSIS,
          AgentCapability.KNOWLEDGE_RETRIEVAL,
        ];
      })(EntityId.create<'AIAgent'>(), new Date(), new Date());

      expect(agent.capabilities).toHaveLength(3);
      expect(agent.hasCapability(AgentCapability.CUSTOMER_SUPPORT)).toBe(true);
      expect(agent.hasCapability(AgentCapability.DATA_ANALYSIS)).toBe(true);
      expect(agent.hasCapability(AgentCapability.KNOWLEDGE_RETRIEVAL)).toBe(true);
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
});
