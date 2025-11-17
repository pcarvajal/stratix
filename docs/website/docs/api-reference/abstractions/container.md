---
id: container
title: Container
sidebar_label: Container
---

# Container

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Dependency injection container interface. Manages service registration, resolution, and lifecycle with support for singleton, scoped, and transient lifetimes. Pure interface with zero runtime code - implementations provided by Layer 4.

**Key Features:**
- Service registration with factory functions
- Type-safe service resolution
- Lifetime management (singleton, scoped, transient)
- Scope creation for request-based services
- Automatic dependency resolution
- Disposable resource management

## Import

```typescript
import type { Container, Token, Factory, RegisterOptions } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface Container {
  register<T>(token: Token<T>, factory: Factory<T>, options?: RegisterOptions): void;
  resolve<T>(token: Token<T>): T;
  has<T>(token: Token<T>): boolean;
  createScope(): Container;
  dispose(): Promise<void>;
}

type Token<T> = string | symbol | { new (...args: any[]): T };
type Factory<T> = (context: Container) => T;

interface RegisterOptions {
  lifetime?: ServiceLifetime; // SINGLETON, SCOPED, TRANSIENT
}
```

## Usage Examples

### Basic Registration and Resolution

```typescript
import { Container } from '@stratix/impl-di-awilix';

const container = new AwilixContainer();

// Register singleton service
container.register('logger', () => new ConsoleLogger(), {
  lifetime: ServiceLifetime.SINGLETON
});

// Register with dependencies
container.register('userService', (ctx) => {
  const logger = ctx.resolve<Logger>('logger');
  const repo = ctx.resolve<UserRepository>('userRepository');
  return new UserService(logger, repo);
});

// Resolve services
const userService = container.resolve<UserService>('userService');
```

### Service Lifetimes

```typescript
// SINGLETON: One instance for entire application
container.register('database', () => new Database(), {
  lifetime: ServiceLifetime.SINGLETON
});

// SCOPED: One instance per scope (e.g., per HTTP request)
container.register('unitOfWork', () => new UnitOfWork(), {
  lifetime: ServiceLifetime.SCOPED
});

// TRANSIENT: New instance every time
container.register('messageHandler', () => new MessageHandler(), {
  lifetime: ServiceLifetime.TRANSIENT
});
```

### Scoped Services

```typescript
// Create scope for request
app.use(async (req, res, next) => {
  const scope = container.createScope();
  req.scope = scope;
  
  try {
    await next();
  } finally {
    await scope.dispose();
  }
});

// Use scoped services in request handler
app.post('/users', async (req, res) => {
  const userService = req.scope.resolve<UserService>('userService');
  const result = await userService.createUser(req.body);
  res.json(result);
});
```

## Best Practices

- **Do:** Use SINGLETON for stateless services
- **Do:** Use SCOPED for request-bound services (DB transactions)
- **Do:** Use TRANSIENT for stateful or short-lived services
- **Do:** Call dispose() on scopes to clean up resources
- **Don't:** Resolve services in constructors (use factory pattern)
- **Don't:** Store scope references beyond request lifetime

## Related Components

- [AwilixContainer](../layer-4-implementations/di-awilix/awilix-container.md) - Implementation
- [Plugin](./plugin.md) - Uses container for service registration

## See Also

- [Package README](../../../packages/abstractions/README.md)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
