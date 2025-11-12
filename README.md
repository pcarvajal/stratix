<div align="center">
  <img src="public/logo-without-background.png" alt="Stratix Logo" width="200"/>

# Stratix

**The TypeScript Framework with AI Agents as First-Class Citizens**

Build scalable, maintainable applications with production-ready AI agents, Domain-Driven Design, and enterprise patterns.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

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

**2. Build Scalable Applications**
- Hexagonal architecture with 5 layers
- Plugin system for extensibility
- Event-driven with CQRS support
- Container-agnostic dependency injection

**3. Maintainable Applications**
- Domain-Driven Design patterns built-in
- Result pattern eliminates exceptions
- Phantom types prevent ID mixing
- 11 built-in value objects (Money, Email, UUID, etc.)
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
- `rest-api` - REST API with DDD/CQRS
- `microservice` - Event-driven architecture
- `monolith` - Modular monolith with bounded contexts
- `worker` - Background job processing
- `minimal` - Start from scratch

## AI Agents in 60 Seconds

```typescript
import { AIAgent, AgentResult } from '@stratix/primitives';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
import { StratixAgentOrchestrator } from '@stratix/impl-ai-agents';

// Define your agent
class CustomerSupportAgent extends AIAgent<Ticket, Response> {
  readonly name = 'Customer Support';

  async execute(ticket: Ticket): Promise<AgentResult<Response>> {
    const prompt = `Ticket: ${ticket.description}`;

    const llmResponse = await this.llmProvider.chat({
      messages: [
        { role: 'system', content: 'You are a helpful support agent.' },
        { role: 'user', content: prompt }
      ]
    });

    return AgentResult.success({
      response: llmResponse.content,
      sentiment: this.analyzeSentiment(llmResponse)
    });
  }
}

// Set up provider and orchestration
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY
});

const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  provider,
  {
    auditEnabled: true,
    budgetEnforcement: true,
    autoRetry: true,
    maxRetries: 3
  }
);

// Execute with budget control
const context = new AgentContext({ sessionId: 'session-1' });
context.setBudget(1.0); // Max $1

const result = await orchestrator.executeAgent(agent.id, ticket, context);
```

**That's it.** Budget enforcement, audit logging, cost tracking—all automatic.

## Production Features

### Cost Control
```typescript
context.setBudget(5.0);
const result = await orchestrator.executeAgent(agentId, input, context);

console.log('Spent:', context.getTotalCost());
console.log('Remaining:', context.getRemainingBudget());
```

### Multi-Agent Orchestration
```typescript
// Sequential pipeline
const blogPost = await orchestrator.executeSequential(
  [researchAgent, writingAgent, reviewAgent],
  { topic: 'AI in Healthcare' },
  context
);

// Parallel execution
const analyses = await orchestrator.executeParallel(
  [sqlAgent, apiAgent, fileAgent],
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
expectCostWithinBudget(result, 0.10);
expectDurationWithinLimit(result, 2000);

// Or use MockLLMProvider directly
const mockProvider = new MockLLMProvider({
  responses: ['Mocked response'],
  cost: 0.001
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

[Documentation](./docs/website) • [Examples](./examples) • [GitHub](https://github.com/pcarvajal/stratix)

</div>
