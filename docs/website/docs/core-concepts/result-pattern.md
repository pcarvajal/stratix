---
sidebar_position: 3
title: Result Pattern
description: Type-safe error handling without exceptions
---

# Result Pattern

The **Result Pattern** provides explicit, type-safe error handling without throwing exceptions.

## The Problem with Exceptions

```typescript
// ❌ Traditional approach with exceptions
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero'); // Hidden control flow
  }
  return a / b;
}

try {
  const result = divide(10, 0);
  console.log(result);
} catch (error) {
  console.error(error); // Must remember to catch
}
```

**Problems:**
- ❌ Hidden control flow
- ❌ Easy to forget error handling
- ❌ No type safety for errors
- ❌ Performance overhead

## The Solution: Result Pattern

```typescript
// ✅ Result Pattern approach
import { Result, Success, Failure } from '@stratix/core';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

const result = divide(10, 2);

if (result.isSuccess) {
  console.log(result.value); // 5
} else {
  console.error(result.error.message);
}
```

**Benefits:**
- ✅ Explicit error handling
- ✅ Type-safe
- ✅ Compiler enforces checking
- ✅ No hidden control flow

## Basic Usage

### Creating Success Results

```typescript
import { Success } from '@stratix/core';

const result = Success.create(42);

console.log(result.isSuccess); // true
console.log(result.isFailure); // false
console.log(result.value);     // 42
```

### Creating Failure Results

```typescript
import { Failure } from '@stratix/core';

const result = Failure.create(new Error('Something went wrong'));

console.log(result.isSuccess); // false
console.log(result.isFailure); // true
console.log(result.error);     // Error: Something went wrong
```

### Checking Results

```typescript
const result = divide(10, 2);

// Type guard
if (result.isSuccess) {
  // TypeScript knows result.value exists
  console.log(result.value);
} else {
  // TypeScript knows result.error exists
  console.error(result.error.message);
}
```

## Real-World Examples

### Value Object Creation

```typescript
import { ValueObject, Result, Success, Failure } from '@stratix/core';

export class Email extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(email: string): Result<Email> {
    // Validation
    if (!email || email.trim().length === 0) {
      return Failure.create(new Error('Email cannot be empty'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Failure.create(new Error('Invalid email format'));
    }

    return Success.create(new Email({ value: email.toLowerCase() }));
  }

  get value(): string {
    return this.props.value;
  }
}

// Usage
const emailResult = Email.create('john@example.com');

if (emailResult.isSuccess) {
  const email = emailResult.value;
  console.log(email.value); // "john@example.com"
} else {
  console.error(emailResult.error.message);
}
```

### Command Handlers

```typescript
import { CommandHandler, Result, Success, Failure } from '@stratix/core';

export class CreateUserHandler 
  implements CommandHandler<CreateUserCommand, User> {
  
  constructor(
    private userRepository: IUserRepository,
    private emailService: EmailService
  ) {}

  async handle(command: CreateUserCommand): Promise<Result<User>> {
    // Validate email
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) {
      return Failure.create(emailResult.error);
    }

    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(emailResult.value);
    if (existingUser) {
      return Failure.create(new Error('User already exists'));
    }

    // Create user
    const user = new User(
      EntityId.create<'User'>(),
      emailResult.value,
      command.name,
      new Date(),
      new Date()
    );

    // Save user
    await this.userRepository.save(user);

    // Send welcome email
    const emailSent = await this.emailService.sendWelcomeEmail(user.email);
    if (emailSent.isFailure) {
      // Log error but don't fail the command
      console.error('Failed to send welcome email:', emailSent.error);
    }

    return Success.create(user);
  }
}
```

### Query Handlers

```typescript
export class GetUserByIdHandler 
  implements QueryHandler<GetUserByIdQuery, User> {
  
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserByIdQuery): Promise<Result<User>> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      return Failure.create(new Error('User not found'));
    }

    return Success.create(user);
  }
}
```

## HTTP Integration

### Controller Example

```typescript
import { FastifyHTTPPlugin, HttpErrorImpl } from '@stratix/http-fastify';

httpPlugin.post('/users', async (request) => {
  const { email, name } = request.body;

  const result = await commandBus.dispatch(
    new CreateUserCommand(email, name)
  );

  if (result.isFailure) {
    throw HttpErrorImpl.badRequest(result.error.message);
  }

  return { statusCode: 201, body: result.value };
});

httpPlugin.get('/users/:id', async (request) => {
  const { id } = request.params;

  const result = await queryBus.execute(
    new GetUserByIdQuery(id)
  );

  if (result.isFailure) {
    throw HttpErrorImpl.notFound(result.error.message);
  }

  return { body: result.value };
});
```

## Chaining Results

### Map

Transform a successful result:

```typescript
const result = Success.create(5);

const doubled = result.map(value => value * 2);

console.log(doubled.value); // 10
```

### FlatMap (Bind)

Chain operations that return Results:

```typescript
function parseNumber(str: string): Result<number> {
  const num = parseInt(str);
  if (isNaN(num)) {
    return Failure.create(new Error('Invalid number'));
  }
  return Success.create(num);
}

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

// Chain operations
const result = parseNumber('10')
  .flatMap(num => divide(num, 2));

if (result.isSuccess) {
  console.log(result.value); // 5
}
```

## ResultUtils

Utility functions for working with multiple Results:

### Combine

Combine multiple Results into one:

```typescript
import { ResultUtils } from '@stratix/core';

const emailResult = Email.create('john@example.com');
const ageResult = Age.create(25);
const nameResult = Name.create('John Doe');

const combined = ResultUtils.combine([emailResult, ageResult, nameResult]);

if (combined.isSuccess) {
  const [email, age, name] = combined.value;
  // All validations passed
} else {
  // At least one validation failed
  console.error(combined.error);
}
```

## Custom Error Types

### Domain Errors

```typescript
import { DomainError } from '@stratix/core';

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
    this.name = 'InvalidEmailError';
  }
}

// Usage
const result = await userRepository.findById(userId);

if (!result) {
  return Failure.create(new UserNotFoundError(userId));
}
```

### Error Handling by Type

```typescript
const result = await commandBus.dispatch(command);

if (result.isFailure) {
  if (result.error instanceof UserNotFoundError) {
    throw HttpErrorImpl.notFound(result.error.message);
  } else if (result.error instanceof InvalidEmailError) {
    throw HttpErrorImpl.badRequest(result.error.message);
  } else {
    throw HttpErrorImpl.internalServerError(result.error.message);
  }
}
```

## Best Practices

### 1. Always Return Result from Domain Operations

```typescript
// ✅ Good: Returns Result
static create(email: string): Result<Email> {
  if (!this.isValid(email)) {
    return Failure.create(new Error('Invalid email'));
  }
  return Success.create(new Email({ value: email }));
}

// ❌ Bad: Throws exception
static create(email: string): Email {
  if (!this.isValid(email)) {
    throw new Error('Invalid email');
  }
  return new Email({ value: email });
}
```

### 2. Check Results Before Using Values

```typescript
// ✅ Good: Checks result
const result = Email.create(input);
if (result.isSuccess) {
  console.log(result.value);
}

// ❌ Bad: Assumes success
const result = Email.create(input);
console.log(result.value); // May not exist!
```

### 3. Propagate Failures

```typescript
// ✅ Good: Propagates failure
async handle(command: CreateUserCommand): Promise<Result<User>> {
  const emailResult = Email.create(command.email);
  if (emailResult.isFailure) {
    return Failure.create(emailResult.error);
  }
  
  // Continue with emailResult.value
}

// ❌ Bad: Swallows error
async handle(command: CreateUserCommand): Promise<Result<User>> {
  const emailResult = Email.create(command.email);
  if (emailResult.isFailure) {
    console.error(emailResult.error); // Just logs
  }
  
  // Continues anyway!
}
```

### 4. Use Specific Error Types

```typescript
// ✅ Good: Specific error
return Failure.create(new UserNotFoundError(userId));

// ❌ Bad: Generic error
return Failure.create(new Error('Error'));
```

## Comparison with Exceptions

| Feature | Result Pattern | Exceptions |
|---------|---------------|------------|
| **Explicit** | ✅ Visible in signature | ❌ Hidden |
| **Type Safety** | ✅ Compile-time checks | ❌ Runtime only |
| **Performance** | ✅ No stack unwinding | ❌ Expensive |
| **Control Flow** | ✅ Explicit | ❌ Hidden |
| **Forced Handling** | ✅ Compiler enforces | ❌ Easy to forget |

## When to Use Exceptions

Use exceptions for:
- ❌ Truly exceptional situations (system failures)
- ❌ Framework/library boundaries
- ❌ Unrecoverable errors

Use Result Pattern for:
- ✅ Business logic errors
- ✅ Validation errors
- ✅ Expected failures
- ✅ Domain operations

## Next Steps

- **[Domain Modeling](./domain-modeling)** - Entities and value objects
- **[CQRS](./cqrs)** - Commands and queries with Result
- **[Architecture Overview](./architecture-overview)** - Hexagonal architecture
