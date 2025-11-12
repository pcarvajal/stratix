# Testing

Learn how to test your Stratix applications with confidence.

## Testing Philosophy

Stratix promotes **testing at the right level**:

1. **Unit Tests**: Test domain logic in isolation
2. **Integration Tests**: Test use cases with real dependencies
3. **E2E Tests**: Test complete user workflows

## Setup

### Installation

```bash
pnpm add -D @stratix/testing vitest
```

### Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts'
      ]
    }
  }
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing Domain Entities

Domain entities should be tested in **complete isolation** - no infrastructure, no mocks.

### Entity Tests

```typescript
import { describe, it, expect } from 'vitest';
import { Product } from '../domain/entities/Product';

describe('Product', () => {
  it('should create a product', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    expect(product.name).toBe('Laptop');
    expect(product.price).toBe(999.99);
    expect(product.stock).toBe(10);
  });

  it('should decrease stock', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    product.decreaseStock(3);

    expect(product.stock).toBe(7);
  });

  it('should not decrease stock below zero', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999.99,
      stock: 5
    });

    expect(() => product.decreaseStock(10)).toThrow('Insufficient stock');
  });

  it('should emit domain event when stock decreased', () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    product.decreaseStock(3);

    const events = product.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ProductStockDecreasedEvent);
  });
});
```

## Testing Value Objects

Value objects should validate their invariants.

### Value Object Tests

```typescript
import { describe, it, expect } from 'vitest';
import { Email } from '../domain/value-objects/Email';

describe('Email', () => {
  it('should create valid email', () => {
    const result = Email.create('user@example.com');

    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('user@example.com');
  });

  it('should reject invalid email', () => {
    const result = Email.create('invalid-email');

    expect(result.isSuccess).toBe(false);
    expect(result.error.message).toContain('Invalid email');
  });

  it('should normalize email to lowercase', () => {
    const result = Email.create('USER@EXAMPLE.COM');

    expect(result.value.value).toBe('user@example.com');
  });

  it('should compare emails by value', () => {
    const email1 = Email.create('user@example.com').value;
    const email2 = Email.create('user@example.com').value;

    expect(email1.equals(email2)).toBe(true);
  });
});
```

## Testing Use Cases

Use cases should be tested with in-memory implementations for speed.

### Command Handler Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateProductHandler } from '../application/commands/CreateProduct';
import { InMemoryProductRepository } from '../infrastructure/persistence/InMemoryProductRepository';
import { InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let repository: InMemoryProductRepository;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    eventBus = new InMemoryEventBus();
    handler = new CreateProductHandler(repository, eventBus);
  });

  it('should create product', async () => {
    const command = new CreateProduct({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();

    const product = await repository.findById(
      EntityId.from<'Product'>(result.value.id)
    );
    expect(product).toBeDefined();
    expect(product?.name).toBe('Laptop');
  });

  it('should reject negative price', async () => {
    const command = new CreateProduct({
      name: 'Laptop',
      price: -100,
      stock: 10
    });

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.message).toBe('Price cannot be negative');
  });

  it('should publish domain events', async () => {
    const command = new CreateProduct({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    const publishedEvents: DomainEvent[] = [];
    eventBus.subscribe('*', (event) => {
      publishedEvents.push(event);
    });

    await handler.execute(command);

    expect(publishedEvents.length).toBeGreaterThan(0);
  });
});
```

### Query Handler Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GetProductHandler } from '../application/queries/GetProduct';
import { InMemoryProductRepository } from '../infrastructure/persistence/InMemoryProductRepository';

describe('GetProductHandler', () => {
  let handler: GetProductHandler;
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    handler = new GetProductHandler(repository);
  });

  it('should return product', async () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });
    await repository.save(product);

    const query = new GetProduct({ id: product.id.toString() });
    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Laptop');
  });

  it('should return error for non-existent product', async () => {
    const query = new GetProduct({ id: 'non-existent' });
    const result = await handler.execute(query);

    expect(result.isSuccess).toBe(false);
    expect(result.error.message).toBe('Product not found');
  });
});
```

## Testing with @stratix/testing

The `@stratix/testing` package provides powerful utilities.

### TestApplication

Create a test application with in-memory defaults:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestApplication } from '@stratix/testing';
import { CreateProductHandler } from '../application/commands/CreateProduct';

describe('Product Use Cases', () => {
  let testApp: TestApplication;

  beforeEach(async () => {
    testApp = TestApplication.create()
      .useInMemoryDefaults()
      .build();

    await testApp.start();

    // Register handlers
    const repository = new InMemoryProductRepository();
    testApp.container.register('productRepository', () => repository);
    testApp.container.register('createProductHandler', () =>
      new CreateProductHandler(repository, testApp.eventBus)
    );
  });

  afterEach(async () => {
    await testApp.stop();
  });

  it('should create and retrieve product', async () => {
    const handler = testApp.container.resolve<CreateProductHandler>('createProductHandler');

    const result = await handler.execute(
      new CreateProduct({
        name: 'Laptop',
        price: 999.99,
        stock: 10
      })
    );

    expect(result.isSuccess).toBe(true);
  });
});
```

### EntityBuilder

Build test entities with fluent API:

```typescript
import { EntityBuilder } from '@stratix/testing';

describe('Order', () => {
  it('should calculate total', () => {
    const order = EntityBuilder.for(Order)
      .with('customerId', 'customer-123')
      .with('items', [
        { productId: 'product-1', quantity: 2, price: 10.00 },
        { productId: 'product-2', quantity: 1, price: 5.00 }
      ])
      .build();

    expect(order.total).toBe(25.00);
  });
});
```

### DataFactory

Generate test data easily:

```typescript
import { DataFactory } from '@stratix/testing';

describe('User Registration', () => {
  it('should register user', async () => {
    const email = DataFactory.email('test');
    const name = DataFactory.string('name', 10);

    const result = await registerUser({ email, name });

    expect(result.isSuccess).toBe(true);
  });
});
```

### Assertions

Use helper assertions for Result types:

```typescript
import { assertSuccess, assertFailure, unwrapSuccess } from '@stratix/testing';

describe('CreateProduct', () => {
  it('should create product', async () => {
    const result = await handler.execute(command);

    assertSuccess(result);
    expect(result.value.id).toBeDefined();
  });

  it('should fail for invalid input', async () => {
    const result = await handler.execute(invalidCommand);

    assertFailure(result);
    expect(result.error.message).toContain('Invalid');
  });

  it('should unwrap success value', async () => {
    const result = await handler.execute(command);
    const value = unwrapSuccess(result);

    expect(value.id).toBeDefined();
  });
});
```

## Integration Tests

Test with real database and message queue.

### Database Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApplicationBuilder } from '@stratix/runtime';
import { PostgresPlugin } from '@stratix/ext-postgres';

describe('Product Repository Integration', () => {
  let app: Application;
  let repository: ProductRepository;

  beforeAll(async () => {
    app = await ApplicationBuilder.create()
      .usePlugin(new PostgresPlugin(), {
        connectionString: process.env.TEST_DATABASE_URL
      })
      .build();

    await app.start();

    repository = new PostgresProductRepository(/* ... */);
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should save and retrieve product', async () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    await repository.save(product);

    const retrieved = await repository.findById(product.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Laptop');
  });
});
```

### Event Bus Integration Tests

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ApplicationBuilder } from '@stratix/runtime';
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';

describe('Event Publishing Integration', () => {
  let app: Application;
  let eventBus: EventBus;

  beforeAll(async () => {
    app = await ApplicationBuilder.create()
      .usePlugin(new RabbitMQPlugin(), {
        url: process.env.TEST_RABBITMQ_URL
      })
      .build();

    await app.start();
    eventBus = app.container.resolve<EventBus>('eventBus');
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should publish and receive events', async () => {
    const receivedEvents: DomainEvent[] = [];

    eventBus.subscribe('ProductCreated', (event) => {
      receivedEvents.push(event);
    });

    const event = new ProductCreatedEvent(
      EntityId.create<'Product'>(),
      'Laptop'
    );

    await eventBus.publish([event]);

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0]).toBeInstanceOf(ProductCreatedEvent);
  });
});
```

## Test Organization

### Recommended Structure

```
tests/
├── unit/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Product.spec.ts
│   │   └── value-objects/
│   │       └── Email.spec.ts
│   └── application/
│       ├── commands/
│       │   └── CreateProduct.spec.ts
│       └── queries/
│           └── GetProduct.spec.ts
├── integration/
│   ├── persistence/
│   │   └── ProductRepository.spec.ts
│   └── messaging/
│       └── EventBus.spec.ts
└── e2e/
    └── ProductWorkflow.spec.ts
```

## Mocking Best Practices

### Mock External Services

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('PaymentService', () => {
  it('should process payment', async () => {
    const paymentGateway = {
      charge: vi.fn().mockResolvedValue({ success: true, transactionId: '123' })
    };

    const service = new PaymentService(paymentGateway);
    const result = await service.processPayment(100);

    expect(result.isSuccess).toBe(true);
    expect(paymentGateway.charge).toHaveBeenCalledWith(100);
  });
});
```

### Don't Mock Domain Logic

```typescript
// Good: Test real domain logic
it('should validate order', () => {
  const order = Order.create('customer-123');
  expect(() => order.placeOrder()).toThrow('Cannot place empty order');
});

// Bad: Mock domain logic
it('should validate order', () => {
  const order = {
    placeOrder: vi.fn().mockImplementation(() => {
      throw new Error('Cannot place empty order');
    })
  };
  expect(() => order.placeOrder()).toThrow('Cannot place empty order');
});
```

## Coverage Goals

- **Domain Layer**: 100% coverage (pure logic, easy to test)
- **Application Layer**: 90%+ coverage (use cases)
- **Infrastructure Layer**: 70%+ coverage (integration tests)

## Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test Product.spec.ts

# Run tests matching pattern
pnpm test --grep="Order"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how
2. **Keep Tests Fast**: Use in-memory implementations for unit tests
3. **Isolate Tests**: Each test should be independent
4. **Use Descriptive Names**: Test names should describe the scenario
5. **Arrange-Act-Assert**: Follow the AAA pattern consistently
6. **Test Edge Cases**: Don't just test the happy path

## Next Steps

Continue exploring Stratix:
- Review Core Concepts for deeper understanding
- Build your first application
- Contribute to the framework
