---
id: cqrs-overview
title: CQRS Overview
sidebar_label: Overview
---

# CQRS - Abstractions

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

CQRS (Command Query Responsibility Segregation) pattern interfaces. Separates write operations (commands) from read operations (queries) for scalability and maintainability.

## Components

- [Command](./command.md) - Write operation interface
- [Query](./query.md) - Read operation interface
- [CommandBus](./command-bus.md) - Command dispatcher
- [QueryBus](./query-bus.md) - Query dispatcher

## Quick Example

```typescript
// Command side (writes)
const createResult = await commandBus.execute({
  type: 'CreateUser',
  data: { email: 'user@example.com' }
});

// Query side (reads)
const queryResult = await queryBus.execute({
  type: 'GetUserById',
  userId: createResult.value
});
```

## Benefits

- **Scalability**: Scale reads and writes independently
- **Optimization**: Optimize queries separately from writes
- **Clarity**: Clear separation of concerns
- **Flexibility**: Different models for reads vs writes

## See Also

- [Package README](../../../../packages/abstractions/README.md)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
