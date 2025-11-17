# Specification

Specification Pattern for encapsulating business rules and validation logic.

## Overview

The Specification Pattern allows you to compose complex business rules using logical operators (AND, OR, NOT) while keeping each rule independently testable and reusable.

## Class Definition

```typescript
abstract class Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;
  
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
  check(candidate: T): SpecificationResult;
}

interface SpecificationResult {
  readonly satisfied: boolean;
  readonly reason?: string;
}
```

## Methods

### isSatisfiedBy()

```typescript
abstract isSatisfiedBy(candidate: T): boolean
```

Checks if the candidate satisfies this specification.

### and()

```typescript
and(other: Specification<T>): Specification<T>
```

Creates AND specification (both must be satisfied).

### or()

```typescript
or(other: Specification<T>): Specification<T>
```

Creates OR specification (either must be satisfied).

### not()

```typescript
not(): Specification<T>
```

Creates NOT specification (must not be satisfied).

### check()

```typescript
check(candidate: T): SpecificationResult
```

Checks specification and returns detailed result with optional reason.

## Usage Examples

### Basic Specification

```typescript
import { Specification } from '@stratix/primitives';

class CustomerIsActiveSpec extends Specification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return customer.status === 'active';
  }
}

const spec = new CustomerIsActiveSpec();
if (spec.isSatisfiedBy(customer)) {
  // Customer is active
}
```

### Composing Specifications

```typescript
class CustomerHasMinimumBalanceSpec extends Specification<Customer> {
  constructor(private minBalance: number) {
    super();
  }

  isSatisfiedBy(customer: Customer): boolean {
    return customer.balance >= this.minBalance;
  }
}

// Compose with AND
const eligibleForLoan = new CustomerIsActiveSpec()
  .and(new CustomerHasMinimumBalanceSpec(1000));

if (eligibleForLoan.isSatisfiedBy(customer)) {
  // Process loan application
}
```

### Complex Business Rules

```typescript
const premiumCustomer = new CustomerIsActiveSpec()
  .and(new CustomerHasMinimumBalanceSpec(5000))
  .and(new CustomerHasNoDebtsSpec());

const eligibleForDiscount = premiumCustomer
  .or(new CustomerHasLoyaltyCardSpec());

if (eligibleForDiscount.isSatisfiedBy(customer)) {
  // Apply discount
}
```

### Using NOT

```typescript
const notSuspended = new CustomerIsSuspendedSpec().not();

const canPlaceOrder = new CustomerIsActiveSpec()
  .and(notSuspended)
  .and(new CustomerHasCreditLimitSpec(order.total));
```

## Helper Functions

### fromPredicate()

Create specification from a function:

```typescript
import { fromPredicate } from '@stratix/primitives';

const isAdult = fromPredicate<Person>(
  p => p.age >= 18,
  'Must be 18 or older'
);

const isEligible = isAdult.and(
  fromPredicate(p => p.hasValidId, 'Must have valid ID')
);
```

## Practical Examples

### Order Validation

```typescript
class OrderHasItemsSpec extends Specification<Order> {
  isSatisfiedBy(order: Order): boolean {
    return order.items.length > 0;
  }
}

class OrderTotalIsValidSpec extends Specification<Order> {
  isSatisfiedBy(order: Order): boolean {
    return order.total.value > 0;
  }
}

class OrderCustomerHasCreditSpec extends Specification<Order> {
  isSatisfiedBy(order: Order): boolean {
    return order.customer.creditLimit.greaterThan(order.total);
  }
}

// Compose
const validOrder = new OrderHasItemsSpec()
  .and(new OrderTotalIsValidSpec())
  .and(new OrderCustomerHasCreditSpec());

const result = validOrder.check(order);
if (!result.satisfied) {
  console.error(result.reason);
}
```

### Product Filtering

```typescript
class ProductInStockSpec extends Specification<Product> {
  isSatisfiedBy(product: Product): boolean {
    return product.stock > 0;
  }
}

class ProductPriceRangeSpec extends Specification<Product> {
  constructor(
    private min: number,
    private max: number
  ) {
    super();
  }

  isSatisfiedBy(product: Product): boolean {
    return product.price.value >= this.min 
      && product.price.value <= this.max;
  }
}

// Filter products
const affordableAndAvailable = new ProductInStockSpec()
  .and(new ProductPriceRangeSpec(0, 100));

const filtered = products.filter(p => affordableAndAvailable.isSatisfiedBy(p));
```

## Best Practices

### 1. Single Responsibility

Each specification should check one thing:

```typescript
// Good
class IsAdultSpec extends Specification<Person> {
  isSatisfiedBy(person: Person): boolean {
    return person.age >= 18;
  }
}

// Avoid
class IsEligibleSpec extends Specification<Person> {
  isSatisfiedBy(person: Person): boolean {
    return person.age >= 18 
      && person.hasValidId 
      && person.creditScore > 600; // Too much
  }
}
```

### 2. Use Composition

```typescript
const eligible = new IsAdultSpec()
  .and(new HasValidIdSpec())
  .and(new HasGoodCreditSpec());
```

### 3. Provide Helpful Reasons

```typescript
class MinimumBalanceSpec extends Specification<Account> {
  constructor(private minimum: number) {
    super();
  }

  check(account: Account): SpecificationResult {
    const satisfied = account.balance >= this.minimum;
    return {
      satisfied,
      reason: satisfied 
        ? undefined 
        : `Balance ${account.balance} is below minimum ${this.minimum}`,
    };
  }
}
```

## See Also

- [DomainService](./domain-service.md)
- [Entity](./entity.md)
- [Value Object](./value-object.md)
