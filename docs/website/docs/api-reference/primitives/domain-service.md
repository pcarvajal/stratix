# DomainService

Base class for Domain Services in Domain-Driven Design.

## Overview

`DomainService` encapsulates domain logic that doesn't naturally fit within an Entity or Value Object. Domain Services represent significant processes or transformations in the domain and operate on multiple aggregates.

Unlike Application Services, Domain Services contain pure domain logic with no dependencies on infrastructure concerns.

## Class Definition

```typescript
abstract class DomainService {
  abstract readonly name: string;
}
```

## When to Use Domain Services

Use a Domain Service when:

- Logic doesn't naturally fit within an Entity or Value Object
- The operation requires multiple aggregates
- The behavior is a significant process in the domain
- The logic is stateless and doesn't maintain state between calls

## Properties

### name

```typescript
abstract readonly name: string
```

Unique name identifying this domain service.

## Usage Examples

### Money Transfer Service

```typescript
import { DomainService } from '@stratix/primitives';

class MoneyTransferService extends DomainService {
  readonly name = 'MoneyTransferService';

  transfer(
    from: BankAccount,
    to: BankAccount,
    amount: Money
  ): Result<void, DomainError> {
    // Validate transfer
    if (!from.canWithdraw(amount)) {
      return Result.fail(
        new DomainError('INSUFFICIENT_FUNDS', 'Account has insufficient funds')
      );
    }

    if (!from.currency.equals(amount.currency)) {
      return Result.fail(
        new DomainError('CURRENCY_MISMATCH', 'Currency mismatch')
      );
    }

    // Perform transfer
    from.withdraw(amount);
    to.deposit(amount);

    // Record domain events
    from.record(new MoneyWithdrawnEvent(from.id, amount));
    to.record(new MoneyDepositedEvent(to.id, amount));

    return Result.ok(undefined);
  }
}
```

### Order Pricing Service

```typescript
class OrderPricingService extends DomainService {
  readonly name = 'OrderPricingService';

  calculateTotal(order: Order, customer: Customer): Money {
    let total = order.subtotal;

    // Apply customer discount
    if (customer.isPremium()) {
      total = total.multiply(0.9); // 10% discount
    }

    // Add shipping
    const shipping = this.calculateShipping(order, customer);
    total = total.add(shipping);

    // Add taxes
    const tax = this.calculateTax(total, customer.address);
    total = total.add(tax);

    return total;
  }

  private calculateShipping(order: Order, customer: Customer): Money {
    if (customer.hasFreeShipping()) {
      return Money.zero(order.currency);
    }
    
    return Money.create(15.00, order.currency);
  }

  private calculateTax(amount: Money, address: Address): Money {
    const taxRate = this.getTaxRateForRegion(address.country);
    return amount.multiply(taxRate);
  }

  private getTaxRateForRegion(country: string): number {
    // Tax rate logic
    return 0.10; // 10%
  }
}
```

### Product Matching Service

```typescript
class ProductMatchingService extends DomainService {
  readonly name = 'ProductMatchingService';

  findSimilarProducts(product: Product, catalog: Product[]): Product[] {
    return catalog
      .filter(p => p.id !== product.id)
      .filter(p => this.hasMatchingCategory(p, product))
      .filter(p => this.hasSimilarPrice(p, product))
      .sort((a, b) => this.calculateSimilarity(b, product) - this.calculateSimilarity(a, product))
      .slice(0, 5);
  }

  private hasMatchingCategory(p1: Product, p2: Product): boolean {
    return p1.category.equals(p2.category);
  }

  private hasSimilarPrice(p1: Product, p2: Product): boolean {
    const priceDiff = Math.abs(p1.price.value - p2.price.value);
    return priceDiff < 50;
  }

  private calculateSimilarity(p1: Product, p2: Product): number {
    // Similarity algorithm
    return 0.85;
  }
}
```

### Inventory Allocation Service

```typescript
class InventoryAllocationService extends DomainService {
  readonly name = 'InventoryAllocationService';

  allocate(
    order: Order,
    warehouses: Warehouse[]
  ): Result<AllocationPlan, DomainError> {
    const plan = new AllocationPlan();

    for (const item of order.items) {
      const allocation = this.findBestWarehouse(item, warehouses);
      
      if (!allocation) {
        return Result.fail(
          new DomainError(
            'INSUFFICIENT_INVENTORY',
            `Cannot fulfill item ${item.productId}`
          )
        );
      }

      plan.add(allocation);
    }

    return Result.ok(plan);
  }

  private findBestWarehouse(
    item: OrderItem,
    warehouses: Warehouse[]
  ): Allocation | null {
    // Find warehouse with stock, prefer closest to customer
    const eligible = warehouses.filter(w => w.hasStock(item.productId, item.quantity));
    
    if (eligible.length === 0) {
      return null;
    }

    // Sort by distance or other criteria
    const best = eligible[0];
    
    return new Allocation(best.id, item.productId, item.quantity);
  }
}
```

## Type Utilities

### DomainServiceMethod

Type helper for domain service method signatures:

```typescript
type DomainServiceMethod<TArgs extends unknown[], TReturn> = (...args: TArgs) => TReturn;

// Usage
type TransferMethod = DomainServiceMethod<
  [BankAccount, BankAccount, Money],
  Result<void, DomainError>
>;
```

### AsyncDomainServiceMethod

Type helper for async domain service methods:

```typescript
type AsyncDomainServiceMethod<TArgs extends unknown[], TReturn> = 
  (...args: TArgs) => Promise<TReturn>;

// Usage
type ValidateTransferMethod = AsyncDomainServiceMethod<
  [BankAccount, Money],
  Result<boolean, DomainError>
>;
```

## Domain Service vs Application Service

### Domain Service

- Contains **pure domain logic**
- Operates on **domain objects** (Entities, Value Objects)
- **No infrastructure dependencies** (no database, no HTTP)
- Returns **domain objects** or **Results**
- Lives in the **domain layer**

```typescript
class PricingService extends DomainService {
  // Pure domain logic
  calculateDiscount(order: Order, customer: Customer): Money {
    // ...
  }
}
```

### Application Service

- **Orchestrates** domain logic
- Uses **repositories** and **infrastructure**
- **Coordinates** multiple aggregates
- Returns **DTOs** or **command results**
- Lives in the **application layer**

```typescript
class OrderApplicationService {
  // Orchestration
  async createOrder(dto: CreateOrderDto): Promise<Result<OrderDto>> {
    const customer = await this.customerRepo.findById(dto.customerId);
    const order = Order.create(/* ... */);
    
    // Use domain service
    const total = this.pricingService.calculateTotal(order, customer);
    
    await this.orderRepo.save(order);
    return Result.ok(OrderDto.from(order));
  }
}
```

## Best Practices

### 1. Keep Domain Services Stateless

```typescript
// Good
class PricingService extends DomainService {
  readonly name = 'PricingService';

  calculateTotal(order: Order): Money {
    // Stateless calculation
    return order.items.reduce(/*...*/);
  }
}

// Avoid
class PricingService extends DomainService {
  private lastCalculation: Money; // Don't maintain state

  calculateTotal(order: Order): Money {
    this.lastCalculation = /*...*/;  // State mutation
    return this.lastCalculation;
  }
}
```

### 2. Use Result Pattern for Errors

```typescript
transfer(from: Account, to: Account, amount: Money): Result<void, DomainError> {
  if (!from.canWithdraw(amount)) {
    return Result.fail(new DomainError('INSUFFICIENT_FUNDS', 'Not enough money'));
  }
  
  // ...
  return Result.ok(undefined);
}
```

### 3. Name Services After Domain Concepts

```typescript
// Good
class MoneyTransferService extends DomainService {}
class OrderPricingService extends DomainService {}
class InventoryAllocationService extends DomainService {}

// Avoid generic names
class BusinessLogicService extends DomainService {} // Too generic
class HelperService extends DomainService {} // Not domain-focused
```

### 4. Keep Services Focused

Each service should have a single responsibility:

```typescript
// Good - Focused
class ShippingCostCalculator extends DomainService {
  calculate(order: Order, address: Address): Money {
    // Only shipping cost logic
  }
}

// Avoid - Too many responsibilities
class OrderService extends DomainService {
  calculateShipping() {}
  calculateTax() {}
  applyDiscount() {}
  validatePayment() {}
  // Too much!
}
```

### 5. Inject Dependencies via Constructor

```typescript
class OrderPricingService extends DomainService {
  readonly name = 'OrderPricingService';

  constructor(
    private readonly taxCalculator: TaxCalculator,
    private readonly shippingCalculator: ShippingCalculator
  ) {
    super();
  }

  calculateTotal(order: Order, customer: Customer): Money {
    let total = order.subtotal;
    total = total.add(this.shippingCalculator.calculate(order));
    total = total.add(this.taxCalculator.calculate(total, customer.address));
    return total;
  }
}
```

## Common Patterns

### Validation Service

```typescript
class OrderValidationService extends DomainService {
  readonly name = 'OrderValidationService';

  validate(order: Order): Result<void, DomainError> {
    if (order.items.length === 0) {
      return Result.fail(new DomainError('EMPTY_ORDER', 'Order has no items'));
    }

    if (order.total.isNegative()) {
      return Result.fail(new DomainError('NEGATIVE_TOTAL', 'Total cannot be negative'));
    }

    return Result.ok(undefined);
  }
}
```

### Calculation Service

```typescript
class InterestCalculationService extends DomainService {
  readonly name = 'InterestCalculationService';

  calculateInterest(principal: Money, rate: Percentage, months: number): Money {
    const rateDecimal = rate.toDecimal();
    const interest = principal.multiply(rateDecimal * months / 12);
    return interest;
  }
}
```

### Matching Service

```typescript
class LoanEligibilityService extends DomainService {
  readonly name = 'LoanEligibilityService';

  isEligible(customer: Customer, amount: Money): boolean {
    return customer.creditScore >= 650
      && customer.income.greaterThan(amount.multiply(0.3))
      && !customer.hasDefaultedLoans();
  }
}
```

## Testing

Domain Services are easy to test because they're stateless and have no infrastructure dependencies:

```typescript
describe('MoneyTransferService', () => {
  let service: MoneyTransferService;

  beforeEach(() => {
    service = new MoneyTransferService();
  });

  it('should transfer money between accounts', () => {
    const from = BankAccount.create({ balance: Money.create(100, 'USD') });
    const to = BankAccount.create({ balance: Money.create(50, 'USD') });
    const amount = Money.create(30, 'USD');

    const result = service.transfer(from, to, amount);

    expect(result.isSuccess).toBe(true);
    expect(from.balance.value).toBe(70);
    expect(to.balance.value).toBe(80);
  });

  it('should fail when insufficient funds', () => {
    const from = BankAccount.create({ balance: Money.create(10, 'USD') });
    const to = BankAccount.create({ balance: Money.create(0, 'USD') });
    const amount = Money.create(20, 'USD');

    const result = service.transfer(from, to, amount);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INSUFFICIENT_FUNDS');
  });
});
```

## See Also

- [Entity](./entity.md)
- [Value Object](./value-object.md)
- [DomainError](./domain-error.md)
- [Result Pattern](./result.md)
- [Specification Pattern](./specification.md)
