# @stratix/msg-rabbitmq

RabbitMQ plugin for Stratix with enterprise messaging features.

## Installation

```bash
pnpm add @stratix/msg-rabbitmq
```

## Features

- **Event Bus** - Topic-based pub/sub
- **RPC** - Request/reply pattern
- **Priority Queues** - Priority-based processing
- **Delayed Messages** - Scheduled delivery
- **Advanced Routing** - Headers and custom routing
- **Dead Letter Queues** - Failed message handling
- **Automatic Retries** - Exponential backoff
- **Durable Messages** - Survive broker restarts

## Quick Start

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { RabbitMQPlugin } from '@stratix/msg-rabbitmq';

const app = await ApplicationBuilder.create()
  .usePlugin(new RabbitMQPlugin(), {
    url: 'amqp://localhost:5672',
    exchangeName: 'events',
    prefetch: 10
  })
  .build();

await app.start();
```

## Configuration

```typescript
interface RabbitMQConfig {
  url: string;                    // Required: RabbitMQ connection URL
  exchangeName?: string;          // Default: 'events'
  exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';
  prefetch?: number;              // Default: 10
  enableDLQ?: boolean;            // Default: true
  maxRetries?: number;            // Default: 3
}
```

## Event Bus

```typescript
const eventBus = app.resolve('rabbitmq:eventBus');

// Publish events
await eventBus.publish([{
  aggregateId: 'user-123',
  occurredOn: new Date(),
  type: 'UserCreated',
  data: { email: 'john@example.com' }
}]);

// Subscribe to events
eventBus.subscribe(UserCreatedEvent, async (event) => {
  console.log('User created:', event);
});
```

## RPC (Request/Reply)

```typescript
import { RabbitMQRPC } from '@stratix/msg-rabbitmq';

const channel = app.resolve('rabbitmq:channel');
const rpc = new RabbitMQRPC(channel);

// Server
await rpc.serve<Request, Response>('user-service', async (req) => {
  const user = await userRepository.findById(req.userId);
  return { user };
});

// Client
const result = await rpc.call<Request, Response>(
  'user-service',
  { userId: '123' },
  { timeout: 5000 }
);
```

## Priority Queues

```typescript
import { RabbitMQPriorityQueue } from '@stratix/msg-rabbitmq';

const queue = new RabbitMQPriorityQueue<Task>(channel, 'tasks', {
  maxPriority: 10
});

await queue.initialize();

// High priority
await queue.publish({ id: '1', action: 'urgent' }, 10);

// Low priority
await queue.publish({ id: '2', action: 'cleanup' }, 1);

await queue.consume(async (task) => {
  console.log('Processing:', task);
});
```

## Delayed Messages

```typescript
import { RabbitMQDelayedQueue } from '@stratix/msg-rabbitmq';

const delayed = new RabbitMQDelayedQueue<Notification>(channel, 'notifications');

await delayed.initialize();

// Delay by milliseconds
await delayed.publishDelayed({ text: 'Hello' }, 60000); // 1 minute

// Schedule for specific time
await delayed.publishScheduled(
  { text: 'Reminder' },
  new Date('2024-12-25T10:00:00Z')
);

await delayed.consume(async (notification) => {
  console.log('Sending:', notification);
});
```

## Advanced Routing

```typescript
import { RabbitMQRouter } from '@stratix/msg-rabbitmq';

const router = new RabbitMQRouter(channel);

await router.initialize();

// Headers-based routing
await router.publishWithHeaders(
  { data: 'urgent task' },
  { type: 'urgent', region: 'US' }
);

await router.bindByHeaders(
  'urgent-us-queue',
  { type: 'urgent', region: 'US' },
  true // match all headers
);
```

## Exports

### Core
- `RabbitMQPlugin` - Main plugin
- `RabbitMQEventBus` - Event bus
- `RabbitMQConfig` - Configuration

### RPC
- `RabbitMQRPC` - Request/reply
- `RPCOptions`, `RPCHandler` - Types

### Priority
- `RabbitMQPriorityQueue` - Priority queue

### Delayed
- `RabbitMQDelayedQueue` - Delayed messages

### Routing
- `RabbitMQRouter` - Advanced routing

## Services Registered

- `rabbitmq:eventBus` - RabbitMQEventBus instance
- `rabbitmq:connection` - Native AMQP connection
- `rabbitmq:channel` - Native AMQP channel

## License

MIT
