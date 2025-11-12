# @stratix/runtime

Application runtime and plugin system for building modular Stratix applications.

## Installation

```bash
pnpm add @stratix/runtime
```

## ApplicationBuilder

Fluent builder for configuring and starting your application.

### Basic Usage

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger();

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await app.stop();
    process.exit(0);
  });
}

bootstrap();
```

### With Plugins

```typescript
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';
import { OpenTelemetryPlugin } from '@stratix/ext-opentelemetry';

const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new RabbitMQPlugin(eventBus), {
    url: 'amqp://localhost:5672',
    exchange: 'app.events',
    queue: 'my-service'
  })
  .usePlugin(new OpenTelemetryPlugin(), {
    serviceName: 'my-service',
    endpoint: 'http://localhost:4318'
  })
  .build();

await app.start();
```

## API Reference

### ApplicationBuilder

**Static Methods**:
- `create(): ApplicationBuilder` - Create a new builder instance

**Configuration Methods**:
- `useContainer(container: Container): this` - Configure the DI container
- `useLogger(logger: Logger): this` - Configure the logger
- `usePlugin(plugin: Plugin, config?: unknown): this` - Register a plugin

**Build Methods**:
- `build(): Promise<Application>` - Build and configure the application

### Application

**Methods**:
- `start(): Promise<void>` - Start the application and all registered plugins
- `stop(): Promise<void>` - Stop the application and cleanup resources

## Plugin System

### Creating a Plugin

```typescript
import { Plugin, Container } from '@stratix/abstractions';

interface MyPluginConfig {
  apiKey: string;
  endpoint: string;
}

export class MyPlugin implements Plugin {
  name = 'my-plugin';

  async onStart(container: Container, config: unknown): Promise<void> {
    const pluginConfig = config as MyPluginConfig;

    // Initialize your plugin
    console.log(`Starting ${this.name} with endpoint: ${pluginConfig.endpoint}`);

    // Register services in the container
    container.register('myService', () => new MyService(pluginConfig.apiKey), {
      lifetime: ServiceLifetime.SINGLETON
    });
  }

  async onStop(): Promise<void> {
    // Cleanup resources
    console.log(`Stopping ${this.name}`);
  }
}
```

### Using the Plugin

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new MyPlugin(), {
    apiKey: process.env.API_KEY,
    endpoint: 'https://api.example.com'
  })
  .build();
```

## Lifecycle Hooks

The runtime executes the following lifecycle:

1. **Build Phase**
   - Container is configured
   - Logger is configured
   - Plugins are registered

2. **Start Phase**
   - Application starts
   - Plugins `onStart()` is called in registration order
   - Services are initialized

3. **Runtime Phase**
   - Application is running
   - Services are available

4. **Stop Phase**
   - Application stops
   - Plugins `onStop()` is called in reverse registration order
   - Resources are cleaned up

## Error Handling

```typescript
try {
  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();
} catch (error) {
  console.error('Failed to start application:', error);
  process.exit(1);
}
```

## Best Practices

### 1. Graceful Shutdown

Always handle shutdown signals to cleanup resources properly:

```typescript
const shutdown = async () => {
  logger.info('Shutting down...');
  await app.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

### 2. Configuration Validation

Validate plugin configuration early:

```typescript
export class MyPlugin implements Plugin {
  name = 'my-plugin';

  async onStart(container: Container, config: unknown): Promise<void> {
    const pluginConfig = this.validateConfig(config);
    // Use validated config
  }

  private validateConfig(config: unknown): MyPluginConfig {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid plugin configuration');
    }
    // Validate required fields
    return config as MyPluginConfig;
  }

  async onStop(): Promise<void> {}
}
```

### 3. Plugin Dependencies

If a plugin depends on another plugin, ensure proper ordering:

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new DatabasePlugin(), dbConfig)     // Must be first
  .usePlugin(new CachePlugin(), cacheConfig)      // Depends on database
  .build();
```

## Examples

### Minimal Application

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(new AwilixContainer())
  .useLogger(new ConsoleLogger())
  .build();

await app.start();
```

### Full-Featured Application

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger, LogLevel } from '@stratix/impl-logger-console';
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';
import { OpenTelemetryPlugin } from '@stratix/ext-opentelemetry';
import { SecretsPlugin } from '@stratix/ext-secrets';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });
  const eventBus = new InMemoryEventBus();

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .usePlugin(new SecretsPlugin(), {
      provider: 'aws-secrets-manager',
      region: 'us-east-1'
    })
    .usePlugin(new RabbitMQPlugin(eventBus), {
      url: process.env.RABBITMQ_URL,
      exchange: 'app.events',
      queue: 'my-service',
      bindings: [
        { routingKey: 'order.placed' },
        { routingKey: 'payment.processed' }
      ]
    })
    .usePlugin(new OpenTelemetryPlugin(), {
      serviceName: 'my-service',
      endpoint: process.env.OTEL_ENDPOINT
    })
    .build();

  await app.start();
  logger.info('Application started successfully');

  const shutdown = async () => {
    logger.info('Shutting down...');
    await app.stop();
    logger.info('Application stopped');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
```

## See Also

- [Getting Started](../../getting-started/quick-start.md)
- [Core Concepts](../../core-concepts/architecture.md)
