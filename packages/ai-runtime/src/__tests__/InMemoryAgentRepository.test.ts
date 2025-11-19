import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAgentRepository } from '../InMemoryAgentRepository.js';
import {
  AIAgent,
  AgentResult,
  EntityId,
  AgentVersionFactory,
  AgentCapabilities,
  type AgentCapability,
  type ModelConfig,
} from '@stratix/core';

// Test agent implementation
class TestAgent extends AIAgent<{ input: string }, { output: string }> {
  readonly name: string;
  readonly description = 'Test agent';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities: AgentCapability[];
  readonly model: ModelConfig = {
    provider: 'test',
    model: 'test-model',
    temperature: 0.7,
    maxTokens: 100,
  };

  constructor(name: string, capabilities: AgentCapability[]) {
    super(EntityId.create<'AIAgent'>(), new Date(), new Date());
    this.name = name;
    this.capabilities = capabilities;
  }

  async execute(input: { input: string }): Promise<AgentResult<{ output: string }>> {
    return AgentResult.success(
      { output: `${this.name}: ${input.input}` },
      { model: this.model.model, duration: 100 }
    );
  }
}

describe('InMemoryAgentRepository', () => {
  let repository: InMemoryAgentRepository;

  beforeEach(() => {
    repository = new InMemoryAgentRepository();
  });

  describe('save and findById', () => {
    it('should save and retrieve an agent', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);

      await repository.save(agent);
      const retrieved = await repository.findById(agent.getAgentId());

      expect(retrieved).toBe(agent);
      expect(retrieved?.name).toBe('Agent1');
    });

    it('should return null for non-existent agent', async () => {
      const nonExistentId = EntityId.create<'AIAgent'>();
      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
    });

    it('should update existing agent', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      // Update agent (save again with same ID)
      await repository.save(agent);

      const retrieved = await repository.findById(agent.getAgentId());
      expect(retrieved).toBe(agent);
    });
  });

  describe('findByCapability', () => {
    it('should find agents by capability', async () => {
      const agent1 = new TestAgent('Support1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      const agent2 = new TestAgent('Support2', [AgentCapabilities.CUSTOMER_SUPPORT]);
      const agent3 = new TestAgent('Analysis1', [AgentCapabilities.DATA_ANALYSIS]);

      await repository.save(agent1);
      await repository.save(agent2);
      await repository.save(agent3);

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);

      expect(supportAgents).toHaveLength(2);
      expect(supportAgents.some((a) => a.name === 'Support1')).toBe(true);
      expect(supportAgents.some((a) => a.name === 'Support2')).toBe(true);
    });

    it('should return empty array for non-existent capability', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      const agents = await repository.findByCapability(AgentCapabilities.DATA_ANALYSIS);

      expect(agents).toEqual([]);
    });

    it('should find agents with multiple capabilities', async () => {
      const agent = new TestAgent('MultiAgent', [
        AgentCapabilities.CUSTOMER_SUPPORT,
        AgentCapabilities.KNOWLEDGE_RETRIEVAL,
      ]);

      await repository.save(agent);

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      const knowledgeAgents = await repository.findByCapability(
        AgentCapabilities.KNOWLEDGE_RETRIEVAL
      );

      expect(supportAgents).toHaveLength(1);
      expect(knowledgeAgents).toHaveLength(1);
      expect(supportAgents[0]).toBe(agent);
      expect(knowledgeAgents[0]).toBe(agent);
    });

    it('should update capability index when agent is updated', async () => {
      const agent1 = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent1);

      // Create new agent with same ID but different capabilities
      const agent2 = new TestAgent('Agent1Updated', [AgentCapabilities.DATA_ANALYSIS]);
      // Simulate same ID by using the internal structure directly
      const updatedAgent = new (class extends TestAgent {
        getAgentId() {
          return agent1.getAgentId();
        }
      })('Agent1Updated', [AgentCapabilities.DATA_ANALYSIS]);

      await repository.save(updatedAgent);

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      const analysisAgents = await repository.findByCapability(AgentCapabilities.DATA_ANALYSIS);

      // Old capability should be removed
      expect(supportAgents).toHaveLength(0);
      // New capability should be indexed
      expect(analysisAgents).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('should return all agents', async () => {
      const agent1 = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      const agent2 = new TestAgent('Agent2', [AgentCapabilities.DATA_ANALYSIS]);
      const agent3 = new TestAgent('Agent3', [AgentCapabilities.KNOWLEDGE_RETRIEVAL]);

      await repository.save(agent1);
      await repository.save(agent2);
      await repository.save(agent3);

      const allAgents = await repository.findAll();

      expect(allAgents).toHaveLength(3);
    });

    it('should return empty array when no agents', async () => {
      const allAgents = await repository.findAll();

      expect(allAgents).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete an agent', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      await repository.delete(agent.getAgentId());

      const retrieved = await repository.findById(agent.getAgentId());
      expect(retrieved).toBeNull();
    });

    it('should remove agent from capability index', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      await repository.delete(agent.getAgentId());

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      expect(supportAgents).toHaveLength(0);
    });

    it('should not throw when deleting non-existent agent', async () => {
      const nonExistentId = EntityId.create<'AIAgent'>();

      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing agent', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      const exists = await repository.exists(agent.getAgentId());

      expect(exists).toBe(true);
    });

    it('should return false for non-existent agent', async () => {
      const nonExistentId = EntityId.create<'AIAgent'>();
      const exists = await repository.exists(nonExistentId);

      expect(exists).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all agents', async () => {
      const agent1 = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      const agent2 = new TestAgent('Agent2', [AgentCapabilities.DATA_ANALYSIS]);

      await repository.save(agent1);
      await repository.save(agent2);

      repository.clear();

      const allAgents = await repository.findAll();
      expect(allAgents).toHaveLength(0);
    });

    it('should clear capability indexes', async () => {
      const agent = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      repository.clear();

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      expect(supportAgents).toHaveLength(0);
    });
  });

  describe('count', () => {
    it('should return agent count', async () => {
      expect(repository.count()).toBe(0);

      const agent1 = new TestAgent('Agent1', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent1);
      expect(repository.count()).toBe(1);

      const agent2 = new TestAgent('Agent2', [AgentCapabilities.DATA_ANALYSIS]);
      await repository.save(agent2);
      expect(repository.count()).toBe(2);

      await repository.delete(agent1.getAgentId());
      expect(repository.count()).toBe(1);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle multiple agents with overlapping capabilities', async () => {
      const agent1 = new TestAgent('Support+Knowledge', [
        AgentCapabilities.CUSTOMER_SUPPORT,
        AgentCapabilities.KNOWLEDGE_RETRIEVAL,
      ]);

      const agent2 = new TestAgent('Support+Sentiment', [
        AgentCapabilities.CUSTOMER_SUPPORT,
        AgentCapabilities.SENTIMENT_ANALYSIS,
      ]);

      const agent3 = new TestAgent('Knowledge+Translation', [
        AgentCapabilities.KNOWLEDGE_RETRIEVAL,
        'translation',
      ]);

      await repository.save(agent1);
      await repository.save(agent2);
      await repository.save(agent3);

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      const knowledgeAgents = await repository.findByCapability(
        AgentCapabilities.KNOWLEDGE_RETRIEVAL
      );
      const translationAgents = await repository.findByCapability('translation');

      expect(supportAgents).toHaveLength(2);
      expect(knowledgeAgents).toHaveLength(2);
      expect(translationAgents).toHaveLength(1);
    });

    it('should handle agent lifecycle', async () => {
      // Register agent
      const agent = new TestAgent('CustomerSupport', [AgentCapabilities.CUSTOMER_SUPPORT]);
      await repository.save(agent);

      expect(await repository.exists(agent.getAgentId())).toBe(true);
      expect(repository.count()).toBe(1);

      // Find agent by capability
      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      expect(supportAgents).toHaveLength(1);

      // Delete agent
      await repository.delete(agent.getAgentId());

      expect(await repository.exists(agent.getAgentId())).toBe(false);
      expect(repository.count()).toBe(0);

      const supportAgentsAfter = await repository.findByCapability(
        AgentCapabilities.CUSTOMER_SUPPORT
      );
      expect(supportAgentsAfter).toHaveLength(0);
    });

    it('should handle bulk operations', async () => {
      const agents = Array.from(
        { length: 10 },
        (_, i) => new TestAgent(`Agent${i}`, [AgentCapabilities.CUSTOMER_SUPPORT])
      );

      // Save all agents
      for (const agent of agents) {
        await repository.save(agent);
      }

      expect(repository.count()).toBe(10);

      const supportAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      expect(supportAgents).toHaveLength(10);

      // Delete half
      for (let i = 0; i < 5; i++) {
        await repository.delete(agents[i].getAgentId());
      }

      expect(repository.count()).toBe(5);

      const remainingAgents = await repository.findByCapability(AgentCapabilities.CUSTOMER_SUPPORT);
      expect(remainingAgents).toHaveLength(5);
    });
  });
});
