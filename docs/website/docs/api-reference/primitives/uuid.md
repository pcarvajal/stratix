# UUID

Represents a UUID (Universally Unique Identifier) with validation.

## Overview

`UUID` is an immutable value object that validates UUID format (version 4) and provides convenient generation methods.

## Static Methods

### create()

```typescript
static create(value: string): Result<UUID, DomainError>
```

Creates a UUID instance with validation.

### generate()

```typescript
static generate(): UUID
```

Generates a new random UUID (version 4).

## Properties

### value

```typescript
readonly value: string
```

The UUID string.

## Usage

```typescript
import { UUID } from '@stratix/primitives';

// Generate new UUID
const uuid = UUID.generate();
console.log(uuid.value); // "550e8400-e29b-41d4-a716-446655440000"

// Validate existing UUID
const result = UUID.create('550e8400-e29b-41d4-a716-446655440000');
if (result.isSuccess) {
  console.log(result.value.value);
}

const invalid = UUID.create('not-a-uuid');
if (invalid.isFailure) {
  console.log(invalid.error.code); // "INVALID_UUID_FORMAT"
}
```

## See Also

- [Value Object](./value-object.md)
- [EntityId](./entity-id.md)
