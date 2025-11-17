---
id: ai-agent
title: AIAgent
sidebar_label: AIAgent
---

# AIAgent

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives  
> **Since:** v0.1.0

## Overview

Base class for AI Agents in Domain-Driven Design. AIAgent extends AggregateRoot, making agents first-class domain entities with identity, lifecycle, and domain events. Agents encapsulate AI capabilities, manage execution context, memory, and tools.

This design makes AI agents production-ready with built-in observability, audit trails, budget enforcement, and type safety.

**Key Features:**
- Extends AggregateRoot (agents are domain entities)
- Generic input/output types for type safety
- Execution hooks (beforeExecute, afterExecute, onError)
- Memory management (short-term and long-term)
- Context management for conversation state
- Automatic domain event recording
- Tool integration support
- LLM provider abstraction

## Import

```typescript
import { AIAgent, AgentVersionFactory } from '@stratix/primitives';
import type { AgentId, AgentCapability, ModelConfig } from '@stratix/primitives';
```

## Type Signature

```typescript
abstract class AIAgent<TInput, TOutput> extends AggregateRoot<'AIAgent'> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly version: AgentVersion;
  abstract readonly capabilities: AgentCapability[];
  abstract readonly model: ModelConfig;

  protected abstract execute(input: TInput): Promise<AgentResult<TOutput>>;
  
  async executeWithEvents(input: TInput): Promise<AgentResult<TOutput>>;
  setContext(context: AgentContext): void;
  setMemory(memory: AgentMemory): void;
  
  protected async remember(key: string, value: unknown, type?: 'short' | 'long'): Promise<void>;
  protected async recall(key: string): Promise<unknown>;
  protected async searchMemory(query: string, limit?: number): Promise<unknown[]>;
  protected async forget(type?: 'short' | 'long' | 'all'): Promise<void>;
  
  protected async beforeExecute?(input: TInput): Promise<void>;
  protected async afterExecute?(result: AgentResult<TOutput>): Promise<void>;
  protected async onError?(error: Error): Promise<void>;
}
```

## Creating an Agent

```typescript
import { AIAgent, EntityId, AgentVersionFactory } from '@stratix/primitives';
import { AgentCapabilities } from '@stratix/primitives';
import type { ModelConfig } from '@stratix/primitives';

interface SupportTicket {
  ticketId: string;
  customerId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface SupportResponse {
  responseText: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedActions: string[];
  confidence: number;
}

class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Handles customer support tickets with empathy and accuracy';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.CUSTOMER_SUPPORT, 'ticket_routing'];
  readonly model: ModelConfig = {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 2000
  };

  constructor(id: EntityId<'AIAgent'>) {
    super(id, new Date(), new Date());
  }

  protected async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
    // Check memory for similar tickets
    const similar = await this.searchMemory(ticket.description, 3);
    
    // Use LLM to generate response (via orchestrator)
    const prompt = this.buildPrompt(ticket, similar);
    const llmResponse = await this.callLLM(prompt);
    
    // Remember this interaction
    await this.remember(`ticket:${ticket.ticketId}`, {
      ticket,
      response: llmResponse,
      timestamp: new Date()
    }, 'long');

    return {
      output: llmResponse,
      usage: { tokens: 150, cost: 0.002 },
      metadata: { ticketId: ticket.ticketId }
    };
  }

  private buildPrompt(ticket: SupportTicket, context: unknown[]): string {
    return `Handle this ${ticket.priority} priority ticket:
Subject: ${ticket.subject}
Description: ${ticket.description}

${context.length > 0 ? `Similar past tickets:\n${JSON.stringify(context)}` : ''}

Provide an empathetic, helpful response.`;
  }

  private async callLLM(prompt: string): Promise<SupportResponse> {
    // LLM call handled by orchestrator
    // This is a simplified example
    return {
      responseText: 'Example response',
      sentiment: 'positive',
      suggestedActions: ['escalate', 'close'],
      confidence: 0.95
    };
  }
}
```

## Usage Examples

### Basic Execution

```typescript
import { EntityId } from '@stratix/primitives';

// Create agent
const agentId = EntityId.create<'AIAgent'>();
const agent = new CustomerSupportAgent(agentId);

// Execute
const ticket: SupportTicket = {
  ticketId: 'TKT-001',
  customerId: 'CUST-123',
  subject: 'Cannot login',
  description: 'I forgot my password',
  priority: 'high'
};

const result = await agent.executeWithEvents(ticket);

console.log(result.output.responseText);
console.log(`Tokens used: ${result.usage.tokens}`);
console.log(`Cost: $${result.usage.cost}`);

// Pull domain events
const events = agent.pullDomainEvents();
// Events: AgentExecutionStarted, AgentExecutionCompleted
```

### With Context (Conversational Agent)

```typescript
import { AgentContext } from '@stratix/primitives';

const agent = new CustomerSupportAgent(EntityId.create<'AIAgent'>());

// Set conversation context
const context = new AgentContext('session-123');
context.addMessage({
  role: 'user',
  content: 'I need help with my account',
  timestamp: new Date()
});

agent.setContext(context);

// Execute maintains context
const result1 = await agent.executeWithEvents(ticket1);

// Context is preserved for next execution
context.addMessage({
  role: 'assistant', 
  content: result1.output.responseText,
  timestamp: new Date()
});

const result2 = await agent.executeWithEvents(ticket2);
```

### With Memory

```typescript
import { AgentMemory } from '@stratix/primitives';

const agent = new CustomerSupportAgent(EntityId.create<'AIAgent'>());

// Configure memory
const memory = new RedisAgentMemory({ host: 'localhost' });
agent.setMemory(memory);

// Memory used inside execute()
await agent.remember('user_preference', { language: 'es' }, 'long');
const pref = await agent.recall('user_preference');
```

### With Execution Hooks

```typescript
class MonitoredAgent extends AIAgent<Input, Output> {
  // ... properties
  
  protected async beforeExecute(input: Input): Promise<void> {
    console.log(`Starting execution with input: ${JSON.stringify(input)}`);
    await this.metrics.recordStart();
  }

  protected async afterExecute(result: AgentResult<Output>): Promise<void> {
    console.log(`Execution completed. Cost: $${result.usage.cost}`);
    await this.metrics.recordSuccess(result.usage);
  }

  protected async onError(error: Error): Promise<void> {
    console.error(`Execution failed: ${error.message}`);
    await this.alerting.sendAlert(error);
  }

  protected async execute(input: Input): Promise<AgentResult<Output>> {
    // Implementation
  }
}
```

### Multi-Agent Orchestration

```typescript
class TicketRoutingAgent extends AIAgent<SupportTicket, RoutingDecision> {
  readonly name = 'Ticket Router';
  readonly capabilities = ['ticket_classification'];
  
  protected async execute(ticket: SupportTicket): Promise<AgentResult<RoutingDecision>> {
    // Classify ticket
    const category = await this.classifyTicket(ticket);
    
    return {
      output: {
        targetAgent: this.selectAgent(category),
        priority: ticket.priority,
        estimatedResolutionTime: this.estimateTime(category)
      },
      usage: { tokens: 50, cost: 0.001 },
      metadata: { category }
    };
  }
}

// Orchestrate multiple agents
const router = new TicketRoutingAgent(EntityId.create<'AIAgent'>());
const support = new CustomerSupportAgent(EntityId.create<'AIAgent'>());

const routingResult = await router.executeWithEvents(ticket);
const targetAgent = routingResult.output.targetAgent;

if (targetAgent === 'support') {
  const response = await support.executeWithEvents(ticket);
  console.log(response.output);
}
```

## Domain Events

AIAgent automatically records these events:

### AgentExecutionStarted
```typescript
{
  occurredAt: Date;
  agentId: string;
  input: TInput;
  contextId?: string;
}
```

### AgentExecutionCompleted
```typescript
{
  occurredAt: Date;
  agentId: string;
  output: TOutput;
  usage: { tokens: number; cost: number };
  durationMs: number;
  contextId?: string;
}
```

### AgentExecutionFailed
```typescript
{
  occurredAt: Date;
  agentId: string;
  error: string;
  durationMs: number;
  contextId?: string;
}
```

### AgentContextUpdated
```typescript
{
  occurredAt: Date;
  agentId: string;
  sessionId: string;
  messageCount: number;
}
```

### AgentMemoryStored
```typescript
{
  occurredAt: Date;
  agentId: string;
  key: string;
  type: 'short' | 'long';
}
```

## Best Practices

- **Do:** Use meaningful names and descriptions for agents
- **Do:** Version agents when changing behavior
- **Do:** Define clear input/output types
- **Do:** Use memory for context across executions
- **Do:** Implement execution hooks for monitoring
- **Do:** Record domain events for audit trails
- **Don't:** Execute agents directly (use executeWithEvents)
- **Don't:** Store sensitive data in memory without encryption
- **Don't:** Make agents too large (single responsibility)

## Common Pitfalls

### Pitfall 1: Not Using executeWithEvents

**Problem:**
```typescript
// BAD: Bypasses event recording
const result = await agent.execute(input);
```

**Solution:**
```typescript
// GOOD: Records domain events
const result = await agent.executeWithEvents(input);
```

### Pitfall 2: Missing Memory Configuration

**Problem:**
```typescript
await agent.remember('key', 'value'); // Error: Memory not configured
```

**Solution:**
```typescript
const memory = new InMemoryAgentMemory();
agent.setMemory(memory);
await agent.remember('key', 'value'); // Works
```

## Type Safety

AIAgent provides compile-time type safety:

```typescript
class TypedAgent extends AIAgent<
  { query: string },      // Input type
  { answer: string }      // Output type
> {
  protected async execute(input: { query: string }): Promise<AgentResult<{ answer: string }>> {
    return {
      output: { answer: 'Example' },
      usage: { tokens: 10, cost: 0.001 },
      metadata: {}
    };
  }
}

const agent = new TypedAgent(id);

// Type-safe execution
const result = await agent.executeWithEvents({ query: 'test' });
console.log(result.output.answer); // TypeScript knows structure

// Compile error:
// agent.executeWithEvents({ wrong: 'input' });
```

## Performance Considerations

- Agents are lightweight (minimal state)
- Memory operations can be async (Redis, DB)
- Domain events add minimal overhead
- Consider agent pooling for high throughput
- Use batch execution when possible

## Related Components

- [AggregateRoot](../aggregate-root.md) - Parent class
- [AgentTool](./stratix-tool.md) - Tools for agents
- [AgentContext](./agent-context.md) - Conversation context
- [StratixAgentOrchestrator](../../layer-4-implementations/ai-agents/stratix-agent-orchestrator.md) - Execution management

## See Also

- [Package README](../../../../packages/primitives/README.md)
- [AI Agent Architecture](../../../../CLAUDE.md#ai-agent-architecture)

