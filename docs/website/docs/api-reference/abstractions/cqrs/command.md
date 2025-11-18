---
id: command
title: Command
sidebar_label: Command
---

# Command

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions  
> **Since:** v0.1.0

## Overview

Command pattern interfaces for write operations. Commands represent intent to change system state and are handled by CommandHandlers. Part of CQRS pattern separating writes from reads.

## Import

```typescript
import type { Command, CommandHandler } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface Command {}

interface CommandHandler<TCommand extends Command, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}
```

## Usage

```typescript
interface CreateUserData {
  email: string;
  name: string;
}

class CreateUserCommand implements Command {
  constructor(public readonly data: CreateUserData) {}
}

class CreateUserHandler implements CommandHandler<CreateUserCommand, Result<EntityId<'User'>, Error>> {
  constructor(private readonly repository: UserRepository) {}

  async handle(command: CreateUserCommand): Promise<Result<EntityId<'User'>, Error>> {
    const user = User.create(command.data);
    await this.repository.save(user);
    return Success.create(user.id);
  }
}
```

## See Also

- [CommandBus](./command-bus.md)
- [Package README](../../../../packages/abstractions/README.md)
