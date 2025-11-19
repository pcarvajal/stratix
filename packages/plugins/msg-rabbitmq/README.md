# @stratix/msg-rabbitmq

RabbitMQ extension for Stratix framework providing durable messaging with event bus capabilities.

## Installation

```bash
pnpm add @stratix/msg-rabbitmq
```

## Features

- Durable message queuing
- Event bus implementation with topic-based routing
- Automatic retries with exponential backoff
- Dead letter queues for failed messages
- Message acknowledgment
- Connection health checks
- Configurable exchange types (topic, direct, fanout, headers)
- Prefetch control for consumers

## Configuration

```typescript
interface RabbitMQConfig {
  url: string;                    // Required: RabbitMQ connection URL
  exchangeName?: string;          // Default: 'events'
  exchangeType?: 'topic' | 'direct' | 'fanout' | 'headers';  // Default: 'topic'
  prefetch?: number;              // Default: 10
  enableDLQ?: boolean;            // Default: true
  maxRetries?: number;            // Default: 3
}
```

## Quick Example

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { RabbitMQPlugin } from '@stratix/msg-rabbitmq';

const app = await ApplicationBuilder.create()
  .usePlugin(new RabbitMQPlugin(), {
    url: 'amqp://localhost:5672',
    exchangeName: 'events',
    exchangeType: 'topic',
    prefetch: 10,
    enableDLQ: true,
    maxRetries: 3
  })
  .build();

await app.start();

// Access event bus
const eventBus = app.resolve('rabbitmq:eventBus');

// Publish events
await eventBus.publish([
  {
    id: '123',
    type: 'UserCreated',
    data: { userId: 'user-123', email: 'john@example.com' },
    timestamp: new Date()
  }
]);

// Subscribe to events
await eventBus.subscribe('UserCreated', async (event) => {
  console.log('User created:', event.data);
});
```

## Exports

- `RabbitMQPlugin` - Main plugin class
- `RabbitMQConfig` - Configuration interface
- `RabbitMQEventBus` - Event bus implementation
- `RabbitMQEventBusOptions` - Event bus configuration options

## Services Registered

The plugin registers the following services in the DI container:

- `rabbitmq:eventBus` - RabbitMQEventBus instance
- `rabbitmq:connection` - Native AMQP connection
- `rabbitmq:channel` - Native AMQP channel

## License

MIT
