# AI Agent Domain Events

AI Agents in Stratix are first-class domain entities that extend `AggregateRoot`, which means they emit domain events for all significant state changes and operations. This enables powerful patterns for observability, auditing, event-driven architectures, and integration with other bounded contexts.

## Overview

Domain events are immutable records of facts that have occurred in your domain. When an AI Agent performs an action, it records domain events that can be:

- Published to an event bus for other parts of your system to react to
- Stored for audit trails and compliance
- Used for observability and monitoring
- Forwarded to analytics systems
- Used to build event sourcing patterns

## Event Types

Stratix provides the following built-in domain events for AI Agents:

### AgentExecutionStarted

Emitted when an agent begins executing a task.

```typescript
interface AgentExecutionStarted {
  eventType: 'AgentExecutionStarted';
  occurredAt: Date;
  agentId: string;
  agentName: string;
  input: unknown;
  contextId?: string;
}
```

### AgentExecutionCompleted

Emitted when an agent successfully completes execution.

```typescript
interface AgentExecutionCompleted {
  eventType: 'AgentExecutionCompleted';
  occurredAt: Date;
  agentId: string;
  agentName: string;
  output: unknown;
  contextId?: string;
  durationMs: number;
  tokensUsed?: number;
  cost?: number;
}
```

### AgentExecutionFailed

Emitted when an agent execution fails.

```typescript
interface AgentExecutionFailed {
  eventType: 'AgentExecutionFailed';
  occurredAt: Date;
  agentId: string;
  agentName: string;
  error: string;
  contextId?: string;
  durationMs: number;
}
```

### AgentToolUsed

Emitted when an agent uses a tool during execution.

```typescript
interface AgentToolUsed {
  eventType: 'AgentToolUsed';
  occurredAt: Date;
  agentId: string;
  agentName: string;
  toolName: string;
  toolArguments: Record<string, unknown>;
  toolResult?: unknown;
  contextId?: string;
}
```

### AgentContextUpdated

Emitted when an agent's execution context is updated.

```typescript
interface AgentContextUpdated {
  eventType: 'AgentContextUpdated';
  occurredAt: Date;
  agentId: string;
  agentName: string;
  contextId: string;
  messagesCount: number;
}
```

### AgentMemoryStored

Emitted when an agent stores information in memory.

```typescript
interface AgentMemoryStored {
  eventType: 'AgentMemoryStored';
  occurredAt: Date;
  agentId: string;
  agentName: string;
  memoryKey: string;
  memoryType: 'short' | 'long';
}
```

## Usage

### Basic Usage

To use domain events, call `executeWithEvents()` instead of `execute()`:

```typescript
import { AIAgent, AgentResult } from '@stratix/core';

class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
  readonly name = 'Customer Support Agent';
  readonly description = 'Handles customer support tickets';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [AgentCapabilities.CUSTOMER_SUPPORT];
  readonly model = {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  };

  protected async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
    // Your agent logic here
    return AgentResult.success(response);
  }
}

// Create and execute agent
const agent = new CustomerSupportAgent(
  EntityId.create<'AIAgent'>(),
  new Date(),
  new Date()
);

// Execute with automatic event recording
const result = await agent.executeWithEvents(ticket);

// Pull and publish domain events
const events = agent.pullDomainEvents();
await eventBus.publish(events);
```

### Publishing to Event Bus

Integrate with your event bus to publish events for other bounded contexts:

```typescript
import { EventBus } from '@stratix/core';

class AgentEventPublisher {
  constructor(private eventBus: EventBus) {}

  async executeAndPublish(agent: AIAgent, input: unknown): Promise<AgentResult> {
    // Execute agent
    const result = await agent.executeWithEvents(input);

    // Pull domain events
    const events = agent.pullDomainEvents();

    // Publish to event bus
    for (const event of events) {
      await this.eventBus.publish(event);
    }

    return result;
  }
}
```

### Audit Logging

Use domain events for comprehensive audit trails:

```typescript
import { AIAgentEvent } from '@stratix/core';

class AgentAuditLogger {
  async logExecution(agent: AIAgent, input: unknown): Promise<void> {
    const result = await agent.executeWithEvents(input);
    const events = agent.pullDomainEvents();

    for (const event of events) {
      await this.auditLog.write({
        timestamp: event.occurredAt,
        eventType: event.eventType,
        agentId: event.agentId,
        agentName: event.agentName,
        data: event,
      });
    }
  }
}
```

### Observability and Monitoring

Track agent performance and usage with domain events:

```typescript
class AgentMetricsCollector {
  async trackMetrics(agent: AIAgent, input: unknown): Promise<void> {
    const result = await agent.executeWithEvents(input);
    const events = agent.pullDomainEvents();

    for (const event of events) {
      switch (event.eventType) {
        case 'AgentExecutionCompleted':
          this.metrics.recordLatency(event.durationMs);
          this.metrics.recordTokens(event.tokensUsed);
          this.metrics.recordCost(event.cost);
          break;

        case 'AgentExecutionFailed':
          this.metrics.recordFailure(event.error);
          break;

        case 'AgentToolUsed':
          this.metrics.recordToolUsage(event.toolName);
          break;
      }
    }
  }
}
```

### Event Sourcing

Build event-sourced agent history:

```typescript
class AgentEventStore {
  private events: AIAgentEvent[] = [];

  async executeWithHistory(agent: AIAgent, input: unknown): Promise<AgentResult> {
    const result = await agent.executeWithEvents(input);
    const events = agent.pullDomainEvents();

    // Store events
    this.events.push(...events);

    // Persist to event store
    await this.eventStore.append(agent.getAgentId(), events);

    return result;
  }

  async replayHistory(agentId: string): AIAgentEvent[] {
    return await this.eventStore.getEvents(agentId);
  }
}
```

## Recording Custom Tool Usage

When your agent uses tools, record tool usage events:

```typescript
class DataAnalysisAgent extends AIAgent<AnalysisRequest, AnalysisResult> {
  // ... agent configuration ...

  protected async execute(request: AnalysisRequest): Promise<AgentResult<AnalysisResult>> {
    // Use a tool
    const sqlResult = await this.executeSQLQuery(request.query);

    // Record the tool usage
    this.recordToolUsage('sql_query', { query: request.query }, sqlResult);

    // Continue with analysis
    const analysis = await this.analyze(sqlResult);

    return AgentResult.success(analysis);
  }

  private async executeSQLQuery(query: string): Promise<any> {
    // SQL execution logic
  }
}
```

## Best Practices

### 1. Always Use executeWithEvents() in Production

For production systems, always use `executeWithEvents()` to ensure proper observability:

```typescript
// Production
const result = await agent.executeWithEvents(input);

// Development/Testing (if you want to skip events)
const result = await (agent as any).execute(input);
```

### 2. Pull Events Immediately After Execution

Domain events are cleared when you call `pullDomainEvents()`, so always pull and process them right after execution:

```typescript
const result = await agent.executeWithEvents(input);
const events = agent.pullDomainEvents(); // Must be called immediately
await eventBus.publish(events);
```

### 3. Handle Event Publishing Failures

Event publishing can fail, so handle errors gracefully:

```typescript
const result = await agent.executeWithEvents(input);
const events = agent.pullDomainEvents();

try {
  await eventBus.publish(events);
} catch (error) {
  // Log error but don't fail the agent execution
  logger.error('Failed to publish domain events', { error, events });
}
```

### 4. Use Event Filtering for Specific Use Cases

Filter events based on your needs:

```typescript
const events = agent.pullDomainEvents();

// Only publish execution events
const executionEvents = events.filter(e =>
  ['AgentExecutionStarted', 'AgentExecutionCompleted', 'AgentExecutionFailed'].includes(e.eventType)
);

await eventBus.publish(executionEvents);
```

### 5. Include Context for Better Traceability

Always set an execution context before executing:

```typescript
const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production',
  metadata: { tenantId: 'acme-corp' }
});

agent.setContext(context);
const result = await agent.executeWithEvents(input);
```

## Integration with Orchestrator

The `AgentOrchestrator` can be extended to automatically handle event publishing:

```typescript
class EventPublishingOrchestrator extends StratixAgentOrchestrator {
  constructor(
    private eventBus: EventBus,
    auditLog: ExecutionAuditLog
  ) {
    super(auditLog);
  }

  async execute(agentId: AgentId, input: unknown): Promise<AgentResult> {
    const agent = this.getAgent(agentId);
    const result = await agent.executeWithEvents(input);

    // Automatically publish events
    const events = agent.pullDomainEvents();
    await this.eventBus.publish(events);

    return result;
  }
}
```

## Type Safety

All domain events are fully typed. Use the union type for type-safe event handling:

```typescript
import { AIAgentEvent } from '@stratix/core';

function handleEvent(event: AIAgentEvent): void {
  switch (event.eventType) {
    case 'AgentExecutionStarted':
      // TypeScript knows event is AgentExecutionStarted
      console.log('Agent started with input:', event.input);
      break;

    case 'AgentExecutionCompleted':
      // TypeScript knows event is AgentExecutionCompleted
      console.log('Agent completed in', event.durationMs, 'ms');
      break;

    case 'AgentExecutionFailed':
      // TypeScript knows event is AgentExecutionFailed
      console.log('Agent failed:', event.error);
      break;

    // ... handle other event types
  }
}
```

## Conclusion

Domain events make AI Agents truly first-class citizens in DDD architecture. By leveraging the aggregate root pattern, Stratix provides:

- Automatic event recording for all agent operations
- Type-safe event handling
- Integration with event-driven architectures
- Complete audit trails for compliance
- Observability and monitoring capabilities
- Event sourcing support

This differentiates Stratix from other LLM wrappers and makes it production-ready from day one.
