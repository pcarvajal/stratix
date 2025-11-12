# @stratix/ext-rabbitmq

RabbitMQ extension for Stratix framework providing durable messaging with event bus capabilities.

## Features

- Durable message queuing
- Event bus with topic-based routing
- Automatic retries with exponential backoff
- Dead letter queues for failed messages
- Message acknowledgment
- Connection health checks

## Installation

```bash
npm install @stratix/ext-rabbitmq
```

## Usage

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';

const app = await ApplicationBuilder.create()
  .usePlugin(new RabbitMQPlugin())
  .withConfig({
    'rabbitmq': {
      url: 'amqp://localhost:5672',
      exchangeName: 'events',
      prefetch: 10,
      enableDLQ: true,
      maxRetries: 3
    }
  })
  .build();

await app.start();

// Access event bus
const eventBus = app.resolve('rabbitmq:eventBus');
await eventBus.publish([event]);
```

## Configuration

- `url`: RabbitMQ connection URL (required)
- `exchangeName`: Exchange name for events (default: 'events')
- `exchangeType`: Exchange type (default: 'topic')
- `prefetch`: Prefetch count for consumers (default: 10)
- `enableDLQ`: Enable dead letter queue (default: true)
- `maxRetries`: Max retry attempts (default: 3)

## License

MIT
