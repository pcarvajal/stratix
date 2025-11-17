---
id: ai-agents-overview
title: AI Agents Overview
sidebar_label: Overview
---

# AI Agents - Primitives

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

AI Agents as first-class domain entities in the Stratix framework. This module provides the foundational building blocks for creating production-ready AI agents with type safety, observability, and domain-driven design principles.

## Core Components

### [AIAgent](./ai-agent.md)
Base class for creating AI agents. Extends AggregateRoot making agents full domain entities with lifecycle, events, memory, and context management.

**Key capabilities:**
- Generic input/output types
- Execution hooks (beforeExecute, afterExecute, onError)
- Memory management (short-term and long-term)
- Context management for conversations
- Automatic domain event recording
- LLM provider abstraction

### [AgentTool](./stratix-tool.md)
Base class for agent tools. Tools extend agent capabilities with structured actions like API calls, database queries, or calculations.

**Key capabilities:**
- Input validation with Result pattern
- Type-safe execution
- JSON Schema integration for LLMs
- Reusable across agents
- Factory method for quick creation

### [AgentContext](./agent-context.md)
Manages conversation state and message history for multi-turn conversations.

**Key capabilities:**
- Session-based conversations
- Message history (system, user, assistant)
- Timestamp tracking
- Immutable message list

### [Types](./types.md)
Core type definitions including AgentId, AgentVersion, AgentCapability, ModelConfig, and AgentMessage.

## Quick Start

```typescript
import { AIAgent, AgentTool, EntityId, AgentVersionFactory } from '@stratix/primitives';
import { AgentCapabilities } from '@stratix/primitives';

// 1. Create a tool
const weatherTool = AgentTool.fromFunctions({
  name: 'get_weather',
  description: 'Gets weather for location',
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string' }
    }
  },
  validate: (input) => /* validation */,
  execute: async (input) => /* execution */
});

// 2. Create an agent
class WeatherAgent extends AIAgent<
  { location: string },
  { temperature: number; conditions: string }
> {
  readonly name = 'Weather Agent';
  readonly description = 'Provides weather information';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.DATA_ANALYSIS];
  readonly model = {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000
  };

  protected async execute(input: { location: string }) {
    const result = await weatherTool.run(input);
    return {
      output: result.value,
      usage: { tokens: 50, cost: 0.001 },
      metadata: {}
    };
  }
}

// 3. Use the agent
const agent = new WeatherAgent(EntityId.create<'AIAgent'>());
const result = await agent.executeWithEvents({ location: 'NYC' });

console.log(result.output.temperature);
console.log(`Cost: $${result.usage.cost}`);

// 4. Get domain events
const events = agent.pullDomainEvents();
// Events: AgentExecutionStarted, AgentExecutionCompleted
```

## Architecture Principles

### 1. Agents are Domain Entities
AI agents extend AggregateRoot, making them first-class domain entities with:
- Unique identity (EntityId)
- Lifecycle (timestamps, versioning)
- Domain events (execution tracking)
- Business logic encapsulation

### 2. Type Safety
Agents and tools use TypeScript generics for compile-time type safety:
```typescript
class TypedAgent extends AIAgent<InputType, OutputType> {
  // TypeScript enforces input/output types
}
```

### 3. Result Pattern
Tools and agents use Result pattern instead of exceptions:
```typescript
const result = await tool.run(input);
if (result.isSuccess) {
  // Handle success
} else {
  // Handle failure
}
```

### 4. Observability
Automatic domain event recording enables:
- Audit trails
- Performance monitoring
- Cost tracking
- Error analysis

## Design Patterns

### Multi-Agent Systems
```typescript
const router = new TicketRouterAgent(id1);
const support = new CustomerSupportAgent(id2);
const technical = new TechnicalSupportAgent(id3);

// Route ticket
const routing = await router.executeWithEvents(ticket);

// Execute appropriate agent
const targetAgent = routing.output.targetAgent === 'technical' 
  ? technical 
  : support;

const response = await targetAgent.executeWithEvents(ticket);
```

### Agent with Memory
```typescript
const agent = new ConversationalAgent(id);
agent.setMemory(new RedisAgentMemory());

// Memory persists across executions
await agent.remember('user_preference', { theme: 'dark' }, 'long');
const pref = await agent.recall('user_preference');
```

### Agent with Context
```typescript
const context = new AgentContext('session-123');
agent.setContext(context);

// Context maintained across turns
const turn1 = await agent.executeWithEvents(input1);
context.addMessage({ role: 'assistant', content: turn1.output });

const turn2 = await agent.executeWithEvents(input2);
// Agent has full conversation history
```

## Best Practices

- **Do:** Use executeWithEvents() for all agent executions
- **Do:** Version agents when changing behavior
- **Do:** Define clear input/output types
- **Do:** Validate tool inputs before execution
- **Do:** Use memory for persistent context
- **Do:** Implement execution hooks for monitoring
- **Don't:** Call execute() directly (bypasses events)
- **Don't:** Store sensitive data unencrypted
- **Don't:** Create overly complex agents (single responsibility)

## Production Considerations

### Cost Tracking
All agent executions include usage metadata:
```typescript
result.usage.tokens  // Tokens consumed
result.usage.cost    // Estimated cost in USD
```

### Error Handling
Use execution hooks for error monitoring:
```typescript
protected async onError(error: Error) {
  await this.alerting.sendAlert(error);
  await this.metrics.recordFailure(error);
}
```

### Performance
- Agents are lightweight (minimal state)
- Memory operations can be async
- Consider agent pooling for high throughput
- Use batch execution when possible

## Related Documentation

- [Layer 4: AI Agent Implementations](../../layer-4-implementations/ai-agents/)
- [Layer 5: AI Provider Extensions](../../layer-5-extensions/ai-providers/)
- [Core Concepts: AI Agents](../../../../docs/website/docs/core-concepts/ai-agents.md)


## See Also

- [Package README](../../../../packages/primitives/README.md)
- [CLAUDE.md - AI Agent Architecture](../../../../CLAUDE.md#ai-agent-architecture)
