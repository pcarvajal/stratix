# Result Pattern

The Result pattern is a functional programming approach to error handling that makes errors explicit and type-safe. Instead of throwing exceptions, functions return a Result type that can be either Success or Failure.

## Why Result Pattern?

Traditional exception-based error handling has problems:

```typescript
// Traditional approach - exceptions
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');  // Hidden error path
  }
  return a / b;
}

// Caller has no indication this can fail
const result = divide(10, 0);  // Runtime exception!
```

With Result pattern, errors are explicit:

```typescript
// Result pattern - explicit errors
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

// Caller must handle both success and failure
const result = divide(10, 0);
if (result.isSuccess) {
  console.log(result.value);  // Type-safe access
} else {
  console.error(result.error);  // Forced error handling
}
```

## Result Type

The Result type represents either success or failure:

```typescript
import { Result, Success, Failure } from '@stratix/core';

// Generic: Result<TValue, TError = Error>
type Result<T, E = Error> = Success<T> | Failure<E>;
```

### Creating Results

```typescript
// Success
const success = Success.create(42);
console.log(success.isSuccess);  // true
console.log(success.value);      // 42

// Failure
const failure = Failure.create(new Error('Something went wrong'));
console.log(failure.isFailure);  // true
console.log(failure.error);      // Error instance
```

### Checking Results

```typescript
const result = someOperation();

if (result.isSuccess) {
  // TypeScript narrows type to Success<T>
  console.log(result.value);
} else {
  // TypeScript narrows type to Failure<E>
  console.error(result.error);
}
```

## Using Result in Domain Logic

### Command Handlers

```typescript
import { CommandHandler } from '@stratix/core';
import { Result, Success, Failure } from '@stratix/core';

export class CreateProductHandler implements CommandHandler<CreateProduct, Result<CreateProductOutput>> {
  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    try {
      // Validation
      if (command.data.price < 0) {
        return Failure.create(new Error('Price cannot be negative'));
      }

      // Domain logic
      const product = Product.create(command.data);
      await this.repository.save(product);

      // Success
      return Success.create({ id: product.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

### Query Handlers

```typescript
export class GetProductHandler implements QueryHandler<GetProduct, Result<ProductDto>> {
  async handle(query: GetProduct): Promise<Result<ProductDto>> {
    const product = await this.repository.findById(query.data.id);

    if (!product) {
      return Failure.create(new Error('Product not found'));
    }

    return Success.create({
      id: product.id.toString(),
      name: product.name,
      price: product.price
    });
  }
}
```

## Domain Operations

Use Result for domain operations that can fail:

```typescript
export class Product extends AggregateRoot<'Product'> {
  applyDiscount(percentage: number): Result<void> {
    if (percentage < 0 || percentage > 100) {
      return Failure.create(
        new Error('Discount must be between 0 and 100')
      );
    }

    this._price = this._price * (1 - percentage / 100);
    this.touch();

    return Success.create(undefined);
  }

  decreaseStock(quantity: number): Result<void> {
    if (quantity <= 0) {
      return Failure.create(
        new Error('Quantity must be positive')
      );
    }

    if (this._stock < quantity) {
      return Failure.create(
        new Error('Insufficient stock')
      );
    }

    this._stock -= quantity;
    this.record(new StockDecreasedEvent(this.id, quantity));
    this.touch();

    return Success.create(undefined);
  }
}
```

## Value Object Creation

Always return Result from value object factory methods:

```typescript
export class Email extends ValueObject<EmailProps> {
  static create(email: string): Result<Email> {
    if (!email || email.trim().length === 0) {
      return Failure.create(new Error('Email cannot be empty'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Failure.create(new Error('Invalid email format'));
    }

    return Success.create(new Email({
      value: email.toLowerCase().trim()
    }));
  }
}

// Usage
const result = Email.create('user@example.com');
if (result.isSuccess) {
  const email = result.value;
  // Use email
} else {
  console.error(result.error.message);
}
```

## Chaining Results

### Map Transform

Transform the success value:

```typescript
const result = Success.create(5);

const doubled = result.map(value => value * 2);
// Success(10)

const failed = Failure.create(new Error('Failed'));
const stillFailed = failed.map(value => value * 2);
// Failure(Error('Failed'))
```

### FlatMap (Chain)

Chain operations that return Results:

```typescript
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Failure.create(new Error('Division by zero'));
  }
  return Success.create(a / b);
}

function sqrt(x: number): Result<number> {
  if (x < 0) {
    return Failure.create(new Error('Cannot sqrt negative'));
  }
  return Success.create(Math.sqrt(x));
}

// Chain operations
const result = divide(16, 4)  // Success(4)
  .flatMap(value => sqrt(value));  // Success(2)

const failedResult = divide(16, 0)  // Failure
  .flatMap(value => sqrt(value));  // Still Failure
```

### Match Pattern

Handle both cases with a single expression:

```typescript
const message = result.match({
  success: (value) => `Result: ${value}`,
  failure: (error) => `Error: ${error.message}`
});
```

## Error Types

Define domain-specific error types:

```typescript
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

export class NotFoundError extends DomainError {
  constructor(entityType: string, id: string) {
    super('NOT_FOUND', `${entityType} with id ${id} not found`);
  }
}

// Usage
function findProduct(id: string): Result<Product, DomainError> {
  const product = this.products.get(id);
  
  if (!product) {
    return Failure.create(new NotFoundError('Product', id));
  }

  return Success.create(product);
}
```

## HTTP Integration

Convert Results to HTTP responses:

```typescript
import { Request, Response } from 'express';

export class ProductController {
  async create(req: Request, res: Response): Promise<void> {
    const result = await this.commandBus.dispatch<Result<CreateProductOutput>>(
      new CreateProduct(req.body)
    );

    if (result.isSuccess) {
      res.status(201).json(result.value);
    } else {
      res.status(400).json({
        error: result.error.message
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const result = await this.queryBus.dispatch<Result<ProductDto>>(
      new GetProduct({ id: req.params.id })
    );

    if (result.isSuccess) {
      res.status(200).json(result.value);
    } else {
      // Map domain errors to HTTP status codes
      const statusCode = result.error instanceof NotFoundError ? 404 : 400;
      res.status(statusCode).json({
        error: result.error.message
      });
    }
  }
}
```

## Multiple Results

Handle multiple operations:

```typescript
async function createOrderWithItems(
  orderData: OrderData,
  items: ItemData[]
): Promise<Result<Order>> {
  // Create order
  const orderResult = await createOrder(orderData);
  if (orderResult.isFailure) {
    return orderResult;
  }

  const order = orderResult.value;

  // Add items
  for (const itemData of items) {
    const itemResult = order.addItem(itemData);
    if (itemResult.isFailure) {
      return Failure.create(itemResult.error);
    }
  }

  // Save
  const saveResult = await this.repository.save(order);
  if (saveResult.isFailure) {
    return saveResult;
  }

  return Success.create(order);
}
```

## Result Utilities

### Combine Results

```typescript
function combineResults<T>(results: Result<T>[]): Result<T[]> {
  const values: T[] = [];
  
  for (const result of results) {
    if (result.isFailure) {
      return Failure.create(result.error);
    }
    values.push(result.value);
  }
  
  return Success.create(values);
}

// Usage
const results = [
  Email.create('user1@example.com'),
  Email.create('user2@example.com'),
  Email.create('invalid'),  // Will fail
];

const combined = combineResults(results);
// Failure(Error('Invalid email format'))
```

### First Success

```typescript
function firstSuccess<T>(results: Result<T>[]): Result<T> {
  for (const result of results) {
    if (result.isSuccess) {
      return result;
    }
  }
  
  return Failure.create(new Error('All operations failed'));
}
```

## Testing with Results

```typescript
import { describe, it, expect } from 'vitest';

describe('Product.applyDiscount', () => {
  it('should apply valid discount', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 1000,
      stock: 10
    });

    const result = product.applyDiscount(10);  // 10% discount

    expect(result.isSuccess).toBe(true);
    expect(product.price).toBe(900);
  });

  it('should reject negative discount', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 1000,
      stock: 10
    });

    const result = product.applyDiscount(-10);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toBe('Discount must be between 0 and 100');
    expect(product.price).toBe(1000);  // Unchanged
  });

  it('should reject discount over 100', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 1000,
      stock: 10
    });

    const result = product.applyDiscount(150);

    expect(result.isFailure).toBe(true);
    expect(product.price).toBe(1000);  // Unchanged
  });
});
```

## Best Practices

### 1. Always Handle Results

```typescript
// Good: Handle both cases
const result = await operation();
if (result.isSuccess) {
  // Handle success
} else {
  // Handle failure
}

// Bad: Ignore failure case
const result = await operation();
console.log(result.value);  // Could be undefined!
```

### 2. Don't Mix Exceptions and Results

```typescript
// Good: Consistent Result usage
function operation(): Result<T> {
  if (invalid) {
    return Failure.create(new Error('Invalid'));
  }
  return Success.create(value);
}

// Bad: Mixing exceptions and Results
function operation(): Result<T> {
  if (invalid) {
    throw new Error('Invalid');  // Don't throw!
  }
  return Success.create(value);
}
```

### 3. Use Specific Error Types

```typescript
// Good: Specific errors
return Failure.create(new ValidationError('Email invalid'));
return Failure.create(new NotFoundError('User', userId));

// Bad: Generic errors
return Failure.create(new Error('Something wrong'));
```

### 4. Avoid Nested Checks

```typescript
// Good: Early returns
function process(data: Data): Result<Output> {
  const validated = validate(data);
  if (validated.isFailure) {
    return validated;
  }

  const processed = transform(validated.value);
  if (processed.isFailure) {
    return processed;
  }

  return Success.create(processed.value);
}

// Bad: Nested checks
function process(data: Data): Result<Output> {
  const validated = validate(data);
  if (validated.isSuccess) {
    const processed = transform(validated.value);
    if (processed.isSuccess) {
      return Success.create(processed.value);
    } else {
      return processed;
    }
  } else {
    return validated;
  }
}
```

## Async Results

Results work seamlessly with async/await:

```typescript
async function createUser(email: string): Promise<Result<User>> {
  // Validate email
  const emailResult = Email.create(email);
  if (emailResult.isFailure) {
    return Failure.create(emailResult.error);
  }

  // Check if exists
  const exists = await this.repository.findByEmail(emailResult.value);
  if (exists) {
    return Failure.create(new Error('Email already taken'));
  }

  // Create user
  const user = User.create({ email: emailResult.value });
  
  // Save
  await this.repository.save(user);

  return Success.create(user);
}
```

## Next Steps

- [CQRS](./cqrs.md) - See Result pattern in command and query handlers
- [Entities](./entities.md) - Use Results in domain logic
- [Value Objects](./value-objects.md) - Return Results from factory methods
