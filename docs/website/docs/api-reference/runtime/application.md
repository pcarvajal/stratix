---
id: application
title: Application
sidebar_label: Application
---

# Application

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Represents a configured Stratix application. Manages lifecycle (start/stop), health checks, and provides access to the service container. Created by ApplicationBuilder.

**Key Features:**
- Lifecycle management (start, stop, restart)
- Health check API
- Service container access
- Graceful shutdown
- Plugin status inspection

## Import

```typescript
import type { Application } from '@stratix/runtime';
```

## Type Signature

```typescript
interface Application {
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  healthCheck(pluginName?: string): Promise<HealthCheckResult>;
  healthCheckAll(): Promise<Map<string, HealthCheckResult>>;
  getContainer(): Container;
  isRunning(): boolean;
}
```

## Usage Examples

### Basic Lifecycle

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new DatabasePlugin())
  .build();

// Start application
await app.start();
console.log('Application started');

// Check if running
console.log(app.isRunning()); // true

// Stop application
await app.stop();
console.log('Application stopped');
```

### Health Checks

```typescript
// Check specific plugin
const dbHealth = await app.healthCheck('database');
if (dbHealth.status === HealthStatus.UP) {
  console.log('Database is healthy');
} else {
  console.error('Database is down:', dbHealth.message);
}

// Check all plugins
const allHealth = await app.healthCheckAll();
for (const [name, result] of allHealth) {
  console.log(`${name}: ${result.status}`);
}
```

### Service Resolution

```typescript
await app.start();

// Access services from container
const container = app.getContainer();
const userService = container.resolve<UserService>('userService');
const logger = container.resolve<Logger>('logger');

// Use services
const result = await userService.createUser({ email: 'user@example.com' });
logger.info('User created', { userId: result.value });
```

### Graceful Shutdown

```typescript
// Setup signal handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

await app.start();
```

### Health Check Endpoint

```typescript
const app = await ApplicationBuilder.create()
  .useContainer(container)
  .useLogger(logger)
  .usePlugin(new PostgresPlugin())
  .usePlugin(new RedisPlugin())
  .usePlugin(new FastifyHTTPPlugin({ port: 3000 }))
  .build();

await app.start();

// Expose health check endpoint
const fastify = container.resolve<FastifyInstance>('fastify');
fastify.get('/health', async (req, reply) => {
  const health = await app.healthCheckAll();
  
  const allHealthy = Array.from(health.values())
    .every(h => h.status === HealthStatus.UP);
  
  reply.code(allHealthy ? 200 : 503).send({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks: Object.fromEntries(health)
  });
});
```

## Methods

### start()

Starts the application by calling start() on all plugins in dependency order.

**Throws:** If any plugin fails to start

```typescript
await app.start();
```

### stop()

Stops the application by calling stop() on all plugins in reverse dependency order.

```typescript
await app.stop();
```

### restart()

Stops and starts the application.

```typescript
await app.restart();
```

### healthCheck()

Checks health of a specific plugin or all plugins.

```typescript
const result = await app.healthCheck('database');
console.log(result.status); // UP, DOWN, DEGRADED
```

### healthCheckAll()

Checks health of all plugins.

```typescript
const results = await app.healthCheckAll();
for (const [name, result] of results) {
  console.log(`${name}: ${result.status}`);
}
```

### getContainer()

Returns the DI container for service resolution.

```typescript
const container = app.getContainer();
const service = container.resolve<MyService>('myService');
```

### isRunning()

Checks if application is currently running.

```typescript
if (app.isRunning()) {
  console.log('Application is running');
}
```

## Best Practices

- **Do:** Call start() before using services
- **Do:** Call stop() during shutdown
- **Do:** Use health checks for monitoring
- **Do:** Handle start/stop errors
- **Don't:** Call start() multiple times
- **Don't:** Access services before start()

## Related Components

- [ApplicationBuilder](./application-builder.md) - Creates Application
- [LifecycleManager](./lifecycle-manager.md) - Manages lifecycle

## See Also

- [Package README](../../../packages/runtime/README.md)
