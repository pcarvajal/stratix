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

## Testing AI Agents

Stratix provides comprehensive testing utilities for AI agents through the `@stratix/testing` package.

### AgentTester

The `AgentTester` class provides a high-level API for testing AI agents with mock responses:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AgentTester, expectSuccess, expectData } from '@stratix/testing';
import { CustomerSupportAgent } from '../agents/CustomerSupportAgent';

describe('CustomerSupportAgent', () => {
  let tester: AgentTester;
  let agent: CustomerSupportAgent;

  beforeEach(() => {
    tester = new AgentTester({ timeout: 5000 });
    agent = new CustomerSupportAgent({ provider: tester.getMockProvider() });
  });

  it('should respond to greetings', async () => {
    tester.setMockResponse({
      content: 'Hello! How can I help you today?',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    const result = await tester.test(agent, { message: 'Hi' });

    expect(result.passed).toBe(true);
    expectSuccess(result.result);
    expect(result.duration).toBeLessThan(1000);
  });

  it('should handle multi-turn conversations', async () => {
    tester.setMockResponses([
      { content: 'Hello! How can I help?', usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 } },
      { content: 'Sure, I can help with that.', usage: { promptTokens: 20, completionTokens: 18, totalTokens: 38 } }
    ]);

    const result1 = await tester.test(agent, { message: 'Hi' });
    const result2 = await tester.test(agent, { message: 'I need help' });

    expect(result1.passed).toBe(true);
    expect(result2.passed).toBe(true);
    tester.assertCallCount(2);
  });

  it('should track costs correctly', async () => {
    tester.setMockResponse({
      content: 'Response',
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    });

    const result = await tester.test(agent, { message: 'Test' });

    expect(result.result.usage?.totalTokens).toBe(150);
  });

  it('should handle errors gracefully', async () => {
    tester.setMockResponse({
      content: '',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      error: new Error('API rate limit exceeded')
    });

    const result = await tester.test(agent, { message: 'Test' });

    expect(result.passed).toBe(false);
    tester.assertFailure(result);
  });
});
```

### Agent Assertions

The `@stratix/testing` package provides specialized assertions for agent results:

```typescript
import {
  expectSuccess,
  expectFailure,
  expectData,
  expectDataContains,
  expectCostWithinBudget,
  expectDurationWithinLimit,
  expectErrorContains,
  expectModel
} from '@stratix/testing';

describe('Agent Assertions', () => {
  it('should validate success', async () => {
    const result = await agent.execute(input);
    expectSuccess(result);  // Throws if result is failure
  });

  it('should validate failure', async () => {
    const result = await agent.execute(invalidInput);
    expectFailure(result);  // Throws if result is success
  });

  it('should validate data', async () => {
    const result = await agent.execute(input);
    expectData(result, { status: 'completed', score: 0.95 });
  });

  it('should validate partial data', async () => {
    const result = await agent.execute(input);
    expectDataContains(result, { status: 'completed' });
  });

  it('should validate cost', async () => {
    const result = await agent.execute(input);
    expectCostWithinBudget(result, 0.05);  // Max $0.05
  });

  it('should validate duration', async () => {
    const result = await agent.execute(input);
    expectDurationWithinLimit(result, 2000);  // Max 2 seconds
  });

  it('should validate error messages', async () => {
    const result = await agent.execute(invalidInput);
    expectErrorContains(result, 'Invalid input format');
  });

  it('should validate model used', async () => {
    const result = await agent.execute(input);
    expectModel(result, 'gpt-4o');
  });
});
```

### MockLLMProvider

For more control, use `MockLLMProvider` directly:

```typescript
import { MockLLMProvider } from '@stratix/testing';

describe('Advanced Mocking', () => {
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
  });

  it('should set single response', async () => {
    mockProvider.setResponse({
      content: '{"result": "success"}',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    const agent = new MyAgent({ provider: mockProvider });
    const result = await agent.execute(input);

    expect(result.isSuccess).toBe(true);
  });

  it('should set multiple responses', async () => {
    mockProvider.setResponses([
      { content: 'First response', usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 } },
      { content: 'Second response', usage: { promptTokens: 20, completionTokens: 18, totalTokens: 38 } }
    ]);

    const result1 = await agent.execute(input1);
    const result2 = await agent.execute(input2);

    expect(result1.value).toContain('First');
    expect(result2.value).toContain('Second');
  });

  it('should inspect call history', async () => {
    mockProvider.setResponse({
      content: 'Response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    await agent.execute({ message: 'Test' });

    const history = mockProvider.getCallHistory();
    expect(history.length).toBe(1);
    expect(history[0].model).toBe('gpt-4o');
    expect(history[0].messages[0].content).toBe('Test');
  });

  it('should get last call', async () => {
    mockProvider.setResponse({
      content: 'Response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    await agent.execute({ message: 'Test' });

    const lastCall = mockProvider.getLastCall();
    expect(lastCall?.temperature).toBe(0.7);
  });

  it('should reset state', async () => {
    mockProvider.setResponse({
      content: 'Response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    await agent.execute(input);
    mockProvider.reset();

    expect(mockProvider.getCallCount()).toBe(0);
  });
});
```

### Test Helpers

Utility functions for creating test data and contexts:

```typescript
import {
  createTestContext,
  createTestAgentId,
  createDeterministicAgentId,
  wait,
  createTimeout,
  measureTime,
  repeatTest,
  runInParallel,
  expectToReject
} from '@stratix/testing';

describe('Test Helpers', () => {
  it('should create test context', () => {
    const context = createTestContext({
      userId: 'user-123',
      sessionId: 'session-456',
      budget: 1.0
    });

    expect(context.getUserId()).toBe('user-123');
    expect(context.getSessionId()).toBe('session-456');
  });

  it('should create test agent ID', () => {
    const id1 = createTestAgentId();
    const id2 = createTestAgentId();

    expect(id1).not.toBe(id2);
  });

  it('should create deterministic ID', () => {
    const id1 = createDeterministicAgentId('test');
    const id2 = createDeterministicAgentId('test');

    expect(id1).toBe(id2);
  });

  it('should wait for duration', async () => {
    const start = Date.now();
    await wait(100);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(100);
  });

  it('should measure execution time', async () => {
    const { result, duration } = await measureTime(async () => {
      await wait(100);
      return 'done';
    });

    expect(result).toBe('done');
    expect(duration).toBeGreaterThanOrEqual(100);
  });

  it('should repeat test', async () => {
    const results = await repeatTest(3, async (i) => {
      return `iteration-${i}`;
    });

    expect(results).toEqual(['iteration-0', 'iteration-1', 'iteration-2']);
  });

  it('should run tests in parallel', async () => {
    const results = await runInParallel([
      async () => 'test1',
      async () => 'test2',
      async () => 'test3'
    ]);

    expect(results).toEqual(['test1', 'test2', 'test3']);
  });

  it('should expect rejection', async () => {
    await expectToReject(
      Promise.reject(new Error('Test error')),
      /Test error/
    );
  });
});
```

## Testing with @stratix/testing

The `@stratix/testing` package provides powerful utilities for general testing.

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
import { EntityBuilder, entityBuilder } from '@stratix/testing';

describe('Order', () => {
  it('should build entity with props', () => {
    const user = new EntityBuilder(User)
      .withProps({ email: 'test@example.com', name: 'Test User' })
      .build();

    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });

  it('should build entity with custom ID', () => {
    const userId = EntityId.create<'User'>();
    const user = new EntityBuilder(User)
      .withProps({ email: 'test@example.com' })
      .withId(userId)
      .build();

    expect(user.id).toBe(userId);
  });

  it('should build multiple entities', () => {
    const users = new EntityBuilder(User)
      .withProps({ role: 'admin' })
      .buildMany(3);

    expect(users).toHaveLength(3);
    users.forEach(user => {
      expect(user.role).toBe('admin');
    });
  });

  it('should use builder helper', () => {
    const user = entityBuilder(User)
      .withProps({ email: 'test@example.com' })
      .build();

    expect(user.email).toBe('test@example.com');
  });
});
```

### DataFactory

Generate test data easily:

```typescript
import { DataFactory } from '@stratix/testing';

describe('DataFactory', () => {
  it('should generate email', () => {
    const email1 = DataFactory.email('user');
    const email2 = DataFactory.email('user');

    expect(email1).toBe('user1@example.com');
    expect(email2).toBe('user2@example.com');
  });

  it('should generate string', () => {
    const str = DataFactory.string('prefix');
    expect(str).toContain('prefix');
  });

  it('should generate number', () => {
    const num = DataFactory.number(1, 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(10);
  });

  it('should generate entity ID', () => {
    const id = DataFactory.entityId<'User'>();
    expect(id.toString()).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should generate boolean', () => {
    const bool = DataFactory.boolean();
    expect(typeof bool).toBe('boolean');
  });

  it('should generate date', () => {
    const date = DataFactory.date(7);  // 7 days ago
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    expect(days).toBeCloseTo(7, 0);
  });

  it('should pick from array', () => {
    const status = DataFactory.pick(['active', 'inactive', 'pending']);
    expect(['active', 'inactive', 'pending']).toContain(status);
  });

  it('should reset counter', () => {
    DataFactory.email('test');
    DataFactory.email('test');
    DataFactory.reset();

    const email = DataFactory.email('test');
    expect(email).toBe('test1@example.com');
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

### General Testing

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how
2. **Keep Tests Fast**: Use in-memory implementations for unit tests
3. **Isolate Tests**: Each test should be independent
4. **Use Descriptive Names**: Test names should describe the scenario
5. **Arrange-Act-Assert**: Follow the AAA pattern consistently
6. **Test Edge Cases**: Don't just test the happy path

### AI Agent Testing

1. **Use MockLLMProvider for Unit Tests**:
   - Avoid real API calls in unit tests
   - Keep tests fast and deterministic
   - Use real providers only in integration tests

2. **Test Multi-Turn Conversations**:
   - Use `setMockResponses()` to simulate conversation flows
   - Verify context is maintained across turns
   - Test conversation state management

3. **Verify Token Usage and Costs**:
   - Always check that cost tracking works correctly
   - Test budget enforcement with `expectCostWithinBudget()`
   - Verify token counts match expectations

4. **Test Error Scenarios**:
   - Test API rate limits (mock errors)
   - Test network failures
   - Test invalid inputs and outputs
   - Verify graceful degradation

5. **Inspect Call History**:
   - Use `getCallHistory()` to verify LLM parameters
   - Check that prompts are constructed correctly
   - Verify temperature, max tokens, and other settings

6. **Performance Testing**:
   - Use `measureTime()` for timing tests
   - Set appropriate timeouts with AgentTester
   - Test timeout handling with `createTimeout()`

7. **Test Tool Usage**:
   - Mock tool responses for agent tests
   - Verify tools are called with correct parameters
   - Test tool validation logic separately

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AgentTester, expectSuccess, expectCostWithinBudget } from '@stratix/testing';

describe('ProductRecommendationAgent', () => {
  let tester: AgentTester;
  let agent: ProductRecommendationAgent;

  beforeEach(() => {
    // Setup
    tester = new AgentTester({ timeout: 5000 });
    agent = new ProductRecommendationAgent({
      provider: tester.getMockProvider(),
      database: mockDatabase
    });
  });

  describe('Happy Path', () => {
    it('should recommend products based on user preferences', async () => {
      // Arrange
      tester.setMockResponse({
        content: JSON.stringify({
          recommendations: ['product-1', 'product-2', 'product-3'],
          confidence: 0.85
        }),
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 }
      });

      // Act
      const result = await tester.test(agent, {
        userId: 'user-123',
        category: 'electronics'
      });

      // Assert
      expect(result.passed).toBe(true);
      expectSuccess(result.result);
      expect(result.result.value.recommendations).toHaveLength(3);
      expectCostWithinBudget(result.result, 0.01);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange
      tester.setMockResponse({
        content: '',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        error: new Error('API rate limit exceeded')
      });

      // Act
      const result = await tester.test(agent, { userId: 'user-123' });

      // Assert
      expect(result.passed).toBe(false);
      tester.assertFailure(result);
    });
  });

  describe('Performance', () => {
    it('should respond within time limit', async () => {
      tester.setMockResponse({
        content: JSON.stringify({ recommendations: [] }),
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }
      });

      const { duration } = await measureTime(async () => {
        await tester.test(agent, { userId: 'user-123' });
      });

      expect(duration).toBeLessThan(500);
    });
  });

  describe('Call Verification', () => {
    it('should call LLM with correct parameters', async () => {
      tester.setMockResponse({
        content: JSON.stringify({ recommendations: [] }),
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }
      });

      await tester.test(agent, { userId: 'user-123', category: 'electronics' });

      const lastCall = tester.getMockProvider().getLastCall();
      expect(lastCall?.model).toBe('gpt-4o');
      expect(lastCall?.temperature).toBe(0.7);
      expect(lastCall?.messages[0].content).toContain('electronics');
    });
  });
});
```

## Next Steps

Continue exploring Stratix:
- Review Core Concepts for deeper understanding
- Build your first application
- Contribute to the framework
