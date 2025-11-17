---
id: command-bus
title: CommandBus
sidebar_label: CommandBus
---

# CommandBus

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Command bus interface for dispatching commands to handlers. Provides decoupling between command senders and handlers.

## Import

```typescript
import type { CommandBus } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface CommandBus {
  execute<T extends Command>(command: T): Promise<Result<unknown, Error>>;
  register<T extends Command>(commandType: string, handler: CommandHandler<T>): void;
}
```

## Usage

```typescript
// Register handlers
commandBus.register('CreateUser', new CreateUserHandler(repository));

// Execute commands
const result = await commandBus.execute({
  type: 'CreateUser',
  data: { email: 'user@example.com', name: 'John' }
});
```

## See Also

- [Command](./command.md)
- [Package README](../../../../packages/abstractions/README.md)
