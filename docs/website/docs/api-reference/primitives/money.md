---
id: money
title: Money
sidebar_label: Money
---

# Money

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Immutable value object representing monetary amounts with specific currencies. Money enforces currency consistency in operations and provides formatting, arithmetic, and comparison capabilities following DDD patterns.

**Key Features:**
- Immutable monetary operations
- Currency validation and enforcement
- Multi-currency support (15+ currencies)
- Locale-aware formatting
- Result pattern for error handling
- Zero runtime overhead

## Import

```typescript
import { Money, Currency } from '@stratix/primitives';
```

## Type Signature

```typescript
class Money extends ValueObject {
  readonly amount: number;
  readonly currency: Currency;

  static create(amount: number, currency: Currency): Result<Money, DomainError>;
  static USD(amount: number): Money;
  static EUR(amount: number): Money;
  static CLP(amount: number): Money;
  // ... other currencies

  add(other: Money): Result<Money, DomainError>;
  subtract(other: Money): Result<Money, DomainError>;
  multiply(factor: number): Money;
  divide(divisor: number): Result<Money, DomainError>;
  
  isGreaterThan(other: Money): boolean;
  isLessThan(other: Money): boolean;
  format(locale?: string): string;
}
```

## Usage Examples

### Basic Usage

```typescript
const price = Money.USD(99.99);
const quantity = 3;
const total = price.multiply(quantity);

console.log(total.format()); // "$299.97"

const discount = Money.USD(10);
const result = total.subtract(discount);
if (result.isSuccess) {
  console.log(result.value.format()); // "$289.97"
}
```

### Currency Operations

```typescript
const usd = Money.USD(100);
const eur = Money.EUR(100);

// Same currency operations succeed
const sum = usd.add(Money.USD(50));
console.log(sum.value.amount); // 150

// Different currency operations fail
const mixed = usd.add(eur);
console.log(mixed.isFailure); // true
console.log(mixed.error.code); // 'CURRENCY_MISMATCH'
```

### Validation

```typescript
const result = Money.create(-100, Currency.USD);
console.log(result.isFailure); // true
console.log(result.error.code); // 'NEGATIVE_AMOUNT'
```

## Best Practices

- **Do:** Use factory methods (USD, EUR) for clarity
- **Do:** Handle Result types from arithmetic operations
- **Do:** Use format() for display, not calculations
- **Don't:** Mix currencies in operations
- **Don't:** Use floating-point arithmetic directly

## Related Components

- [Currency](./currency.md) - Currency value object
- [ValueObject](./value-object.md) - Base class

## See Also

- [Package README](../../../packages/primitives/README.md)
