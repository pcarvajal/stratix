# Dependency Injection Guide

Complete guide for using Stratix's simplified DI system.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [API Reference](#api-reference)
4. [Auto-Wiring](#auto-wiring)
5. [Best Practices](#best-practices)
6. [Migration Guide](#migration-guide)

---

## Quick Start

### Basic Registration

```typescript
import { AwilixContainer } from '@stratix/di-awilix';

const container = new AwilixContainer();

// Singleton value
container.singleton('config', { port: 3000, env: 'production' });

// Singleton factory
container.singleton('logger', () => new Logger());

// Scoped service
container.scoped('requestContext', () => new RequestContext());

// Transient service
container.transient('requestId', () => crypto.randomUUID());
```

### Class Registration with Auto-Wiring

```typescript
class UserService {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus,
    private logger: Logger
  ) {}
}

// Register dependencies
container.registerClass(UserRepository);
container.singleton('eventBus', new EventBus());
container.singleton('logger', () => new Logger());

// Register service - dependencies auto-wired!
container.registerClass(UserService);

// Resolve
const userService = container.resolve<UserService>(UserService);
```

---

## Core Concepts

### Service Lifetimes

**Singleton** - Created once, shared everywhere
```typescript
container.singleton('database', () => new Database());
```

**Scoped** - Created once per scope
```typescript
container.scoped('requestContext', () => new RequestContext());

const scope = container.createScope();
const ctx1 = scope.resolve('requestContext');
const ctx2 = scope.resolve('requestContext');
// ctx1 === ctx2 (same instance within scope)
```

**Transient** - Created every time
```typescript
container.transient('requestId', () => crypto.randomUUID());

const id1 = container.resolve('requestId');
const id2 = container.resolve('requestId');
// id1 !== id2 (different instances)
```

### Tokens

Services can be registered with different token types:

```typescript
// String token
container.singleton('logger', new Logger());

// Class token
container.registerClass(UserService);

// Symbol token
const CONFIG = Symbol('config');
container.singleton(CONFIG, appConfig);
```

---

## API Reference

### `singleton<T>(token, value | factory)`

Register a singleton service.

```typescript
// Direct value
container.singleton('config', { port: 3000 });

// Factory function
container.singleton('logger', () => new Logger());
```

### `scoped<T>(token, factory)`

Register a scoped service.

```typescript
container.scoped('requestContext', () => new RequestContext());
```

### `transient<T>(token, factory)`

Register a transient service.

```typescript
container.transient('requestId', () => crypto.randomUUID());
```

### `registerClass<T>(classType, options?)`

Register a class with auto-wiring.

```typescript
// Basic
container.registerClass(UserService);

// With options
container.registerClass(UserService, {
  token: 'userService',
  lifetime: ServiceLifetime.SCOPED,
  injectionMode: 'PROXY'  // or 'CLASSIC'
});
```

### `registerAll(services)`

Register multiple services at once.

```typescript
container.registerAll({
  config: appConfig,
  logger: () => new Logger(),
  database: Database,  // Class
  userService: UserService
});
```

### `tryResolve<T>(token)`

Safely resolve a service.

```typescript
const logger = container.tryResolve<Logger>('logger');
if (logger) {
  logger.info('Service found');
}
```

### `registerAwilix(registrations)`

Use Awilix's native API for advanced scenarios.

```typescript
container.registerAwilix({
  userService: awilix.asClass(UserService)
    .singleton()
    .inject(() => ({ customDep: 'value' }))
});
```

---

## Auto-Wiring

### How It Works

Auto-wiring resolves dependencies based on constructor parameter names.

```typescript
class UserService {
  constructor(
    private userRepository: UserRepository,  // Resolves 'userRepository'
    private eventBus: EventBus,              // Resolves 'eventBus'
    private logger: Logger                   // Resolves 'logger'
  ) {}
}
```

### Naming Conventions

**Parameter names must match registered tokens:**

```typescript
// Register with matching names
container.registerClass(UserRepository);  // Token: 'UserRepository'
container.singleton('eventBus', new EventBus());
container.singleton('logger', () => new Logger());

// Auto-wiring works!
container.registerClass(UserService);
```

### Injection Modes

**PROXY Mode (Default)**
- Auto-wiring by parameter names
- Recommended for most cases
- Slight performance overhead

```typescript
container.registerClass(UserService);  // Uses PROXY
```

**CLASSIC Mode**
- Explicit dependency array
- For edge cases
- Better performance

```typescript
container.registerClass(UserService, { 
  injectionMode: 'CLASSIC' 
});
```

---

## Best Practices

### 1. Use Descriptive Tokens

```typescript
// Good
container.singleton('userRepository', new UserRepository());

// Avoid
container.singleton('repo', new UserRepository());
```

### 2. Prefer Classes for Services

```typescript
// Good - testable, maintainable
class UserService {
  constructor(private repository: UserRepository) {}
}
container.registerClass(UserService);

// Avoid - harder to test
container.singleton('userService', () => {
  return {
    getUser: (id) => repository.findById(id)
  };
});
```

### 3. Use Batch Registration in Plugins

```typescript
class MyPlugin implements Plugin {
  initialize(context: PluginContext) {
    context.container.registerAll({
      service1: this.service1,
      service2: this.service2,
      service3: this.service3
    });
  }
}
```

### 4. Leverage Auto-Wiring

```typescript
// Instead of manual resolution
container.register('userService', (c) => {
  return new UserService(
    c.resolve('userRepository'),
    c.resolve('eventBus')
  );
});

// Use auto-wiring
container.registerClass(UserService);
```

### 5. Use tryResolve for Optional Dependencies

```typescript
class MyService {
  constructor(
    private logger: Logger = container.tryResolve('logger') ?? new NullLogger()
  ) {}
}
```

---

## Migration Guide

### From Old API to New API

**Before:**
```typescript
context.container.register('jwtService', () => this.jwtService);
context.container.register('passwordHasher', () => this.passwordHasher);
context.container.register('rbacService', () => this.rbacService);
```

**After:**
```typescript
context.container.registerAll({
  jwtService: this.jwtService,
  passwordHasher: this.passwordHasher,
  rbacService: this.rbacService
});
```

**Before:**
```typescript
container.register('userService', (context) => {
  const repository = context.resolve<UserRepository>('userRepository');
  const eventBus = context.resolve<EventBus>('eventBus');
  return new UserService(repository, eventBus);
}, {
  lifetime: ServiceLifetime.SINGLETON
});
```

**After:**
```typescript
container.registerClass(UserService);
```

### Breaking Changes

None! The new API is fully backward compatible. Old code continues to work.

---

## Advanced Examples

### Conditional Registration

```typescript
if (config.enableCaching) {
  container.singleton('cache', () => new RedisCache());
} else {
  container.singleton('cache', () => new InMemoryCache());
}
```

### Factory with Dependencies

```typescript
container.singleton('database', () => {
  const config = container.resolve('config');
  return new Database(config.db);
});
```

### Scoped Services in HTTP Requests

```typescript
app.use((req, res, next) => {
  const scope = container.createScope();
  scope.scoped('requestContext', () => new RequestContext(req));
  req.container = scope;
  next();
});

app.get('/users', (req, res) => {
  const userService = req.container.resolve('userService');
  // userService has access to request-scoped context
});
```

---

## Troubleshooting

### "Service not registered" Error

Ensure the service is registered before resolving:

```typescript
// Wrong order
const service = container.resolve('myService');
container.singleton('myService', new MyService());

// Correct order
container.singleton('myService', new MyService());
const service = container.resolve('myService');
```

### Auto-Wiring Not Working

Check parameter names match registered tokens:

```typescript
// Parameter name: userRepository
class UserService {
  constructor(private userRepository: UserRepository) {}
}

// Must register as 'userRepository'
container.registerClass(UserRepository);  // Token: 'UserRepository' ❌
container.singleton('userRepository', new UserRepository());  // ✅
```

### Circular Dependencies

Avoid circular dependencies by refactoring:

```typescript
// Bad - circular
class A {
  constructor(private b: B) {}
}
class B {
  constructor(private a: A) {}
}

// Good - introduce interface
interface IEventBus {
  publish(event: Event): void;
}

class A {
  constructor(private eventBus: IEventBus) {}
}
```

---

## Performance Tips

1. **Use singletons for expensive resources**
   ```typescript
   container.singleton('database', () => new Database());
   ```

2. **Prefer PROXY mode** (default) unless you have specific needs

3. **Batch register in plugins** to reduce overhead
   ```typescript
   container.registerAll({ /* services */ });
   ```

4. **Dispose scopes** when done
   ```typescript
   const scope = container.createScope();
   // ... use scope
   await scope.dispose();
   ```

---

## License

MIT
