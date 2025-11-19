# Repository Pattern

The Repository pattern provides an abstraction layer between the domain layer and data persistence. Repositories act as in-memory collections of aggregates, hiding the complexity of data access.

## What is a Repository?

A **Repository** is a collection-like interface for accessing domain objects. It provides methods to add, remove, and query aggregates without exposing persistence details to the domain layer.

```typescript
import { Repository } from '@stratix/core';
import { Product, ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  findById(id: ProductId): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByCategory(category: string): Promise<Product[]>;
  delete(id: ProductId): Promise<void>;
}
```

## Repository Interface

The base `Repository<T, ID>` interface from `@stratix/core` requires only one method:

```typescript
interface Repository<T, ID> {
  save(entity: T): Promise<void>;
}
```

All other methods (`findById`, `findAll`, `delete`, `exists`) are optional. You declare which methods your specific repository needs:

```typescript
// Minimal repository
export interface MinimalRepository extends Repository<User, UserId> {
  // Only has save() from base interface
}

// Full repository
export interface FullRepository extends Repository<User, UserId> {
  findById(id: UserId): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: UserId): Promise<void>;
  exists(id: UserId): Promise<boolean>;
}
```

## Repository Location

Repositories follow this structure:

- **Interface**: `src/domain/repositories/` (domain layer)
- **Implementation**: `src/infrastructure/persistence/` (infrastructure layer)

```
src/
├── domain/
│   └── repositories/
│       └── ProductRepository.ts  # Interface
└── infrastructure/
    └── persistence/
        ├── InMemoryProductRepository.ts
        ├── PostgresProductRepository.ts
        └── MongoProductRepository.ts
```

## Creating a Repository

### Step 1: Define Interface

```typescript
// src/domain/repositories/ProductRepository.ts
import { Repository } from '@stratix/core';
import { Product, ProductId } from '../entities/Product.js';

export interface ProductRepository extends Repository<Product, ProductId> {
  findById(id: ProductId): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByName(name: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  delete(id: ProductId): Promise<void>;
}
```

### Step 2: Implement Repository

```typescript
// src/infrastructure/persistence/InMemoryProductRepository.ts
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Product, ProductId } from '../../domain/entities/Product.js';

export class InMemoryProductRepository implements ProductRepository {
  private products = new Map<string, Product>();

  async save(product: Product): Promise<void> {
    this.products.set(product.id.toString(), product);
  }

  async findById(id: ProductId): Promise<Product | null> {
    return this.products.get(id.toString()) ?? null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findByName(name: string): Promise<Product | null> {
    for (const product of this.products.values()) {
      if (product.name === name) {
        return product;
      }
    }
    return null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.category === category);
  }

  async delete(id: ProductId): Promise<void> {
    this.products.delete(id.toString());
  }
}
```

## Database Implementations

### PostgreSQL Repository

```typescript
import { Pool } from 'pg';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Product, ProductId } from '../../domain/entities/Product.js';
import { EntityId } from '@stratix/core';

export class PostgresProductRepository implements ProductRepository {
  constructor(private readonly pool: Pool) {}

  async save(product: Product): Promise<void> {
    const query = `
      INSERT INTO products (id, name, price, stock, category, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        category = EXCLUDED.category,
        updated_at = EXCLUDED.updated_at
    `;

    await this.pool.query(query, [
      product.id.toString(),
      product.name,
      product.price,
      product.stock,
      product.category,
      product.createdAt,
      product.updatedAt
    ]);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id.toString()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.toDomain(result.rows[0]);
  }

  async findAll(): Promise<Product[]> {
    const result = await this.pool.query('SELECT * FROM products');
    return result.rows.map(row => this.toDomain(row));
  }

  async findByCategory(category: string): Promise<Product[]> {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE category = $1',
      [category]
    );
    return result.rows.map(row => this.toDomain(row));
  }

  async delete(id: ProductId): Promise<void> {
    await this.pool.query('DELETE FROM products WHERE id = $1', [id.toString()]);
  }

  private toDomain(row: any): Product {
    return Product.fromPrimitives(
      row.id,
      row.name,
      row.price,
      row.stock,
      row.category,
      row.created_at,
      row.updated_at
    );
  }
}
```

### MongoDB Repository

```typescript
import { Collection, MongoClient } from 'mongodb';
import { ProductRepository } from '../../domain/repositories/ProductRepository.js';
import { Product, ProductId } from '../../domain/entities/Product.js';

export class MongoProductRepository implements ProductRepository {
  private collection: Collection;

  constructor(client: MongoClient, dbName: string) {
    this.collection = client.db(dbName).collection('products');
  }

  async save(product: Product): Promise<void> {
    await this.collection.updateOne(
      { _id: product.id.toString() },
      {
        $set: {
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      },
      { upsert: true }
    );
  }

  async findById(id: ProductId): Promise<Product | null> {
    const doc = await this.collection.findOne({ _id: id.toString() });
    
    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  async findAll(): Promise<Product[]> {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async findByCategory(category: string): Promise<Product[]> {
    const docs = await this.collection.find({ category }).toArray();
    return docs.map(doc => this.toDomain(doc));
  }

  async delete(id: ProductId): Promise<void> {
    await this.collection.deleteOne({ _id: id.toString() });
  }

  private toDomain(doc: any): Product {
    return Product.fromPrimitives(
      doc._id,
      doc.name,
      doc.price,
      doc.stock,
      doc.category,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
```

## Using Repositories

### In Command Handlers

```typescript
export class CreateProductHandler implements CommandHandler<CreateProduct, Result<CreateProductOutput>> {
  constructor(private readonly repository: ProductRepository) {}

  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    // Create domain entity
    const product = Product.create(command.data);

    // Persist
    await this.repository.save(product);

    return Success.create({ id: product.id.toString() });
  }
}
```

### In Query Handlers

```typescript
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
```

## Aggregate Consistency

Repositories ensure aggregate consistency:

### One Repository per Aggregate Root

```typescript
// Good: One repository per aggregate
interface OrderRepository extends Repository<Order, OrderId> {}
interface ProductRepository extends Repository<Product, ProductId> {}

// Bad: Repository for child entities
interface OrderItemRepository extends Repository<OrderItem, OrderItemId> {}
// OrderItem should be accessed through Order aggregate
```

### Load Full Aggregate

```typescript
async findById(id: OrderId): Promise<Order | null> {
  // Load order with all items
  const orderRow = await this.db.query('SELECT * FROM orders WHERE id = $1', [id]);
  const itemsRows = await this.db.query('SELECT * FROM order_items WHERE order_id = $1', [id]);

  if (!orderRow) {
    return null;
  }

  // Reconstruct full aggregate
  return Order.fromPrimitives(orderRow, itemsRows);
}
```

### Save Full Aggregate

```typescript
async save(order: Order): Promise<void> {
  // Start transaction
  const client = await this.pool.connect();
  
  try {
    await client.query('BEGIN');

    // Save order
    await client.query(
      'INSERT INTO orders (id, customer_id, status) VALUES ($1, $2, $3)',
      [order.id.toString(), order.customerId, order.status]
    );

    // Save items
    for (const item of order.items) {
      await client.query(
        'INSERT INTO order_items (id, order_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
        [item.id.toString(), order.id.toString(), item.productId, item.quantity]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Query Optimization

### Read Models

For complex queries, use read models separate from aggregates:

```typescript
// Write model (aggregate)
interface ProductRepository extends Repository<Product, ProductId> {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
}

// Read model (optimized for queries)
interface ProductQueryService {
  searchProducts(criteria: SearchCriteria): Promise<ProductDto[]>;
  getProductCatalog(): Promise<CatalogDto>;
  getProductStatistics(): Promise<StatsDto>;
}
```

### Pagination

```typescript
interface ProductRepository extends Repository<Product, ProductId> {
  findAll(page: number, limit: number): Promise<{
    items: Product[];
    total: number;
    page: number;
    pages: number;
  }>;
}

// Implementation
async findAll(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.db.query(
      'SELECT * FROM products LIMIT $1 OFFSET $2',
      [limit, offset]
    ),
    this.db.query('SELECT COUNT(*) FROM products')
  ]);

  return {
    items: items.rows.map(this.toDomain),
    total: parseInt(total.rows[0].count),
    page,
    pages: Math.ceil(total / limit)
  };
}
```

## Testing Repositories

### Using In-Memory Implementation

```typescript
describe('CreateProductHandler', () => {
  let repository: ProductRepository;
  let handler: CreateProductHandler;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    handler = new CreateProductHandler(repository);
  });

  it('should create product', async () => {
    const result = await handler.handle(
      new CreateProduct({ name: 'Laptop', price: 999, stock: 10 })
    );

    expect(result.isSuccess).toBe(true);
    
    const product = await repository.findById(
      EntityId.from<'Product'>(result.value.id)
    );
    
    expect(product).toBeDefined();
    expect(product?.name).toBe('Laptop');
  });
});
```

### Integration Tests

```typescript
describe('PostgresProductRepository', () => {
  let repository: PostgresProductRepository;
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    repository = new PostgresProductRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE products CASCADE');
  });

  it('should save and retrieve product', async () => {
    const product = Product.create({
      name: 'Laptop',
      price: 999,
      stock: 10
    });

    await repository.save(product);

    const retrieved = await repository.findById(product.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Laptop');
  });
});
```

## Best Practices

### 1. Keep Repositories Focused

```typescript
// Good: Clear query methods
interface ProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  findLowStock(threshold: number): Promise<Product[]>;
}

// Bad: Generic query method
interface ProductRepository {
  query(criteria: any): Promise<Product[]>;  // Too generic
}
```

### 2. Return Domain Objects

```typescript
// Good: Returns domain object
async findById(id: ProductId): Promise<Product | null> {
  const row = await this.db.query(...);
  return this.toDomain(row);  // Convert to Product
}

// Bad: Returns database row
async findById(id: ProductId): Promise<any> {
  return await this.db.query(...);  // Raw database row
}
```

### 3. Hide Persistence Details

```typescript
// Good: Clean interface
interface ProductRepository {
  findByCategory(category: string): Promise<Product[]>;
}

// Bad: Exposes SQL
interface ProductRepository {
  findByQuery(sql: string, params: any[]): Promise<Product[]>;
}
```

### 4. One Aggregate per Transaction

```typescript
// Good: Single aggregate
async function placeOrder(orderId: OrderId): Promise<Result<void>> {
  const order = await repository.findById(orderId);
  order.place();
  await repository.save(order);
  return Success.create(undefined);
}

// Bad: Multiple aggregates
async function placeOrder(orderId: OrderId): Promise<Result<void>> {
  const order = await orderRepo.findById(orderId);
  const customer = await customerRepo.findById(order.customerId);
  
  order.place();
  customer.incrementOrderCount();
  
  await orderRepo.save(order);
  await customerRepo.save(customer);  // Two aggregates!
}
```

## Specification Pattern

For complex queries, use the Specification pattern:

```typescript
interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
  toSql(): { query: string; params: any[] };
}

class ProductsByCategorySpec implements Specification<Product> {
  constructor(private category: string) {}

  isSatisfiedBy(product: Product): boolean {
    return product.category === this.category;
  }

  toSql() {
    return {
      query: 'SELECT * FROM products WHERE category = $1',
      params: [this.category]
    };
  }
}

// Repository method
async findBySpec(spec: Specification<Product>): Promise<Product[]> {
  const { query, params } = spec.toSql();
  const result = await this.db.query(query, params);
  return result.rows.map(this.toDomain);
}
```

## Next Steps

- [Entities & Aggregates](./entities.md) - Learn about domain modeling
- [CQRS](./cqrs.md) - Use repositories in command handlers
- [Architecture](./architecture.md) - Understand repository placement
