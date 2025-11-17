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
interface Query {
  readonly type: string;
}

interface QueryHandler<T extends Query, R> {
  execute(query: T): Promise<Result<R, Error>>;
}
```

## Usage

```typescript
interface GetUserByIdQuery extends Query {
  type: 'GetUserById';
  userId: string;
}

class GetUserByIdHandler implements QueryHandler<GetUserByIdQuery, UserDTO> {
  async execute(query: GetUserByIdQuery): Promise<Result<UserDTO, Error>> {
    const user = await this.repository.findById(query.userId);
    if (!user) return Failure.create(new Error('User not found'));
    return Success.create(this.mapper.toDTO(user));
  }
}
```

## See Also

- [QueryBus](./query-bus.md)
- [Package README](../../../../packages/abstractions/README.md)
