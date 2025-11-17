---
id: agent-repository
title: AgentRepository
sidebar_label: AgentRepository
---

# AgentRepository

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Repository interface for AI agents. Stores and retrieves agent configurations and instances.

## Type Signature

```typescript
interface AgentRepository {
  save(agent: AIAgent<any, any>): Promise<void>;
  findById(id: AgentId): Promise<AIAgent<any, any> | null>;
  findByName(name: string): Promise<AIAgent<any, any> | null>;
}
```

## Usage

```typescript
const repo: AgentRepository = new InMemoryAgentRepository();

await repo.save(agent);
const found = await repo.findById(agent.id);
```

## See Also

- [AIAgent](../../layer-1-primitives/ai-agents/ai-agent.md)
