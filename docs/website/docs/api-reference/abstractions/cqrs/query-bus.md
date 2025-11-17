---
id: query-bus
title: QueryBus
sidebar_label: QueryBus
---

# QueryBus

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Query bus interface for dispatching queries to handlers. Provides decoupling between query senders and handlers.

## Import

```typescript
import type { QueryBus } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface QueryBus {
  execute<T extends Query, R>(query: T): Promise<Result<R, Error>>;
  register<T extends Query, R>(queryType: string, handler: QueryHandler<T, R>): void;
}
```

## Usage

```typescript
// Register handlers
queryBus.register('GetUserById', new GetUserByIdHandler(repository));

// Execute queries
const result = await queryBus.execute({
  type: 'GetUserById',
  userId: 'user-123'
});
```

## See Also

- [Query](./query.md)
- [Package README](../../../../packages/abstractions/README.md)
