# REST API Example

REST API with DDD, CQRS, and Hexagonal Architecture.

## Quick Start

```bash
cd rest-api
pnpm install && pnpm dev
```

Server starts on `http://localhost:3000`

## Features

- Full CRUD operations for Products
- Domain-Driven Design with rich domain model
- CQRS with separate commands and queries
- Domain events for state changes
- Hexagonal architecture
- In-memory repository
- Fastify HTTP server

## Project Structure

```
src/
├── domain/           # Business logic
│   ├── entities/
│   ├── events/
│   └── repositories/
├── application/      # Use cases
│   ├── commands/
│   └── queries/
└── infrastructure/   # External concerns
    ├── http/
    └── persistence/
```

## API Endpoints

### Create Product

```bash
POST /products
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 50,
  "category": "Electronics"
}
```

Response (201):
```json
{
  "id": "prod_abc123"
}
```

### Get Product

```bash
GET /products/:id
```

### List Products

```bash
GET /products
GET /products?category=Electronics
GET /products?availableOnly=true
```

### Update Price

```bash
PATCH /products/:id/price
Content-Type: application/json

{
  "price": 899.99
}
```

## Architecture Example

**Domain Layer:**
```typescript
class Product extends AggregateRoot<'Product'> {
  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this._price = newPrice;
    this.record(new ProductPriceUpdatedEvent(this.id, oldPrice, newPrice));
  }
}
```

**Application Layer:**
```typescript
class CreateProductHandler implements CommandHandler<CreateProduct> {
  async handle(command: CreateProduct): Promise<Result<CreateProductOutput>> {
    const product = Product.create(command.data);
    await this.repository.save(product);
    await this.eventBus.publish(product.pullDomainEvents());
    return Success.create({ id: product.id.toString() });
  }
}
```

**Infrastructure Layer:**
```typescript
app.post('/products', async (request, reply) => {
  const result = await commandBus.dispatch(new CreateProduct(request.body));
  return result.isSuccess
    ? reply.status(201).send(result.value)
    : reply.status(400).send({ error: result.error.message });
});
```

## License

MIT
