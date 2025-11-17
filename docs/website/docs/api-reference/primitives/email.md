# Email

Represents an email address with validation.

## Overview

`Email` is an immutable value object that automatically validates and normalizes email addresses (trimmed and lowercased).

## Static Methods

### create()

```typescript
static create(value: string): Result<Email, DomainError>
```

Creates an Email instance with validation.

## Properties

### value

```typescript
readonly value: string
```

The normalized email address (lowercase, trimmed).

### domain

```typescript
readonly domain: string
```

The domain part of the email (after @).

### localPart

```typescript
readonly localPart: string
```

The local part of the email (before @).

## Usage

```typescript
import { Email } from '@stratix/primitives';

const result = Email.create('user@example.com');
if (result.isSuccess) {
  const email = result.value;
  console.log(email.value); // "user@example.com"
  console.log(email.domain); // "example.com"
  console.log(email.localPart); // "user"
}

const invalid = Email.create('not-an-email');
if (invalid.isFailure) {
  console.log(invalid.error.code); // "INVALID_EMAIL_FORMAT"
}
```

## See Also

- [Value Object](./value-object.md)
- [DomainError](./domain-error.md)
