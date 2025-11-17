---
id: result
title: Result
sidebar_label: Result
---

# Result

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Type-safe way to handle operations that can succeed or fail without throwing exceptions. Result forces explicit error handling at compile time and makes the success/failure paths visible in the type system.

The Result pattern eliminates try-catch blocks in domain logic, making code more predictable and easier to test. It's a union type of `Success<T>` and `Failure<E>`, where T is the success value type and E is the error type (must extend Error).

**Key Features:**
- Type-safe error handling without exceptions
- Explicit success/failure states in type system
- Composable with map and flatMap
- Zero runtime overhead
- Integrates with TypeScript's discriminated unions
- Railway-oriented programming support

## Import

```typescript
import { Result, Success, Failure, ResultUtils } from '@stratix/primitives';
```

## Type Signature

```typescript
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  readonly value: T;

  static create<T>(value: T): Success<T>;
  map<U>(fn: (value: T) => U): Success<U>;
  flatMap<U, E extends Error>(fn: (value: T) => Result<U, E>): Result<U, E>;
}

class Failure<E extends Error> {
  readonly isSuccess = false;
  readonly isFailure = true;
  readonly error: E;

  static create<E extends Error>(error: E): Failure<E>;
  map<U>(fn: (value: never) => U): Failure<E>;
  flatMap<U, E2 extends Error>(fn: (value: never) => Result<U, E2>): Failure<E>;
}
```

## Creating Results

### Success.create()

Creates a successful result wrapping a value.

**Signature:**
```typescript
static create<T>(value: T): Success<T>
```

**Parameters:**
- `value` (`T`): The success value

**Returns:**
- `Success<T>`: A Success instance containing the value

**Example:**
```typescript
return Success.create(42);
return Success.create({ id: '123', name: 'John' });
```

### Failure.create()

Creates a failed result wrapping an error.

**Signature:**
```typescript
static create<E extends Error>(error: E): Failure<E>
```

**Parameters:**
- `error` (`E extends Error`): The error

**Returns:**
- `Failure<E>`: A Failure instance containing the error

**Example:**
```typescript
return Failure.create(new Error('Operation failed'));
return Failure.create(new ValidationError('Invalid input'));
```

## Methods

### map()

Transforms the success value if the result is Success, otherwise passes through the Failure.

**Signature:**
```typescript
map<U>(fn: (value: T) => U): Result<U, E>
```

**Parameters:**
- `fn` (`(value: T) => U`): Transformation function

**Returns:**
- `Result<U, E>`: New result with transformed value

**Example:**
```typescript
const result = Success.create(5);
const doubled = result.map(x => x * 2); // Success(10)

const failed = Failure.create(new Error('fail'));
const mapped = failed.map(x => x * 2); // Still Failure('fail')
```

### flatMap()

Chains operations that return Results (monadic bind). Use when the transformation function itself returns a Result.

**Signature:**
```typescript
flatMap<U, E2 extends Error>(fn: (value: T) => Result<U, E2>): Result<U, E2>
```

**Parameters:**
- `fn` (`(value: T) => Result<U, E2>`): Function returning a Result

**Returns:**
- `Result<U, E2>`: Flattened result

**Example:**
```typescript
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

const result = Success.create(10)
  .flatMap(x => divide(x, 2))   // Success(5)
  .flatMap(x => divide(x, 0));  // Failure('Division by zero')
```

## ResultUtils

Helper functions for working with Results.

### unwrap()

Extracts the success value or throws the error.

**Signature:**
```typescript
unwrap<T, E extends Error>(result: Result<T, E>): T
```

**Returns:**
- `T`: The success value

**Throws:**
- `E`: The error if result is Failure

**Example:**
```typescript
const value = ResultUtils.unwrap(result); // 42 or throws
```

### unwrapOr()

Extracts the success value or returns a default value.

**Signature:**
```typescript
unwrapOr<T, E extends Error>(result: Result<T, E>, defaultValue: T): T
```

**Parameters:**
- `result` (`Result<T, E>`): The result to unwrap
- `defaultValue` (`T`): Value to return if Failure

**Returns:**
- `T`: Success value or default value

**Example:**
```typescript
const value = ResultUtils.unwrapOr(result, 0); // 42 or 0
```

### isSuccess() / isFailure()

Type guards for checking result state.

**Signature:**
```typescript
isSuccess<T, E extends Error>(result: Result<T, E>): result is Success<T>
isFailure<T, E extends Error>(result: Result<T, E>): result is Failure<E>
```

**Example:**
```typescript
if (ResultUtils.isSuccess(result)) {
  console.log(result.value); // Type-safe access
}
```

## Usage Examples

### Basic Error Handling

```typescript
import { Result, Success, Failure } from '@stratix/primitives';

function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Failure.create(new Error('Cannot divide by zero'));
  }
  return Success.create(a / b);
}

// Pattern matching with discriminated unions
const result = divide(10, 2);
if (result.isSuccess) {
  console.log('Result:', result.value); // 5
} else {
  console.error('Error:', result.error.message);
}
```

### Composing Operations

```typescript
import { Result, Success, Failure } from '@stratix/primitives';

function parseNumber(str: string): Result<number, Error> {
  const num = Number(str);
  if (isNaN(num)) {
    return Failure.create(new Error(`Invalid number: ${str}`));
  }
  return Success.create(num);
}

function squareRoot(n: number): Result<number, Error> {
  if (n < 0) {
    return Failure.create(new Error('Cannot take square root of negative'));
  }
  return Success.create(Math.sqrt(n));
}

// Chaining operations
const result = parseNumber('16')
  .flatMap(n => squareRoot(n))
  .map(n => n * 2);

if (result.isSuccess) {
  console.log(result.value); // 8
}
```

### Domain Logic with Result

```typescript
import { Result, Success, Failure } from '@stratix/primitives';
import { Entity, EntityId } from '@stratix/primitives';

class User extends Entity<'User'> {
  private email: string;

  changeEmail(newEmail: string): Result<void, Error> {
    if (!this.isValidEmail(newEmail)) {
      return Failure.create(new Error('Invalid email format'));
    }
    
    if (this.email === newEmail) {
      return Failure.create(new Error('Email unchanged'));
    }

    this.email = newEmail;
    this.touch();
    return Success.create(undefined);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Usage in command handler
class ChangeEmailHandler {
  async execute(userId: EntityId<'User'>, newEmail: string): Promise<Result<void, Error>> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return Failure.create(new Error('User not found'));
    }

    const result = user.changeEmail(newEmail);
    if (result.isFailure) {
      return result;
    }

    await this.repository.save(user);
    return Success.create(undefined);
  }
}
```

### Advanced: Railway-Oriented Programming

```typescript
type ValidationError = Error & { code: 'VALIDATION_ERROR' };
type NotFoundError = Error & { code: 'NOT_FOUND' };
type DatabaseError = Error & { code: 'DATABASE_ERROR' };

type AppError = ValidationError | NotFoundError | DatabaseError;

function validateInput(input: string): Result<string, ValidationError> {
  if (input.length < 3) {
    return Failure.create(Object.assign(
      new Error('Input too short'),
      { code: 'VALIDATION_ERROR' as const }
    ));
  }
  return Success.create(input);
}

function findUser(id: string): Result<User, NotFoundError> {
  // ... database lookup
  return Failure.create(Object.assign(
    new Error('User not found'),
    { code: 'NOT_FOUND' as const }
  ));
}

function saveUser(user: User): Result<void, DatabaseError> {
  // ... save to database
  return Success.create(undefined);
}

// Compose operations in a railway
const result = validateInput('john123')
  .flatMap(id => findUser(id))
  .flatMap(user => saveUser(user));

// Handle different error types
if (result.isFailure) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.log('Invalid input');
      break;
    case 'NOT_FOUND':
      console.log('User not found');
      break;
    case 'DATABASE_ERROR':
      console.log('Database error');
      break;
  }
}
```

### Integration with CQRS

```typescript
import { CommandHandler, Command } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';

interface CreateUserCommand extends Command {
  data: { email: string; name: string };
}

class CreateUserHandler implements CommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<Result<EntityId<'User'>, Error>> {
    // Validate
    if (!command.data.email) {
      return Failure.create(new Error('Email is required'));
    }

    // Check if exists
    const existing = await this.repository.findByEmail(command.data.email);
    if (existing) {
      return Failure.create(new Error('Email already exists'));
    }

    // Create user
    const user = User.create(command.data.email, command.data.name);

    // Save
    const saveResult = await this.repository.save(user);
    if (saveResult.isFailure) {
      return saveResult;
    }

    return Success.create(user.id);
  }
}

// Usage in API handler
app.post('/users', async (req, res) => {
  const result = await commandBus.execute({
    type: 'CreateUser',
    data: req.body
  });

  if (result.isSuccess) {
    res.status(201).json({ id: result.value.value });
  } else {
    res.status(400).json({ error: result.error.message });
  }
});
```

## Best Practices

- **Do:** Use Result for domain logic and application services
- **Do:** Use discriminated unions (`isSuccess`/`isFailure`) for type narrowing
- **Do:** Compose results with `flatMap` for chained operations
- **Do:** Create specific error types for different failure scenarios
- **Do:** Return `Result<void, Error>` for operations with no return value
- **Don't:** Use Result for unexpected errors (use exceptions instead)
- **Don't:** Mix Result and exceptions in the same layer
- **Don't:** Forget to handle the Failure case
- **Don't:** Use Result in performance-critical tight loops

## Common Pitfalls

### Pitfall 1: Not Handling Failure Case

**Problem:**
```typescript
const result = divide(10, 0);
console.log(result.value); // Runtime error if Failure!
```

**Solution:**
```typescript
const result = divide(10, 0);
if (result.isSuccess) {
  console.log(result.value); // Type-safe
} else {
  console.error(result.error);
}
```

### Pitfall 2: Using map Instead of flatMap

**Problem:**
```typescript
// BAD: Returns Result<Result<number>>
const result = Success.create(10)
  .map(x => divide(x, 2)); // Returns Success(Success(5))
```

**Solution:**
```typescript
// GOOD: Returns Result<number>
const result = Success.create(10)
  .flatMap(x => divide(x, 2)); // Returns Success(5)
```

### Pitfall 3: Mixing with Exceptions

**Problem:**
```typescript
// BAD: Mixing patterns
function process(input: string): Result<number, Error> {
  if (input === '') {
    throw new Error('Empty input'); // Exception!
  }
  return Success.create(parseInt(input));
}
```

**Solution:**
```typescript
// GOOD: Consistent Result usage
function process(input: string): Result<number, Error> {
  if (input === '') {
    return Failure.create(new Error('Empty input'));
  }
  const num = parseInt(input);
  if (isNaN(num)) {
    return Failure.create(new Error('Invalid number'));
  }
  return Success.create(num);
}
```

## When to Use Result vs Exceptions

**Use Result for:**
- Expected failures (validation errors, business rule violations)
- Domain logic and application services
- Operations where failure is part of normal flow
- Public API boundaries

**Use Exceptions for:**
- Unexpected errors (programming bugs, system failures)
- Infrastructure layer
- Third-party library integration
- Unrecoverable errors

## Type Safety

Result provides compile-time safety:

```typescript
const result: Result<number, Error> = divide(10, 2);

// TypeScript forces you to handle both cases
if (result.isSuccess) {
  const value: number = result.value; // Type narrowed
} else {
  const error: Error = result.error;  // Type narrowed
}
```

## Performance Considerations

- Creating Result instances has minimal overhead
- No stack unwinding like exceptions
- Enables compiler optimizations
- Predictable performance (no hidden control flow)
- Consider caching frequently created error instances

## Related Components

- [DomainError](../errors/domain-error.md) - Domain-specific error types
- [CommandHandler](../layer-2-abstractions/cqrs/command.md) - CQRS handlers using Result
- [Repository](../layer-2-abstractions/repository.md) - Data access with Result

## See Also

- [Package README](../../../packages/primitives/README.md)
- [Core Concepts - Error Handling](../../website/docs/core-concepts/error-handling.md)

- [Railway-Oriented Programming](https://fsharpforfunandprofit.com/rop/)
