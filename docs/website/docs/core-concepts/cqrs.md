# CQRS (Command Query Responsibility Segregation)

CQRS is a pattern that separates read and write operations into different models, allowing you to optimize each side independently.

## Core Concept

**Commands** change state. **Queries** return data. Never mix the two.

```typescript
// Command - Changes state, returns void or Result
handle(command: CreateUser): Promise<Result<void>>

// Query - Returns data, never changes state
handle(query: GetUser): Promise<Result<UserDto>>
```

## Commands

Commands represent **intentions to change state**. They should be named in imperative form (CreateUser, PlaceOrder, UpdateProfile).

### Creating a Command

```typescript
import { Command } from '@stratix/core';

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}

export class CreateProduct implements Command {
  constructor(public readonly data: CreateProductInput) {}
}
```

### Command Handler

```typescript
import { CommandHandler } from '@stratix/core';
import { Result, Success, Failure } from '@stratix/core';

export interface CreateProductOutput {
  id: string;
}

export class CreateProductHandler implements CommandHandler<CreateProduct, Result<CreateProductOutput>> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    try {
      // 1. Validate input
      if (command.data.price < 0) {
        return Failure.create(new Error('Price cannot be negative'));
      }

      // 2. Create domain entity
      const product = Product.create(command.data);

      // 3. Persist
      await this.productRepository.save(product);

      // 4. Publish domain events
      const events = product.pullDomainEvents();
      await this.eventBus.publish(events);

      // 5. Return result
      return Success.create({ id: product.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

### Command Examples

```typescript
// Create
export class CreateOrder implements Command {
  constructor(public readonly data: CreateOrderInput) {}
}

// Update
export class UpdateOrderStatus implements Command {
  constructor(public readonly data: UpdateOrderStatusInput) {}
}

// Delete
export class CancelOrder implements Command {
  constructor(public readonly data: CancelOrderInput) {}
}
```

## Queries

Queries represent **requests for data**. They should be named in interrogative form (GetUser, ListOrders, FindProduct).

### Creating a Query

```typescript
import { Query } from '@stratix/core';

export interface GetProductInput {
  id: string;
}

export class GetProduct implements Query {
  constructor(public readonly data: GetProductInput) {}
}
```

### Query Handler

```typescript
import { QueryHandler } from '@stratix/core';
import { Result, Success, Failure, EntityId } from '@stratix/core';

export interface ProductDto {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class GetProductHandler implements QueryHandler<GetProduct, Result<ProductDto>> {
  constructor(private readonly productRepository: ProductRepository) {}

  async handle(query: GetProduct): Promise<Result<ProductDto>> {
    try {
      const product = await this.productRepository.findById(
        EntityId.from<'Product'>(query.data.id)
      );

      if (!product) {
        return Failure.create(new Error('Product not found'));
      }

      // Map to DTO
      const dto: ProductDto = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        stock: product.stock
      };

      return Success.create(dto);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

### Query Examples

```typescript
// Get single item
export class GetOrder implements Query {
  constructor(public readonly data: GetOrderInput) {}
}

// List with filters
export class ListProducts implements Query {
  constructor(public readonly data: ListProductsInput) {}
}

export interface ListProductsInput {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

// Search
export class SearchProducts implements Query {
  constructor(public readonly data: SearchProductsInput) {}
}
```

## Command Bus

The Command Bus dispatches commands to their handlers.

### Using the Command Bus

```typescript
import { CommandBus } from '@stratix/core';
import { Result } from '@stratix/core';

class ProductController {
  constructor(private readonly commandBus: CommandBus) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    const command = new CreateProduct({
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock
    });

    const result = await this.commandBus.dispatch<Result<CreateProductOutput>>(command);

    if (result.isSuccess) {
      res.status(201).json(result.value);
    } else {
      res.status(400).json({ error: result.error.message });
    }
  }
}
```

### Registering Handlers

```typescript
import { InMemoryCommandBus } from '@stratix/cqrs-inmemory';

const commandBus = new InMemoryCommandBus();

// Register handlers
commandBus.register(CreateProduct, new CreateProductHandler(repository, eventBus));
commandBus.register(UpdateProduct, new UpdateProductHandler(repository, eventBus));
commandBus.register(DeleteProduct, new DeleteProductHandler(repository, eventBus));
```

## Query Bus

The Query Bus dispatches queries to their handlers.

### Using the Query Bus

```typescript
import { QueryBus } from '@stratix/core';
import { Result } from '@stratix/core';

class ProductController {
  constructor(private readonly queryBus: QueryBus) {}

  async getProduct(req: Request, res: Response): Promise<void> {
    const query = new GetProduct({ id: req.params.id });

    const result = await this.queryBus.dispatch<Result<ProductDto>>(query);

    if (result.isSuccess) {
      res.status(200).json(result.value);
    } else {
      res.status(404).json({ error: result.error.message });
    }
  }

  async listProducts(req: Request, res: Response): Promise<void> {
    const query = new ListProducts({
      category: req.query.category,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    });

    const result = await this.queryBus.dispatch<Result<ListProductsOutput>>(query);

    if (result.isSuccess) {
      res.status(200).json(result.value);
    } else {
      res.status(500).json({ error: result.error.message });
    }
  }
}
```

### Registering Query Handlers

```typescript
import { InMemoryQueryBus } from '@stratix/cqrs-inmemory';

const queryBus = new InMemoryQueryBus();

// Register handlers
queryBus.register(GetProduct, new GetProductHandler(repository));
queryBus.register(ListProducts, new ListProductsHandler(repository));
queryBus.register(SearchProducts, new SearchProductsHandler(searchService));
```

## Complete Example

Here's a complete CRUD implementation using CQRS:

### Domain Layer

```typescript
// src/domain/entities/Product.ts
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

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this._price = newPrice;
    this.record(new ProductPriceUpdatedEvent(this.id, newPrice));
    this.touch();
  }

  static create(props: { name: string; price: number; stock: number }): Product {
    const now = new Date();
    return new Product(EntityId.create<'Product'>(), props.name, props.price, props.stock, now, now);
  }
}
```

### Application Layer - Commands

```typescript
// src/application/commands/CreateProduct.ts
export class CreateProduct implements Command {
  constructor(public readonly data: CreateProductInput) {}
}

export class CreateProductHandler implements CommandHandler<CreateProduct, Result<CreateProductOutput>> {
  constructor(
    private readonly repository: ProductRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    const product = Product.create(command.data);
    await this.repository.save(product);

    const events = product.pullDomainEvents();
    await this.eventBus.publish(events);

    return Success.create({ id: product.id.toString() });
  }
}

// src/application/commands/UpdateProductPrice.ts
export class UpdateProductPrice implements Command {
  constructor(public readonly data: UpdateProductPriceInput) {}
}

export class UpdateProductPriceHandler implements CommandHandler<UpdateProductPrice, Result<void>> {
  constructor(
    private readonly repository: ProductRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: UpdateProductPrice): Promise<Result<void>> {
    const product = await this.repository.findById(
      EntityId.from<'Product'>(command.data.id)
    );

    if (!product) {
      return Failure.create(new Error('Product not found'));
    }

    product.updatePrice(command.data.price);
    await this.repository.save(product);

    const events = product.pullDomainEvents();
    await this.eventBus.publish(events);

    return Success.create(undefined);
  }
}
```

### Application Layer - Queries

```typescript
// src/application/queries/GetProduct.ts
export class GetProduct implements Query {
  constructor(public readonly data: GetProductInput) {}
}

export class GetProductHandler implements QueryHandler<GetProduct, Result<ProductDto>> {
  constructor(private readonly repository: ProductRepository) {}

  async handle(query: GetProduct): Promise<Result<ProductDto>> {
    const product = await this.repository.findById(
      EntityId.from<'Product'>(query.data.id)
    );

    if (!product) {
      return Failure.create(new Error('Product not found'));
    }

    return Success.create({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock
    });
  }
}

// src/application/queries/ListProducts.ts
export class ListProducts implements Query {
  constructor(public readonly data: ListProductsInput) {}
}

export class ListProductsHandler implements QueryHandler<ListProducts, Result<ListProductsOutput>> {
  constructor(private readonly repository: ProductRepository) {}

  async handle(query: ListProducts): Promise<Result<ListProductsOutput>> {
    const products = await this.repository.findAll();

    const items = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock
    }));

    return Success.create({
      items,
      total: items.length,
      page: query.data.page,
      limit: query.data.limit
    });
  }
}
```

### Infrastructure Layer

```typescript
// src/infrastructure/http/ProductController.ts
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.commandBus.dispatch<Result<CreateProductOutput>>(
      new CreateProduct(req.body)
    );

    if (result.isSuccess) {
      res.status(201).json(result.value);
    } else {
      res.status(400).json({ error: result.error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const result = await this.queryBus.dispatch<Result<ProductDto>>(
      new GetProduct({ id: req.params.id })
    );

    if (result.isSuccess) {
      res.status(200).json(result.value);
    } else {
      res.status(404).json({ error: result.error.message });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    const result = await this.queryBus.dispatch<Result<ListProductsOutput>>(
      new ListProducts({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      })
    );

    if (result.isSuccess) {
      res.status(200).json(result.value);
    } else {
      res.status(500).json({ error: result.error.message });
    }
  }

  async updatePrice(req: Request, res: Response): Promise<void> {
    const result = await this.commandBus.dispatch<Result<void>>(
      new UpdateProductPrice({
        id: req.params.id,
        price: req.body.price
      })
    );

    if (result.isSuccess) {
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error.message });
    }
  }
}
```

## Benefits of CQRS

### 1. Separation of Concerns

Read and write operations have different requirements:

```typescript
// Write side - Focus on business rules
class CreateOrderHandler {
  async handle(command: CreateOrder): Promise<Result<void>> {
    // Validate invariants
    // Create aggregate
    // Persist changes
    // Publish events
  }
}

// Read side - Focus on performance
class GetOrderDetailsHandler {
  async handle(query: GetOrderDetails): Promise<Result<OrderDetailsDto>> {
    // Optimized query
    // Flatten data
    // Return DTO
  }
}
```

### 2. Independent Scaling

Scale reads and writes independently:

```typescript
// Write database - Optimized for consistency
const writeDb = new PostgresPlugin();

// Read database - Optimized for queries
const readDb = new MongoDBPlugin(); // Denormalized data
```

### 3. Simplified Queries

Queries can bypass domain logic:

```typescript
// Direct database query for performance
class ListProductsHandler {
  async handle(query: ListProducts): Promise<Result<ProductDto[]>> {
    // Direct SQL query, no need to load full aggregates
    const products = await this.db.query(
      'SELECT id, name, price FROM products WHERE category = $1',
      [query.data.category]
    );

    return Success.create(products);
  }
}
```

### 4. Event Sourcing Ready

CQRS works naturally with event sourcing:

```typescript
class CreateOrderHandler {
  async handle(command: CreateOrder): Promise<Result<void>> {
    const order = Order.create(command.data);

    // Save events instead of state
    const events = order.pullDomainEvents();
    await this.eventStore.append(events);

    return Success.create(undefined);
  }
}
```

## Testing CQRS

### Testing Commands

```typescript
import { describe, it, expect } from 'vitest';

describe('CreateProductHandler', () => {
  it('should create product', async () => {
    const repository = new InMemoryProductRepository();
    const eventBus = new InMemoryEventBus();
    const handler = new CreateProductHandler(repository, eventBus);

    const command = new CreateProduct({
      name: 'Laptop',
      price: 999.99,
      stock: 10
    });

    const result = await handler.handle(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id).toBeDefined();
  });

  it('should reject negative price', async () => {
    const handler = new CreateProductHandler(repository, eventBus);

    const command = new CreateProduct({
      name: 'Laptop',
      price: -100,
      stock: 10
    });

    const result = await handler.handle(command);

    expect(result.isSuccess).toBe(false);
    expect(result.error.message).toBe('Price cannot be negative');
  });
});
```

### Testing Queries

```typescript
describe('GetProductHandler', () => {
  it('should return product', async () => {
    const repository = new InMemoryProductRepository();
    const product = Product.create({ name: 'Laptop', price: 999.99, stock: 10 });
    await repository.save(product);

    const handler = new GetProductHandler(repository);
    const query = new GetProduct({ id: product.id.toString() });

    const result = await handler.handle(query);

    expect(result.isSuccess).toBe(true);
    expect(result.value.name).toBe('Laptop');
  });

  it('should return error for non-existent product', async () => {
    const handler = new GetProductHandler(repository);
    const query = new GetProduct({ id: 'non-existent' });

    const result = await handler.handle(query);

    expect(result.isSuccess).toBe(false);
    expect(result.error.message).toBe('Product not found');
  });
});
```

## Best Practices

### 1. Keep Commands Simple

One command, one responsibility:

```typescript
// Good: Single responsibility
class UpdateProductPrice implements Command {}
class UpdateProductStock implements Command {}

// Bad: Multiple responsibilities
class UpdateProduct implements Command {
  price?: number;
  stock?: number;
  name?: string;
  // Too many optional fields
}
```

### 2. Return Minimal Data from Commands

Commands should return IDs, not full entities:

```typescript
// Good: Return ID only
async handle(command: CreateProduct): Promise<Result<{ id: string }>> {
  const product = Product.create(command.data);
  await this.repository.save(product);
  return Success.create({ id: product.id.toString() });
}

// Bad: Return full entity
async handle(command: CreateProduct): Promise<Result<ProductDto>> {
  // Don't return full data from commands
}
```

### 3. Use DTOs for Queries

Never return domain entities from queries:

```typescript
// Good: Return DTO
interface ProductDto {
  id: string;
  name: string;
  price: number;
}

// Bad: Return domain entity
async execute(query: GetProduct): Promise<Result<Product>> {
  // Don't expose domain entities
}
```

## Next Steps

- [Testing](../advanced/testing.md) - Test your use cases
- [Entities & Aggregates](./entities.md) - Review domain modeling
- [Value Objects](./value-objects.md) - Immutable domain concepts
