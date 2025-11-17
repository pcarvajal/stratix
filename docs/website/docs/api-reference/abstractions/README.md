---
id: abstractions-overview
title: Abstractions Overview
sidebar_label: Overview
---

# Layer 2 - Abstractions

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Pure TypeScript interfaces with zero runtime code. Defines contracts for all framework components enabling Dependency Inversion Principle and plugin-based architecture.

## Architecture Principle

**Dependency Inversion**: All layers depend on abstractions, not implementations. This enables:
- Swappable implementations (Postgres ↔ MongoDB)
- Testing with mocks
- Plugin-based extensibility
- Framework flexibility

## Core Interfaces

### Infrastructure
- [Container](./container.md) - Dependency injection
- [Logger](./logger.md) - Structured logging
- [Repository](./repository.md) - Entity persistence
- [EventBus](./event-bus.md) - Domain event publishing

### Plugin System
- [Plugin](./plugin.md) - Base plugin interface
- [ContextPlugin](./context-plugin.md) - Bounded context plugins

### CQRS
- [Command & CommandHandler](./cqrs/command.md) - Write operations
- [Query & QueryHandler](./cqrs/query.md) - Read operations
- [CommandBus](./cqrs/command-bus.md) - Command dispatcher
- [QueryBus](./cqrs/query-bus.md) - Query dispatcher

### AI Agents
- [LLMProvider](./ai-agents/llm-provider.md) - LLM abstraction
- [AgentRepository](./ai-agents/agent-repository.md) - Agent storage
- [MemoryStore](./ai-agents/memory-store.md) - Agent memory

## Example: Swappable Implementations

```typescript
// Application depends only on interfaces
class UserService {
  constructor(
    private logger: Logger,           // Interface
    private repository: Repository    // Interface
  ) {}
}

// Production: Real implementations
const service = new UserService(
  new ConsoleLogger(),
  new PostgresUserRepository()
);

// Testing: Mock implementations
const testService = new UserService(
  new MockLogger(),
  new InMemoryUserRepository()
);

// Different deployment: Swap implementations
const serviceV2 = new UserService(
  new CloudLogger(),
  new MongoUserRepository()
);
```

## Benefits

1. **Flexibility**: Change implementations without code changes
2. **Testability**: Easy mocking and testing
3. **Extensibility**: Add new implementations via plugins
4. **Maintainability**: Clear contracts and boundaries
5. **Evolution**: Migrate technologies without rewrites

## Implementation Layers

- **Layer 4**: Basic implementations (InMemory, Console, Awilix)
- **Layer 5**: Production implementations (Postgres, OpenAI, etc.)

## See Also

- [Package README](../../../packages/abstractions/README.md)
- [Layer 1 - Primitives](../layer-1-primitives/)
- [Layer 3 - Runtime](../layer-3-runtime/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
