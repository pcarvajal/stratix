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
interface Command {
  readonly type: string;
}

interface CommandHandler<T extends Command> {
  execute(command: T): Promise<Result<unknown, Error>>;
}
```

## Usage

```typescript
interface CreateUserCommand extends Command {
  type: 'CreateUser';
  data: { email: string; name: string };
}

class CreateUserHandler implements CommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<Result<EntityId<'User'>, Error>> {
    const user = User.create(command.data.email, command.data.name);
    await this.repository.save(user);
    return Success.create(user.id);
  }
}
```

## See Also

- [CommandBus](./command-bus.md)
- [Package README](../../../../packages/abstractions/README.md)
