# API Reference

Complete API documentation for Stratix framework. Documentation is organized by architectural layers, following the framework's dependency hierarchy.

## Architecture Overview

Stratix follows a layered architecture where dependencies flow downward:

```
Layer 5: Extensions (Production Ready, Data, AI, Observability)
    ↓
Layer 4: Implementations (Basic DI, Logger, CQRS, AI Orchestrator)
    ↓
Layer 3: Runtime (Application Bootstrap, Plugin System)
    ↓
Layer 2: Abstractions (Interfaces & Contracts)
    ↓
Layer 1: Primitives (DDD Building Blocks, AI Agents)
```

---

## Layer 1: Primitives

**Package:** `@stratix/core`

Foundation types and base classes for Domain-Driven Design and AI Agents.

### [Complete Documentation →](./primitives/README.md)

### Core DDD Components

- **[Entity](./primitives/entity)** - Base class for domain entities with identity
- **[AggregateRoot](./primitives/aggregate-root)** - Domain aggregate pattern
- **[ValueObject](./primitives/value-object)** - Immutable value types
- **[EntityId](./primitives/entity-id)** - Type-safe entity identifiers
- **[Result](./primitives/result)** - Explicit error handling pattern
- **[DomainEvent](./primitives/domain-event)** - Event-driven architecture primitives

### Value Objects

- **[Money](./primitives/money)** - Monetary values with currency
- **[Currency](./primitives/currency)** - Currency enumeration

### AI Agents

AI Agents as first-class domain entities.

- **[AIAgent](./primitives/ai-agents/ai-agent)** - AI agent entity base class
- **[StratixTool](./primitives/ai-agents/stratix-tool)** - Tool interface for agents
- **[AgentContext](./primitives/ai-agents/agent-context)** - Agent execution context
- **[Types](./primitives/ai-agents/types)** - AI agent type definitions

---

## Layer 2: Abstractions

**Package:** `@stratix/core`

Pure TypeScript interfaces with zero runtime code. Defines contracts for all framework components following Dependency Inversion Principle.

### [Complete Documentation →](./abstractions/README.md)

### Core Interfaces

- **[Container](./abstractions/container)** - Dependency injection container interface
- **[Logger](./abstractions/logger)** - Structured logging interface
- **[Repository](./abstractions/repository)** - Entity persistence interface
- **[EventBus](./abstractions/event-bus)** - Domain event publishing interface
- **[Plugin](./abstractions/plugin)** - Base plugin interface
- **[ContextPlugin](./abstractions/context-plugin)** - Bounded context plugin interface

### CQRS

Command Query Responsibility Segregation pattern interfaces.

- **[Command & CommandHandler](./abstractions/cqrs/command)** - Write operations
- **[Query & QueryHandler](./abstractions/cqrs/query)** - Read operations
- **[CommandBus](./abstractions/cqrs/command-bus)** - Command dispatcher
- **[QueryBus](./abstractions/cqrs/query-bus)** - Query dispatcher

### AI Agents

- **[LLMProvider](./abstractions/ai-agents/llm-provider)** - LLM provider interface
- **[AgentRepository](./abstractions/ai-agents/agent-repository)** - Agent storage interface
- **[MemoryStore](./abstractions/ai-agents/memory-store)** - Agent memory interface

---

## Layer 3: Runtime

**Package:** `@stratix/runtime`

Application bootstrap and plugin lifecycle management.

### [Complete Documentation →](./runtime/README.md)

### Core Components

- **[ApplicationBuilder](./runtime/application-builder)** - Fluent API for building applications
- **[Application](./runtime/application)** - Running application instance
- **[LifecycleManager](./runtime/lifecycle-manager)** - Plugin lifecycle management
- **[DependencyGraph](./runtime/dependency-graph)** - Dependency resolution
- **[BaseContextPlugin](./runtime/base-context-plugin)** - Base for bounded context plugins
- **[PluginContext](./runtime/plugin-context)** - Plugin initialization context

---

## Layer 4: Implementations

Basic implementations of core abstractions.

### Dependency Injection

- **@stratix/di-awilix** - Awilix-based DI container

### Logging

- **@stratix/core** - Console logging implementation

### CQRS

- **@stratix/core** - In-memory command, query, and event buses

### AI Agents

- **@stratix/runtime** - Agent orchestrator with budget enforcement

---

## Layer 5: Extensions

Production-ready plugins for enterprise applications.

### Production Extensions

- **@stratix/http-fastify** - Fastify HTTP server integration
- **@stratix/validation-zod** - Zod-based schema validation
- **@stratix/mappers** - Entity-to-DTO mapping
- **@stratix/auth** - JWT authentication & RBAC
- **@stratix/migrations** - Database migration system
- **@stratix/errors** - Structured error handling

### Data & Infrastructure

- **@stratix/db-postgres** - PostgreSQL integration
- **@stratix/db-mongodb** - MongoDB integration
- **@stratix/db-redis** - Redis caching
- **@stratix/msg-rabbitmq** - RabbitMQ messaging

### Observability

- **@stratix/obs-opentelemetry** - OpenTelemetry (traces, metrics, logs)
- **@stratix/secrets** - Secrets management

### AI Providers

- **@stratix/ai-openai** - OpenAI provider with streaming
- **@stratix/ai-anthropic** - Anthropic Claude provider

---

## Development Tools

### [create-stratix](./tools/create-stratix)

CLI tool for scaffolding new Stratix projects.

### @stratix/testing

Testing utilities and mock implementations for unit and integration testing.

---

## Getting Started

1. **Start with [Layer 1 - Primitives](./primitives/README)** to understand DDD building blocks
2. **Explore [Layer 2 - Abstractions](./abstractions/README)** to see framework contracts
3. **Learn [Layer 3 - Runtime](./runtime/README)** to build and run applications
4. **Choose extensions** from Layers 4 & 5 based on your needs

## Quick Links

- [Installation Guide](/docs/getting-started/installation)
- [Quick Start](/docs/getting-started/quick-start)
- [Core Concepts](/docs/core-concepts/architecture)

