import type { AIAgent, AgentId, AgentCapability } from '@stratix/primitives';
import type { AgentRepository } from '@stratix/abstractions';

/**
 * In-memory implementation of AgentRepository.
 *
 * Suitable for development, testing, and small-scale deployments.
 * For production use with persistence, consider a database-backed implementation.
 *
 * @example
 * ```typescript
 * const repository = new InMemoryAgentRepository();
 *
 * await repository.save(customerSupportAgent);
 * await repository.save(dataAnalysisAgent);
 *
 * const agent = await repository.findById(agentId);
 * const supportAgents = await repository.findByCapability(AgentCapability.CUSTOMER_SUPPORT);
 * ```
 */
export class InMemoryAgentRepository implements AgentRepository {
  private agents = new Map<string, AIAgent<unknown, unknown>>();
  private capabilityIndex = new Map<AgentCapability, Set<string>>();

  findById(id: AgentId): Promise<AIAgent<unknown, unknown> | null> {
    return Promise.resolve(this.agents.get(id.value) ?? null);
  }

  findByCapability(capability: AgentCapability): Promise<AIAgent<unknown, unknown>[]> {
    const agentIds = this.capabilityIndex.get(capability);
    if (!agentIds) {
      return Promise.resolve([]);
    }

    const agents: AIAgent<unknown, unknown>[] = [];
    for (const id of agentIds) {
      const agent = this.agents.get(id);
      if (agent) {
        agents.push(agent);
      }
    }

    return Promise.resolve(agents);
  }

  findAll(): Promise<AIAgent<unknown, unknown>[]> {
    return Promise.resolve(Array.from(this.agents.values()));
  }

  save(agent: AIAgent<unknown, unknown>): Promise<void> {
    const agentId = agent.getAgentId().value;

    // Remove old capability indexes if updating
    const existingAgent = this.agents.get(agentId);
    if (existingAgent) {
      this.removeFromCapabilityIndex(existingAgent);
    }

    // Save agent
    this.agents.set(agentId, agent);

    // Update capability index
    this.addToCapabilityIndex(agent);

    return Promise.resolve();
  }

  delete(id: AgentId): Promise<void> {
    const agent = this.agents.get(id.value);
    if (agent) {
      this.removeFromCapabilityIndex(agent);
      this.agents.delete(id.value);
    }
    return Promise.resolve();
  }

  exists(id: AgentId): Promise<boolean> {
    return Promise.resolve(this.agents.has(id.value));
  }

  /**
   * Clears all agents from the repository
   * Useful for testing
   */
  clear(): void {
    this.agents.clear();
    this.capabilityIndex.clear();
  }

  /**
   * Gets the total number of agents in the repository
   */
  count(): number {
    return this.agents.size;
  }

  private addToCapabilityIndex(agent: AIAgent<unknown, unknown>): void {
    const agentId = agent.getAgentId().value;

    for (const capability of agent.capabilities) {
      let agentSet = this.capabilityIndex.get(capability);
      if (!agentSet) {
        agentSet = new Set<string>();
        this.capabilityIndex.set(capability, agentSet);
      }
      agentSet.add(agentId);
    }
  }

  private removeFromCapabilityIndex(agent: AIAgent<unknown, unknown>): void {
    const agentId = agent.getAgentId().value;

    for (const capability of agent.capabilities) {
      const agentSet = this.capabilityIndex.get(capability);
      if (agentSet) {
        agentSet.delete(agentId);
        if (agentSet.size === 0) {
          this.capabilityIndex.delete(capability);
        }
      }
    }
  }
}
