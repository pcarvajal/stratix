# Stratix REST API - Complete Template

A production-ready REST API built with Stratix framework, featuring:

- Domain-Driven Design (DDD)
- CQRS pattern
- Hexagonal Architecture
- Full integration with Stratix production extensions

## Features

### Core Stratix
- **@stratix/primitives** - Entity, AggregateRoot, ValueObject, Result pattern
- **@stratix/abstractions** - Interfaces and contracts
- **@stratix/runtime** - Application lifecycle and plugin system
- **@stratix/impl-di-awilix** - Dependency injection
- **@stratix/impl-logger-console** - Logging
- **@stratix/impl-cqrs-inmemory** - Command and Query buses

### Production Extensions
- **@stratix/ext-http-fastify** - HTTP server with Fastify
- **@stratix/ext-validation-zod** - Request validation with Zod
- **@stratix/ext-mappers** - Object mapping utilities
- **@stratix/ext-auth** - Authentication and authorization
- **@stratix/ext-errors** - Centralized error handling

## Project Structure

```
src/
├── domain/               # Domain layer
│   ├── entities/        # Entities and Aggregates
│   ├── value-objects/   # Value Objects
│   ├── repositories/    # Repository interfaces
│   └── events/          # Domain Events
├── application/         # Application layer
│   ├── commands/        # CQRS Commands
│   └── queries/         # CQRS Queries
└── infrastructure/      # Infrastructure layer
    ├── persistence/     # Repository implementations
    └── http/            # HTTP routes and controllers
        └── routes/
```

## Getting Started

### Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Checks
- `GET /health` - Health status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Products
- `POST /api/products` - Create product
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Create Product Example

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "currency": "USD",
    "stock": 10
  }'
```

### Get Product Example

```bash
curl http://localhost:3000/api/products/{id}
```

### List Products Example

```bash
curl http://localhost:3000/api/products
```

## Domain Model

### Product Aggregate

The Product aggregate is the main entity with the following business rules:
- Name cannot be empty
- Price must be positive
- Stock cannot be negative
- Price is represented as Money value object (amount + currency)

### Money Value Object

Money is immutable and ensures:
- Amount cannot be negative
- Currency must be a valid 3-letter code (USD, EUR, etc.)
- Operations (add, subtract, multiply) maintain currency consistency

### Domain Events

- `ProductCreated` - Triggered when a new product is created

## Command and Query Examples

### Commands (Write operations)
- **CreateProduct** - Creates a new product with validation
- **UpdateProduct** - Updates product details

### Queries (Read operations)
- **GetProductById** - Retrieves a single product
- **ListProducts** - Retrieves all products

## Validation

All inputs are validated using Zod schemas:
- Type safety at compile time
- Runtime validation
- Automatic error messages
- Schema-based documentation

## Error Handling

Errors are handled centrally by the ErrorsPlugin:
- Consistent error responses
- Stack traces in development only
- Proper HTTP status codes
- Detailed error messages

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run typecheck` - Type check without building
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Environment Variables

Create a `.env` file:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

## Next Steps

1. Add database persistence (Postgres, MongoDB)
2. Implement authentication and authorization
3. Add more domain entities and aggregates
4. Implement event handlers
5. Add integration and E2E tests
6. Set up CI/CD pipeline

## Code Generation

Use Stratix CLI to generate new code:

```bash
# Generate entity
stratix g entity Order --props "total:number,items:OrderItem[]" --with-event OrderCreated

# Generate value object
stratix g value-object Address --props "street:string,city:string,country:string"

# Generate command
stratix g command PlaceOrder --input "productId:string,quantity:number" --with-tests

# Generate query
stratix g query GetOrders --output "orders:Order[]"

# Generate repository
stratix g repository OrderRepository --entity Order --impl postgres
```

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

## License

MIT
