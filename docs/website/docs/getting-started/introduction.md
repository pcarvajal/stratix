# Introduction

Welcome to **Stratix**, the TypeScript framework with AI Agents as First-Class Citizens.

:::caution Pre-release Status (0.x)
Stratix is currently in active development (version 0.x). The API may change without prior notice until version 1.0.0. Recommended for early adopters and testing. See our [Versioning Policy](./versioning.md) for details.
:::

## What is Stratix?

Stratix is a modern TypeScript framework that brings **AI Agents**, **Domain-Driven Design (DDD)**, **Hexagonal Architecture**, and **CQRS** patterns to your applications with production-ready AI integration, minimal boilerplate, and maximum type safety.

### Key Features

- **AI Agents as First-Class Citizens**: Build intelligent systems with agents as domain entities, not afterthoughts
- **Multi-LLM Support**: Type-safe providers for OpenAI, Anthropic, and more
- **Production AI Patterns**: Budget tracking, cost control, retries, and audit logging built-in
- **Rich Primitives Library**: Money, Email, EntityId, and more built-in value objects
- **Plugin-First Architecture**: Modular, extensible, and tree-shakeable
- **Type-Safe**: Leveraging TypeScript's full power with strict mode
- **Zero Configuration**: Get started in seconds with `stratix CLI`
- **Testing Utilities**: Built-in test helpers, factories, and mock LLM providers
- **CLI Tools**: Powerful code generators and project scaffolding

## Why Stratix?

### For AI-First Applications

Build intelligent systems where AI agents are domain entities with the same rigor as the rest of your application. Stratix treats agents as first-class citizens:

- **Agents extend domain entities**: Not service classes or utilities
- **Type-safe execution**: `AIAgent<TInput, TOutput>` with full TypeScript inference
- **Production patterns**: Budget enforcement, cost tracking, audit logging
- **Mock providers**: Deterministic testing without API calls
- **Observable by default**: Every agent execution is tracked and logged

### For Architects

Stratix enforces architectural boundaries and best practices out of the box. No more debates about folder structure or how to organize code - Stratix provides a proven, battle-tested architecture.

```
src/
├── domain/           # Pure business logic (including AI agents)
├── application/      # Use cases and orchestration
└── infrastructure/   # External concerns (DB, HTTP, LLM providers)
```

### For Developers

Write less boilerplate, focus on business logic. Stratix provides:

- **AI Agent base classes**: Build intelligent agents with type safety
- **Entity and Aggregate Root**: Domain modeling primitives
- **Value Objects**: Built-in validation
- **Result pattern**: Explicit error handling
- **Repository pattern**: Generic CRUD operations
- **Event-driven architecture**: Publish and subscribe to domain events

### For Teams

Consistent code structure across all projects. New team members can be productive immediately because all Stratix projects follow the same patterns, whether building traditional applications or AI-powered systems.

## Quick Example

```typescript
import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';
import { Email, Money } from '@stratix/primitives';

type UserId = EntityId<'User'>;

class MoneyDepositedEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly userId: UserId,
    readonly amount: Money
  ) {
    this.occurredAt = new Date();
  }
}

class User extends AggregateRoot<'User'> {
  private constructor(
    id: UserId,
    private _email: Email,
    private _balance: Money,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get email(): Email {
    return this._email;
  }

  get balance(): Money {
    return this._balance;
  }

  deposit(amount: Money): void {
    this._balance = this._balance.add(amount);
    this.record(new MoneyDepositedEvent(this.id, amount));
    this.touch();
  }

  static create(email: Email): User {
    const now = new Date();
    return new User(
      EntityId.create<'User'>(),
      email,
      Money.USD(0),
      now,
      now
    );
  }
}
```

## Philosophy

Stratix is built on these principles:

1. **AI Agents as First-Class Citizens**: Agents are domain entities, not afterthoughts
2. **Architecture First**: Clean architecture isn't optional
3. **Type Safety**: Leverage TypeScript to catch errors at compile time
4. **Explicit Over Implicit**: No magic, just clear, understandable code
5. **Developer Experience**: Tools and utilities that make you productive
6. **Production Ready**: Battle-tested patterns and practices

## Who is Stratix For?

Stratix is ideal for:

- **Teams building AI-powered applications** who want production-ready patterns
- **Senior developers** who value clean architecture
- **Tech leads** building scalable, intelligent systems
- **Architects** implementing DDD and hexagonal architecture with AI agents
- **Startups** that need to move fast without sacrificing quality

## Next Steps

Ready to get started? Let's install Stratix and create your first project:

👉 [Installation](./installation.md)
