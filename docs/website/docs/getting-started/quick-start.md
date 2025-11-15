# Quick Start

Get started with Stratix in 5 minutes. Choose your path: learn AI agents or build traditional applications.

## Choose Your Path

### Path 1: Learn AI Agents (Recommended)

Start with our interactive AI agent learning path. No API key needed for the first two levels:

```bash
npm create stratix my-learning -- --template ai-agent-starter
cd my-learning
pnpm start
```

This opens an interactive menu with 6 progressive levels:
- **Level 1: Echo Agent** (FREE) - Learn agent fundamentals without LLM
- **Level 2: Mock Agent** (FREE) - Testing patterns with mock providers
- **Level 3-6**: Basic LLM, Tools, Memory, Production patterns

Perfect for learning how AI agents work in Stratix with minimal cost (total ~$0.30-0.50).

### Path 2: Traditional Application

Build a REST API, microservice, or modular monolith:

```bash
pnpm create stratix my-shop
cd my-shop
```

Choose from templates:
- **modular-monolith** - Bounded Contexts as Plugins (monolith → microservices)
- **rest-api-complete** - Production REST API with all Phase 1 extensions
- **rest-api** - Basic REST API with DDD/CQRS
- **microservice** - Event-driven architecture
- **worker** - Background job processing
- **minimal** - Start from scratch

---

## Traditional Application Quick Start

This guide shows building a traditional Stratix application. For AI agents, see the [AI Agent Starter](#path-1-learn-ai-agents-recommended) section above.

## 1. Create a Project

```bash
pnpm create stratix my-shop
cd my-shop
```

## 2. Create Your First Entity

Create `src/domain/entities/Product.ts`:

```typescript
import { AggregateRoot, EntityId } from '@stratix/primitives';

export type ProductId = EntityId<'Product'>;

export interface ProductProps {
  name: string;
  price: number;
  stock: number;
}

export class Product extends AggregateRoot<'Product'> {
  private constructor(
    id: ProductId,
    private _name: string,
    private _price: number,
    private _stock: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  static create(props: ProductProps, id?: ProductId): Product {
    const productId = id ?? EntityId.create<'Product'>();
    const now = new Date();
    return new Product(productId, props.name, props.price, props.stock, now, now);
  }

  updateName(name: string): void {
    this._name = name;
    this.touch();
  }

  updatePrice(price: number): void {
    this._price = price;
    this.touch();
  }

  updateStock(stock: number): void {
    this._stock = stock;
    this.touch();
  }
}
```

## 3. Add Domain Events

First, create a domain event for when stock is decreased:

```typescript
// src/domain/events/ProductStockDecreasedEvent.ts
import { DomainEvent } from '@stratix/primitives';
import { ProductId } from '../entities/Product.js';

export class ProductStockDecreasedEvent extends DomainEvent {
  constructor(
    public readonly productId: ProductId,
    public readonly quantity: number,
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}
```

## 4. Add Business Logic

Now add some domain logic to our `Product`:

```typescript
// src/domain/entities/Product.ts
import { ProductStockDecreasedEvent } from '../events/ProductStockDecreasedEvent.js';

export class Product extends AggregateRoot<'Product'> {
  // ... existing code

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }

    this._stock -= quantity;
    this.record(new ProductStockDecreasedEvent(this.id, quantity));
    this.touch();
  }

  isAvailable(): boolean {
    return this._stock > 0;
  }
}
```

## 5. Create a Use Case

Create `src/application/commands/CreateProduct.ts`:

```typescript
import { Command, CommandHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { Product, ProductId } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}

export interface CreateProductOutput {
  id: string;
}

export class CreateProduct implements Command {
  constructor(public readonly data: CreateProductInput) {}
}

export class CreateProductHandler implements CommandHandler<CreateProduct, Result<CreateProductOutput>> {
  constructor(private readonly repository: ProductRepository) {}

  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    try {
      // Validate input
      if (command.data.price < 0) {
        return Failure.create(new Error('Price cannot be negative'));
      }

      if (command.data.stock < 0) {
        return Failure.create(new Error('Stock cannot be negative'));
      }

      // Create product
      const product = Product.create(command.data);

      // Save
      await this.repository.save(product);

      return Success.create({ id: product.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

## 6. Create Repository Interface

Create `src/domain/repositories/ProductRepository.ts`:

```typescript
import { Repository } from '@stratix/abstractions';
import { Product, ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  findByName(name: string): Promise<Product | null>;
}
```

## 7. Implement Repository

Create `src/infrastructure/persistence/InMemoryProductRepository.ts`:

```typescript
import { Product, ProductId } from '../../domain/entities/Product.js';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';

export class InMemoryProductRepository implements ProductRepository {
  private products = new Map<string, Product>();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.toString(), product);
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.toString()) || null;
  }

  async findByName(name: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.name === name) {
        return product;
      }
    }
    return null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.toString());
  }

  async count(): Promise<number> {
    return this.products.size;
  }
}
```

## 8. Wire Everything Together

Update `src/index.ts`:

```typescript
import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger, LogLevel, ServiceLifetime } from '@stratix/impl-logger-console';
import { CreateProductHandler } from './application/commands/CreateProduct.js';
import { InMemoryProductRepository } from './infrastructure/persistence/InMemoryProductRepository.js';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger({ level: LogLevel.INFO });

  // Register dependencies
  const productRepository = new InMemoryProductRepository();
  container.register('productRepository', () => productRepository, { lifetime: ServiceLifetime.SINGLETON });
  container.register('createProductHandler', () => new CreateProductHandler(productRepository), { lifetime: ServiceLifetime.SINGLETON });

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();

  // Example usage
  const handler = container.resolve<CreateProductHandler>('createProductHandler');

  const result = await handler.handle({
    data: {
      name: 'Laptop',
      price: 999.99,
      stock: 10
    }
  });

  if (result.isSuccess) {
    logger.info('Product created!', { productId: result.value.id });
  } else {
    logger.error('Failed to create product', { error: result.error });
  }

  await app.stop();
}

bootstrap().catch(console.error);
```

## 9. Run Your Application

```bash
pnpm run dev
```

You should see:

```
Application started!
[INFO] Product created! { productId: '...' }
```

## Next Steps

Congratulations! You've built your first Stratix application.

### Want to Add AI Agents?

Check out the **AI Agent Starter** template to learn how to integrate AI agents into your application:

```bash
npm create stratix my-ai-learning -- --template ai-agent-starter
```

### Continue Learning

- [Core Concepts](../core-concepts/architecture.md) - Understand Stratix architecture
- [Entities & Aggregates](../core-concepts/entities.md) - Deep dive into domain modeling
- [CQRS](../core-concepts/cqrs.md) - Commands and Queries
- [Testing](../advanced/testing.md) - Write tests for your application
- [AI Agents](../core-concepts/ai-agents.md) - Build intelligent agents (coming soon)
