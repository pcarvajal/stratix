# Event-Driven AI Agent Example

This example demonstrates how AI Agents in Stratix emit domain events as first-class aggregate roots in DDD architecture. It shows:

- Automatic domain event recording for agent operations
- Publishing events to an event bus
- Building an audit log from domain events
- Collecting metrics from events
- Event-driven architecture patterns

## What Makes This Different

Unlike other LLM frameworks that treat agents as simple wrappers, Stratix treats AI Agents as domain entities that follow DDD patterns. This means:

- Agents extend `AggregateRoot` and emit domain events
- All operations are automatically tracked
- Events can be published to integrate with other bounded contexts
- Complete audit trails for compliance
- Production-ready observability from day one

## Features

- Event recording for all agent lifecycle operations
- In-memory event bus for demonstration
- Audit logging of all agent activities
- Metrics collection (latency, cost, token usage)
- Tool usage tracking
- Error handling and failed execution tracking

## Running the Example

```bash
# Install dependencies
pnpm install

# Build the example
pnpm build

# Run the example
pnpm start
```

## What You'll See

The example will:

1. Create a customer support agent
2. Execute multiple queries with event recording
3. Show all domain events emitted
4. Display audit log entries
5. Show collected metrics (latency, tokens, cost)
6. Demonstrate tool usage events
7. Show failed execution events

## Architecture

```
┌─────────────────┐
│  AIAgent        │
│  (Aggregate     │
│   Root)         │
└────────┬────────┘
         │ emits
         ▼
┌─────────────────┐
│  Domain Events  │
│  - Execution    │
│  - Tool Usage   │
│  - Memory Ops   │
└────────┬────────┘
         │ published to
         ▼
┌─────────────────┐
│  Event Bus      │
└────────┬────────┘
         │ consumed by
         ▼
┌─────────────────┬─────────────────┬──────────────────┐
│  Audit Log      │  Metrics        │  Other Bounded   │
│  Service        │  Collector      │  Contexts        │
└─────────────────┴─────────────────┴──────────────────┘
```

## Key Concepts

### 1. Automatic Event Recording

Agents automatically record events when using `executeWithEvents()`:

```typescript
const result = await agent.executeWithEvents(input);
const events = agent.pullDomainEvents();
```

### 2. Event Bus Integration

Events are published to an event bus for consumption:

```typescript
await eventBus.publish(events);
```

### 3. Multiple Consumers

Different parts of your system can react to events:

- Audit log for compliance
- Metrics for monitoring
- Other agents for agent-to-agent communication
- External systems for integration

## Learning Points

After running this example, you'll understand:

1. How AI Agents emit domain events following DDD patterns
2. How to publish events to an event bus
3. How to build audit logs from domain events
4. How to collect metrics automatically
5. How to integrate agents with event-driven architectures
6. Why Stratix is production-ready from day one

## Next Steps

- Explore the `customer-support` example for real LLM integration
- Check the `data-analysis` example for tool usage patterns
- Read the domain events guide in `docs/guides/ai-agent-domain-events.md`
