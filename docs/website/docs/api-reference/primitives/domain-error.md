# DomainError

Base error class for domain-related errors in Domain-Driven Design.

## Overview

`DomainError` represents violations of business rules or domain invariants. Unlike technical errors (like network failures), domain errors are expected and should be handled gracefully as part of normal business flow.

## Class Definition

```typescript
class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string
  );

  toJSON(): { code: string; message: string; name: string };
}
```

## Constructor

```typescript
constructor(code: string, message: string)
```

**Parameters:**
- `code` - Unique error code for programmatic handling
- `message` - Human-readable error message

## Properties

### code

```typescript
readonly code: string
```

Unique error code identifier for programmatic error handling.

### message

```typescript
readonly message: string
```

Human-readable error message (inherited from Error).

### name

```typescript
readonly name: string
```

Error name, always `'DomainError'`.

## Methods

### toJSON()

```typescript
toJSON(): { code: string; message: string; name: string }
```

Returns a JSON representation of the error.

**Returns:** Object with `code`, `message`, and `name` properties

**Example:**
```typescript
const error = new DomainError('INVALID_EMAIL', 'Email format is invalid');
console.log(error.toJSON());
// { code: 'INVALID_EMAIL', message: 'Email format is invalid', name: 'DomainError' }
```

## Usage Examples

### Basic Usage

```typescript
import { DomainError } from '@stratix/primitives';

throw new DomainError('INVALID_EMAIL', 'Email format is invalid');
```

### With Result Pattern

```typescript
import { Result, DomainError } from '@stratix/primitives';

class Email {
  static create(value: string): Result<Email, DomainError> {
    if (!value.includes('@')) {
      return Result.fail(
        new DomainError('INVALID_EMAIL_FORMAT', 'Email must contain @')
      );
    }
    
    return Result.ok(new Email(value));
  }
}
```

### Custom Domain Errors

```typescript
class InsufficientFundsError extends DomainError {
  constructor(required: number, available: number) {
    super(
      'INSUFFICIENT_FUNDS',
      `Required ${required}, but only ${available} available`
    );
  }
}

class OrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super('ORDER_NOT_FOUND', `Order ${orderId} not found`);
  }
}
```

### In Domain Logic

```typescript
class BankAccount {
  withdraw(amount: Money): Result<void, DomainError> {
    if (amount.greaterThan(this.balance)) {
      return Result.fail(
        new DomainError('INSUFFICIENT_FUNDS', 'Account balance too low')
      );
    }

    this.balance = this.balance.subtract(amount);
    return Result.ok(undefined);
  }
}
```

## Error Handling

### Catching Domain Errors

```typescript
try {
  const email = Email.create('invalid-email');
  if (email.isFailure) {
    throw email.error;
  }
} catch (error) {
  if (error instanceof DomainError) {
    console.log(`Domain error: ${error.code} - ${error.message}`);
  }
}
```

### Error Codes for Logic

```typescript
const result = account.withdraw(amount);

if (result.isFailure) {
  switch (result.error.code) {
    case 'INSUFFICIENT_FUNDS':
      // Handle insufficient funds
      break;
    case 'ACCOUNT_FROZEN':
      // Handle frozen account
      break;
    default:
      // Handle unknown error
  }
}
```

## Common Error Codes

Recommended error code conventions:

- `INVALID_*` - Validation errors (e.g., `INVALID_EMAIL`, `INVALID_AMOUNT`)
- `*_NOT_FOUND` - Entity not found (e.g., `ORDER_NOT_FOUND`)
- `*_ALREADY_EXISTS` - Duplicate entity (e.g., `EMAIL_ALREADY_EXISTS`)
- `INSUFFICIENT_*` - Resource shortage (e.g., `INSUFFICIENT_FUNDS`)
- `UNAUTHORIZED_*` - Permission errors (e.g., `UNAUTHORIZED_ACTION`)

## Best Practices

### 1. Use Specific Error Codes

```typescript
// Good
new DomainError('INVALID_EMAIL_FORMAT', 'Email must contain @')
new DomainError('INVALID_PHONE_NUMBER', 'Phone number must start with +')

// Avoid
new DomainError('VALIDATION_ERROR', 'Something is invalid')
```

### 2. Provide Clear Messages

```typescript
// Good
new DomainError('INSUFFICIENT_FUNDS', 'Account balance ($50) is less than withdrawal amount ($100)')

// Avoid
new DomainError('ERROR', 'Failed')
```

### 3. Use with Result Pattern

```typescript
// Good
static create(value: string): Result<Email, DomainError> {
  if (!this.isValid(value)) {
    return Result.fail(new DomainError('INVALID_EMAIL', 'Invalid email format'));
  }
  return Result.ok(new Email(value));
}

// Avoid throwing
static create(value: string): Email {
  if (!this.isValid(value)) {
    throw new DomainError('INVALID_EMAIL', 'Invalid email format');
  }
  return new Email(value);
}
```

### 4. Create Custom Error Classes

```typescript
class PaymentDeclinedError extends DomainError {
  constructor(reason: string) {
    super('PAYMENT_DECLINED', `Payment declined: ${reason}`);
  }
}

class StockUnavailableError extends DomainError {
  constructor(productId: string, requested: number, available: number) {
    super(
      'STOCK_UNAVAILABLE',
      `Product ${productId}: requested ${requested}, available ${available}`
    );
  }
}
```

## Domain Error vs Technical Error

### Domain Error

Expected business rule violations:

```typescript
// Expected - handle gracefully
if (amount.isNegative()) {
  return Result.fail(new DomainError('NEGATIVE_AMOUNT', 'Amount cannot be negative'));
}
```

### Technical Error

Unexpected infrastructure failures:

```typescript
// Unexpected - log and propagate
try {
  await database.save(entity);
} catch (error) {
  logger.error('Database error', error);
  throw error; // Let it bubble up
}
```

## Integration with Result Pattern

Domain errors work seamlessly with the Result pattern:

```typescript
class Order {
  addItem(item: OrderItem): Result<void, DomainError> {
    if (this.items.length >= 100) {
      return Result.fail(
        new DomainError('MAX_ITEMS_EXCEEDED', 'Order cannot have more than 100 items')
      );
    }

    this.items.push(item);
    return Result.ok(undefined);
  }
}

// Usage
const result = order.addItem(item);
if (result.isFailure) {
  console.error(result.error.code); // 'MAX_ITEMS_EXCEEDED'
  console.error(result.error.message); // 'Order cannot have more than 100 items'
}
```

## Testing

```typescript
describe('BankAccount', () => {
  it('should return error when insufficient funds', () => {
    const account = new BankAccount(Money.create(50, 'USD'));
    const result = account.withdraw(Money.create(100, 'USD'));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DomainError);
    expect(result.error.code).toBe('INSUFFICIENT_FUNDS');
  });
});
```

## See Also

- [Result Pattern](./result.md)
- [Value Object](./value-object.md)
- [Entity](./entity.md)
- [DomainService](./domain-service.md)
