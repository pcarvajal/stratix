---
id: query
title: Query
sidebar_label: Query
---

# Query

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Query pattern interfaces for read operations. Queries represent intent to read data and are handled by QueryHandlers. Part of CQRS pattern separating reads from writes.

## Import

```typescript
import type { Query, QueryHandler } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface Query {}

interface QueryHandler<TQuery extends Query, TResult = unknown> {
  handle(query: TQuery): Promise<TResult>;
}
```

## Usage

```typescript
interface GetUserByIdData {
  userId: string;
}

class GetUserByIdQuery implements Query {
  constructor(public readonly data: GetUserByIdData) {}
}

class GetUserByIdHandler implements QueryHandler<GetUserByIdQuery, Result<UserDTO, Error>> {
  constructor(private readonly repository: UserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<Result<UserDTO, Error>> {
    const user = await this.repository.findById(query.data.userId);
    if (!user) return Failure.create(new Error('User not found'));
    return Success.create(this.mapper.toDTO(user));
  }
}
```

## See Also

- [QueryBus](./query-bus.md)
- [Package README](../../../../packages/abstractions/README.md)
