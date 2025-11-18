<div align="center">
  <img src="public/logo-light.png" alt="Stratix Logo" width="200"/>

# Stratix

**The TypeScript Framework with AI Agents as First-Class Citizens**

Build scalable, maintainable applications with production-ready AI agents, Domain-Driven Design, and enterprise patterns.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-0.x-orange.svg)](https://github.com/pcarvajal/stratix)
[![Status](https://img.shields.io/badge/status-pre--release-yellow.svg)](https://github.com/pcarvajal/stratix)

</div>

> **Pre-release Notice (0.x)**: Stratix is in active development. The API may change without prior notice until version 1.0.0. Recommended for early adopters and testing. See [Versioning Policy](./docs/website/docs/getting-started/versioning.md) for details.

## Why Stratix?

**AI agents aren't bolt-ons—they're core domain entities.**

While other frameworks treat AI as an afterthought, Stratix makes AI agents first-class citizens of your domain model. Build intelligent systems with the same rigor you apply to the rest of your application: type-safe, testable, observable, and production-ready.

### The Stratix Difference

**1. AI Agents as First-Class Citizens**

- Agents extend domain entities (not service classes)
- Type-safe LLM providers (OpenAI, Anthropic)
- Streaming support for real-time responses
- Embeddings for semantic search (OpenAI)
- Structured output with JSON schemas (OpenAI)
- Production patterns: budget tracking, retries, audit logging
- Mock providers for deterministic testing
- Observable by default

**2. Architectural Evolution Built-In**

- Bounded Contexts as portable modules
- Start with modular monolith
- Extract microservices with ZERO domain code changes
- Same code, different deployment
- Strangler Fig Pattern out-of-the-box

**3. Build Scalable Applications**

- Hexagonal architecture (Domain, Application, Infrastructure)
- 5-layer framework for extensibility (Primitives → Abstractions → Runtime → Implementations → Extensions)
- Plugin system for swapping implementations
- Event-driven with CQRS support
- Container-agnostic dependency injection

**4. Maintainable Applications**

- Domain-Driven Design patterns built-in
- Result pattern eliminates exceptions
- Phantom types prevent ID mixing
- 10 built-in value objects (Money, Email, UUID, etc.)
- Comprehensive test utilities

## Quick Start

```bash
# Learn AI agents step by step
npm create stratix my-learning -- --template ai-agent-starter

cd my-learning
pnpm start
```

**Choose your path:**

- `ai-agent-starter` - Learn AI agents progressively (FREE to start)
- `modular-monolith` - Bounded Contexts as Plugins (monolith → microservices)
- `rest-api-complete` - Production-ready REST API with all extensions
- `rest-api` - REST API with DDD/CQRS
- `microservice` - Event-driven architecture
- `monolith` - Modular monolith with bounded contexts
- `worker` - Background job processing
- `minimal` - Start from scratch

### Generated Project Structure

When you run `npm create stratix`, you get a fully configured project:

```
my-project/
├── src/
│   ├── contexts/                    # Bounded Contexts (DDD modules)
│   │   └── products/
│   │       ├── domain/             # Business logic & entities
│   │       │   ├── entities/       # Product, Order, etc.
│   │       │   ├── value-objects/  # Money, Email, etc.
│   │       │   ├── repositories/   # Repository interfaces
│   │       │   └── events/         # Domain events
│   │       ├── application/        # Use cases (CQRS)
│   │       │   ├── commands/       # CreateProduct, UpdateStock
│   │       │   ├── queries/        # GetProductById, ListProducts
│   │       │   └── handlers/       # Command & query handlers
│   │       ├── infrastructure/     # External dependencies
│   │       │   ├── persistence/    # Repository implementations
│   │       │   └── http/          # REST controllers
│   │       ├── ProductsContextModule.ts  # Bounded Context as Plugin
│   │       └── index.ts
│   ├── agents/                     # AI Agents (if template includes them)
│   │   ├── CustomerSupportAgent.ts
│   │   └── DataAnalysisAgent.ts
│   └── index.ts                    # Application entry point
├── tests/
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
├── .env.example                    # Environment variables template
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # Project documentation
```

**Key Features of Generated Projects:**

- **Clean Architecture**: Domain, Application, Infrastructure layers
- **CQRS Built-in**: Commands and Queries separated
- **Repository Pattern**: Abstract data access
- **Event-Driven**: Domain events for loose coupling
- **Type-Safe**: Full TypeScript with strict mode
- **Test-Ready**: Vitest configured with examples
- **Production Patterns**: Error handling, validation, logging

## Monolith to Microservices (Zero Rewrite)

Stratix's killer feature: **Bounded Contexts as portable modules**.

```typescript
// Modular Monolith - All contexts in one app
const monolith = await ApplicationBuilder.create()
  .useContext(new ProductsContextModule())
  .useContext(new OrdersContextModule())
  .useContext(new InventoryContextModule())
  .build();
```

```typescript
// Extract Orders to microservice - SAME module, ZERO code changes
const ordersService = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin({ database: 'orders' }))
  .usePlugin(new RabbitMQEventBusPlugin())
  .useContext(new OrdersContextModule()) // Same code!
  .build();
```

**What changes:** Only infrastructure plugins and deployment.
**What stays the same:** Domain code, business logic, repositories, commands, queries.

Generate complete Bounded Context:

```bash
stratix generate context Products --props "name:string,price:number"
```

See [modular-monolith template](packages/create-stratix/templates/modular-monolith) and [migration example](examples/bc-migration).

## AI Agents in 60 Seconds

```typescript
import {
  AIAgent,
  AgentResult,
  AgentCapabilities,
  AgentVersionFactory,
  EntityId,
  type ModelConfig,
  type AgentMessage,
} from '@stratix/primitives';
import type { LLMProvider } from '@stratix/abstractions';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

// Define your agent
class CustomerSupportAgent extends AIAgent<Ticket, Response> {
  readonly name = 'Customer Support';
  readonly description = 'Handles customer support tickets';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.CUSTOMER_SUPPORT];
  readonly model: ModelConfig = {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
  };

  constructor(private llmProvider: LLMProvider) {
    const id = EntityId.create<'AIAgent'>();
    const now = new Date();
    super(id, now, now);
  }

  async execute(ticket: Ticket): Promise<AgentResult<Response>> {
    try {
      const messages: AgentMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful support agent.',
          timestamp: new Date(),
        },
        {
          role: 'user',
          content: `Ticket: ${ticket.description}`,
          timestamp: new Date(),
        },
      ];

      const llmResponse = await this.llmProvider.chat({
        model: this.model.model,
        messages,
        temperature: this.model.temperature,
        maxTokens: this.model.maxTokens,
      });

      return AgentResult.success(
        { response: llmResponse.content },
        {
          model: this.model.model,
          totalTokens: llmResponse.usage.totalTokens,
          cost: this.calculateCost(llmResponse.usage),
        }
      );
    } catch (error) {
      return AgentResult.failure(error as Error);
    }
  }

  private calculateCost(usage: { promptTokens: number; completionTokens: number }): number {
    const inputCostPer1M = 5.0;
    const outputCostPer1M = 20.0;
    return (
      (usage.promptTokens / 1_000_000) * inputCostPer1M +
      (usage.completionTokens / 1_000_000) * outputCostPer1M
    );
  }
}

// Set up and use
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });
const agent = new CustomerSupportAgent(provider);

const result = await agent.execute({
  ticketId: 'T-123',
  description: 'Cannot log in to my account',
});

if (result.isSuccess()) {
  console.log(result.data.response);
  console.log('Cost:', result.metadata.cost);
}
```

**That's it.** Type-safe, production-ready agents with automatic cost tracking.

## Production Features

### Orchestrator with Budget Control

```typescript
import { StratixAgentOrchestrator } from '@stratix/impl-ai-agents';
import { AgentContext } from '@stratix/primitives';

// Set up orchestrator with production features
const orchestrator = new StratixAgentOrchestrator(repository, auditLog, llmProvider, {
  auditEnabled: true,
  budgetEnforcement: true,
  autoRetry: true,
  maxRetries: 3,
});

// Register agent
orchestrator.registerAgent(agent);

// Execute with budget control
const context = new AgentContext({
  sessionId: 'session-123',
  environment: 'production',
});
context.setBudget(5.0); // Max $5

const result = await orchestrator.executeAgent(agent.id, input, context);

console.log('Spent:', context.getTotalCost());
console.log('Remaining:', context.getRemainingBudget());
```

### Multi-Agent Orchestration

```typescript
// Sequential pipeline
const blogPost = await orchestrator.executeSequential(
  [researchAgent.id, writingAgent.id, reviewAgent.id],
  { topic: 'AI in Healthcare' },
  context
);

// Parallel execution
const analyses = await orchestrator.executeParallel(
  [sqlAgent.id, apiAgent.id, fileAgent.id],
  { query: 'Q4 revenue' },
  context
);
```

### Memory Management

```typescript
class DataAgent extends AIAgent<Query, Analysis> {
  async execute(query: Query): Promise<AgentResult<Analysis>> {
    // Store context
    await this.remember('currentQuery', query, 'short');

    // Retrieve history
    const history = await this.recall('queryHistory');

    // Search semantically
    const similar = await this.searchMemory('revenue analysis', 5);
  }
}
```

### Testing with Mocks

```typescript
import { AgentTester, MockLLMProvider } from '@stratix/testing';

// High-level testing
const tester = new AgentTester(agent, { timeout: 5000 });
const result = await tester.run(input);

expectSuccess(result);
expectCostWithinBudget(result, 0.1);
expectDurationWithinLimit(result, 2000);

// Or use MockLLMProvider directly
const mockProvider = new MockLLMProvider({
  responses: ['Mocked response'],
  cost: 0.001,
});

const agent = new MyAgent(mockProvider);
const result = await agent.execute(input);

// No API calls, deterministic results, zero cost
```

## Beyond AI: Complete Framework

Stratix isn't just for AI. It's a complete enterprise framework:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';

const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .usePlugin(new PostgresPlugin())
  .usePlugin(new RedisPlugin())
  .usePlugin(new OpenAIAgentPlugin())
  .build();

await app.start();
```

**Built-in plugins:**

- PostgreSQL, MongoDB, Redis
- RabbitMQ, event-driven messaging
- OpenTelemetry observability
- Secrets management

## Architecture

```
Layer 5: Extensions (PostgreSQL, Redis, OpenAI, Anthropic)
    ↓
Layer 4: Implementations (DI, Logger, CQRS, Orchestrator)
    ↓
Layer 3: Runtime (Plugin system, ApplicationBuilder)
    ↓
Layer 2: Abstractions (Interfaces only, zero runtime)
    ↓
Layer 1: Primitives (Entity, AIAgent, Result pattern)
```

Dependencies flow downward. Clean architecture. Zero coupling.

## Learn by Example

**AI Agent Starter** (Progressive learning path)

```bash
npm create stratix my-learning -- --template ai-agent-starter
cd my-learning && pnpm start

# Level 1: Echo Agent (no API key) - Available
# Level 2: Calculator Agent (with tools) - Available
# Level 3: Customer Support (OpenAI/Anthropic) - Coming soon
# Level 4: Data Analysis (SQL + visualizations) - Coming soon
```

**Example Applications**

```bash
# Customer support with GPT-4
cd examples/ai-agents/customer-support && pnpm start

# Data analysis agent
cd examples/ai-agents/data-analysis && pnpm start

# REST API with DDD/CQRS
cd examples/rest-api && pnpm dev
```

## Core Packages

**AI Agent System:**

- `@stratix/primitives` - AIAgent, AgentContext, AgentResult, 11 value objects
- `@stratix/impl-ai-agents` - Orchestrator, budget enforcement, audit logging
- `@stratix/ext-ai-agents-openai` - OpenAI provider (streaming, embeddings, structured output)
- `@stratix/ext-ai-agents-anthropic` - Anthropic provider (streaming, tool use)
- `@stratix/testing` - AgentTester, MockLLMProvider, assertions, test utilities

**Framework:**

- `@stratix/abstractions` - Interfaces (Container, EventBus, Logger, Repository)
- `@stratix/runtime` - Plugin system, ApplicationBuilder, lifecycle management
- `@stratix/impl-*` - DI (Awilix), CQRS (in-memory), logging (console)
- `@stratix/ext-*` - PostgreSQL, MongoDB, Redis, RabbitMQ, OpenTelemetry, Secrets

## Why Stratix?

**vs LangChain:** Type-safe, stable API, smaller bundle, production error handling

**vs Custom Solutions:** Standardized patterns, testable, observable, documented

**vs Other Frameworks:** First TypeScript framework with native AI agent support

**The Key:** AI agents are domain entities, not service classes. This architectural decision changes everything.

## Requirements

- Node.js 18+
- pnpm 8+
- TypeScript 5.3+

## Contributing

Contributions welcome!

## License

MIT License - see [LICENSE](./LICENSE)

Copyright (c) 2025 P. Andres Carvajal

---

<div align="center">

**Build AI agents with the same rigor as the rest of your application.**

[Documentation](./docs/website) • [GitHub](https://github.com/pcarvajal/stratix)

</div>
