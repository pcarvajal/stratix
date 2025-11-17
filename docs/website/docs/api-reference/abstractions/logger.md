---
id: logger
title: Logger
sidebar_label: Logger
---

# Logger

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Structured logging interface with multiple log levels and context support. Pure interface enabling different logging implementations (console, file, cloud services) without changing application code.

**Key Features:**
- Multiple log levels (debug, info, warn, error, fatal)
- Structured context objects
- Type-safe logging
- Implementation-agnostic
- Zero runtime overhead

## Import

```typescript
import type { Logger, LogLevel } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface Logger {
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  fatal(message: string, context?: Record<string, unknown>): void;
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}
```

## Usage Examples

```typescript
// In application code - depends only on interface
class UserService {
  constructor(private logger: Logger) {}

  async createUser(data: UserData): Promise<User> {
    this.logger.info('Creating user', { email: data.email });
    
    try {
      const user = await this.repository.save(User.create(data));
      this.logger.info('User created successfully', { userId: user.id.value });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', { error, email: data.email });
      throw error;
    }
  }
}

// Implementation can be swapped
const logger: Logger = new ConsoleLogger();
// or: const logger: Logger = new CloudLogger();
// or: const logger: Logger = new FileLogger();

const service = new UserService(logger);
```

## Best Practices

- **Do:** Include relevant context in structured logs
- **Do:** Use appropriate log levels
- **Do:** Log domain events at INFO level
- **Do:** Log errors with full error object
- **Don't:** Log sensitive data (passwords, tokens)
- **Don't:** Use console.log directly

## Related Components

- [ConsoleLogger](../layer-4-implementations/logger-console/console-logger.md) - Implementation

## See Also

- [Package README](../../../packages/abstractions/README.md)
