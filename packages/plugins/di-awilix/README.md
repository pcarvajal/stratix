# @stratix/di-awilix

Dependency injection container using Awilix.

## Installation

```bash
pnpm add @stratix/di-awilix
```

## Features

- Constructor, property, and method injection
- Singleton, scoped, and transient lifetimes
- Auto-registration
- Type-safe resolving

## Quick Example

```typescript
import { AwilixContainer } from '@stratix/di-awilix';
import { ServiceLifetime } from '@stratix/core';

const container = new AwilixContainer();

container.register('logger', () => new ConsoleLogger(), {
  lifetime: ServiceLifetime.SINGLETON
});

const logger = container.resolve('logger');
```

## License

MIT
