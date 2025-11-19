# Plugins

Plugins are the primary extension mechanism in Stratix. They provide lifecycle management, dependency resolution, and health monitoring for both framework features and your custom integrations.

## What is a Plugin?

A **Plugin** is a self-contained module that extends Stratix functionality. Plugins handle initialization, startup, shutdown, and health checks following a well-defined lifecycle.

```typescript
import { Plugin, PluginContext, HealthCheckResult } from '@stratix/core';

export class MyPlugin implements Plugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';
  readonly dependencies?: string[] = ['logger']; // Optional dependencies

  async initialize(context: PluginContext): Promise<void> {
    // Register services with DI container
    context.container.register('myService', () => new MyService());
  }

  async start(): Promise<void> {
    // Connect to external resources
  }

  async stop(): Promise<void> {
    // Graceful shutdown
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { healthy: true };
  }
}
```

## Plugin Lifecycle

Plugins follow a strict lifecycle managed by the ApplicationBuilder:

1. **Registration** - `usePlugin()` adds plugin to application
2. **Dependency Resolution** - DependencyGraph validates and orders plugins
3. **Initialize** - Plugins configure themselves and register services
4. **Start** - Plugins start services (databases, servers, etc.)
5. **Running** - Application operational, health checks available
6. **Stop** - Graceful shutdown in reverse dependency order

### Lifecycle Example

```typescript
const app = await ApplicationBuilder.create()
  .usePlugin(new LoggerPlugin())       // 1. Registered first
  .usePlugin(new DatabasePlugin())     // 2. Depends on logger
  .usePlugin(new HTTPPlugin())         // 3. Depends on database
  .build();

await app.start();
// Plugins start in order: Logger -> Database -> HTTP

// Later...
await app.stop();
// Plugins stop in reverse: HTTP -> Database -> Logger
```

## Plugin Types

### Built-in Plugins

Stratix provides production-ready plugins for common needs:

**Core Implementations:**
- `@stratix/di-awilix` - Dependency injection (Awilix)
- `@stratix/core` - Console logging
- `@stratix/core` - In-memory CQRS buses
- `@stratix/runtime` - AI Agent orchestrator

**Production Extensions:**
- `@stratix/http-fastify` - Fastify HTTP server
- `@stratix/validation-zod` - Zod schema validation
- `@stratix/mappers` - Entity-to-DTO mapping
- `@stratix/auth` - JWT + RBAC authentication
- `@stratix/migrations` - Database migrations
- `@stratix/errors` - Structured error handling

**Data and Infrastructure:**
- `@stratix/db-postgres` - PostgreSQL integration
- `@stratix/db-mongodb` - MongoDB integration
- `@stratix/db-redis` - Redis caching
- `@stratix/msg-rabbitmq` - RabbitMQ messaging
- `@stratix/obs-opentelemetry` - Observability (traces, metrics, logs)
- `@stratix/secrets` - Secrets management

**AI Providers:**
- `@stratix/ai-openai` - OpenAI LLM provider
- `@stratix/ai-anthropic` - Anthropic Claude provider

### Custom Plugins

Create your own plugins for domain-specific integrations:

```bash
stratix generate plugin PaymentProcessor
```

## Creating a Custom Plugin

### Basic Plugin Structure

```typescript
import { Plugin, PluginContext, HealthCheckResult } from '@stratix/core';

export interface PaymentPluginOptions {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

export class PaymentPlugin implements Plugin {
  readonly name = 'payment';
  readonly version = '1.0.0';
  readonly dependencies = ['logger'];

  private service?: PaymentService;

  constructor(private options: PaymentPluginOptions) {}

  async initialize(context: PluginContext): Promise<void> {
    const { container, logger } = context;
    
    logger.info('Initializing payment plugin');

    // Create service
    this.service = new PaymentService({
      apiKey: this.options.apiKey,
      environment: this.options.environment,
      logger
    });

    // Register in DI container
    container.register('paymentService', () => this.service);
  }

  async start(): Promise<void> {
    await this.service?.connect();
  }

  async stop(): Promise<void> {
    await this.service?.disconnect();
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const isHealthy = await this.service?.ping();
      return {
        healthy: isHealthy ?? false,
        message: isHealthy ? 'Payment service is healthy' : 'Payment service unreachable'
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Payment health check failed: ${error}`,
        error
      };
    }
  }
}
```

### Using Custom Plugin

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { PaymentPlugin } from './plugins/PaymentPlugin.js';

const app = await ApplicationBuilder.create()
  .usePlugin(new ConsoleLogger())
  .usePlugin(new PaymentPlugin({
    apiKey: process.env.PAYMENT_API_KEY,
    environment: 'production'
  }))
  .build();

await app.start();
```

## Plugin Dependency Management

### Declaring Dependencies

Plugins can declare dependencies on other plugins:

```typescript
export class OrdersPlugin implements Plugin {
  readonly name = 'orders';
  readonly dependencies = ['logger', 'database', 'payment'];
  // Will initialize after logger, database, and payment plugins
}
```

### Dependency Resolution

The DependencyGraph ensures correct initialization order:

```typescript
// This setup
.usePlugin(new HTTPPlugin())         // depends on: database
.usePlugin(new DatabasePlugin())     // depends on: logger
.usePlugin(new LoggerPlugin())       // depends on: none

// Resolves to this order:
// 1. LoggerPlugin
// 2. DatabasePlugin
// 3. HTTPPlugin
```

### Circular Dependencies

Circular dependencies are detected and rejected:

```typescript
// This will throw an error
class PluginA implements Plugin {
  dependencies = ['pluginB'];
}

class PluginB implements Plugin {
  dependencies = ['pluginA'];  // Circular!
}
```

## Health Checks

Monitor plugin health at runtime:

```typescript
const app = await ApplicationBuilder.create()
  .usePlugin(postgresPlugin)
  .usePlugin(redisPlugin)
  .build();

await app.start();

// Check individual plugin
const dbHealth = await app.healthCheck('postgres');
if (!dbHealth.healthy) {
  console.error('Database unhealthy:', dbHealth.message);
}

// Check all plugins
const allHealth = await app.healthCheckAll();
const unhealthy = allHealth.filter(h => !h.healthy);

if (unhealthy.length > 0) {
  console.error('Unhealthy plugins:', unhealthy);
}
```

## Context Plugins

Special type of plugin that represents a Bounded Context. Context plugins auto-register commands, queries, and event handlers.

See [Bounded Contexts](./bounded-contexts.md) for details.

```typescript
export class ProductsContextPlugin extends BaseContextPlugin {
  readonly name = 'products-context';
  readonly contextName = 'Products';

  getCommands() {
    return [
      { name: 'CreateProduct', commandType: CreateProduct, handler: this.createHandler() }
    ];
  }

  getQueries() {
    return [
      { name: 'GetProduct', queryType: GetProduct, handler: this.getHandler() }
    ];
  }
}
```

## Plugin Patterns

### Configuration Management

```typescript
export interface DatabasePluginConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
}

export class DatabasePlugin implements Plugin {
  private config: Required<DatabasePluginConfig>;

  constructor(config: DatabasePluginConfig) {
    this.config = {
      ssl: false,
      poolSize: 10,
      ...config
    };
  }
}
```

### Resource Cleanup

Always cleanup resources in stop():

```typescript
export class DatabasePlugin implements Plugin {
  private pool?: Pool;

  async start(): Promise<void> {
    this.pool = new Pool(this.config);
    await this.pool.connect();
  }

  async stop(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }
}
```

### Graceful Degradation

```typescript
export class CachePlugin implements Plugin {
  async start(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      this.logger.warn('Cache unavailable, running without cache');
      this.fallbackMode = true;
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (this.fallbackMode) {
      return {
        healthy: true,
        message: 'Running in fallback mode without cache'
      };
    }
    
    return { healthy: await this.redis.ping() };
  }
}
```

## Testing Plugins

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('PaymentPlugin', () => {
  let plugin: PaymentPlugin;
  let context: MockPluginContext;

  beforeEach(() => {
    context = new MockPluginContext();
    plugin = new PaymentPlugin({
      apiKey: 'test-key',
      environment: 'sandbox'
    });
  });

  afterEach(async () => {
    await plugin.stop();
  });

  it('should initialize successfully', async () => {
    await plugin.initialize(context);

    const service = context.container.resolve('paymentService');
    expect(service).toBeDefined();
  });

  it('should pass health check when connected', async () => {
    await plugin.initialize(context);
    await plugin.start();

    const health = await plugin.healthCheck();
    expect(health.healthy).toBe(true);
  });

  it('should cleanup on stop', async () => {
    await plugin.initialize(context);
    await plugin.start();
    await plugin.stop();

    const health = await plugin.healthCheck();
    expect(health.healthy).toBe(false);
  });
});
```

## Best Practices

### 1. Single Responsibility

Each plugin should have one clear purpose:

```typescript
// Good: Focused plugin
class EmailPlugin implements Plugin {
  // Only handles email sending
}

// Bad: Multiple responsibilities
class CommunicationPlugin implements Plugin {
  // Handles email, SMS, push notifications, webhooks...
}
```

### 2. Explicit Dependencies

Always declare dependencies:

```typescript
// Good: Explicit dependencies
class OrdersPlugin implements Plugin {
  readonly dependencies = ['logger', 'database', 'eventBus'];
}

// Bad: Hidden dependencies
class OrdersPlugin implements Plugin {
  async initialize(context: PluginContext) {
    // Assumes logger exists but doesn't declare it
    context.container.resolve('logger');
  }
}
```

### 3. Idempotent Operations

Ensure initialize() and start() can be called multiple times safely:

```typescript
async start(): Promise<void> {
  if (this.isRunning) {
    return; // Already running
  }

  await this.connect();
  this.isRunning = true;
}
```

### 4. Error Handling

Handle errors gracefully:

```typescript
async start(): Promise<void> {
  try {
    await this.connect();
  } catch (error) {
    this.logger.error('Failed to start plugin', error);
    throw new PluginStartupError(`${this.name} failed to start`, error);
  }
}
```

## Distribution

Package and distribute custom plugins:

```bash
# Create npm package
mkdir @mycompany/stratix-payment
cd @mycompany/stratix-payment

# package.json
{
  "name": "@mycompany/stratix-payment",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "@stratix/core": "^0.1.0",
    "@stratix/runtime": "^0.1.0"
  }
}

# Build and publish
npm run build
npm publish
```

## Next Steps

- [Bounded Contexts](./bounded-contexts.md) - Learn about Context Plugins
- [Architecture](./architecture.md) - Understand plugin architecture
- [Testing](../advanced/testing.md) - Test your plugins
