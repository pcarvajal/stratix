# @stratix/abstractions

Pure TypeScript interfaces with zero runtime code.

## Installation

```bash
pnpm add @stratix/abstractions
```

## What's Included

- **Container** - Dependency injection interface
- **Logger** - Logging interface (info, warn, error, debug)
- **EventBus** - Event publishing and subscription
- **Repository** - Data persistence abstraction
- **Plugin** - Plugin lifecycle interface
- **CQRS** - Command, Query, and Event interfaces

## Usage

```typescript
import type { Logger, LogLevel } from '@stratix/abstractions';

class MyService {
  constructor(private logger: Logger) {}

  doSomething(): void {
    this.logger.info('Operation started');
  }
}
```

## Why Abstractions?

All Stratix packages depend on abstractions, not implementations. This enables:
- Swap implementations without code changes
- Test with mocks easily
- Zero coupling between layers
- Tree-shakeable builds

## License

MIT
