# Examples

Learn Stratix through complete, production-ready templates available via `stratix CLI`.

## Available Templates

### REST API

Build a full-featured REST API with Domain-Driven Design.

**What you'll learn:**
- Entity and aggregate modeling
- CQRS with commands and queries
- Repository pattern
- HTTP API with Fastify
- Business logic in domain layer

**Difficulty:** Beginner

```bash
stratix new my-api --template rest-api
cd my-api
pnpm install
pnpm dev
```

### Microservices

Build distributed services with event-driven communication.

**What you'll learn:**
- Service boundaries
- Asynchronous messaging with RabbitMQ
- Event publishing and consuming
- Inter-service communication
- Service independence

**Difficulty:** Intermediate

```bash
stratix new my-service --template microservice
cd my-service

# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-management

# Start service
pnpm install
pnpm dev
```

### Worker / Background Jobs

Build a background job processing system.

**What you'll learn:**
- Job queues with RabbitMQ
- Asynchronous job processing
- Status tracking with Redis
- Retry logic and error handling
- Job scheduling

**Difficulty:** Intermediate

```bash
stratix new my-worker --template worker
cd my-worker

# Start infrastructure
docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-management
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start worker
pnpm install
pnpm dev
```

## Learning Path

### 1. Start with REST API

Perfect for beginners. Learn the fundamentals:
- Project structure
- Domain modeling
- CQRS basics
- HTTP endpoints

### 2. Move to Microservices

Once comfortable with basics, explore distributed systems:
- Multiple services
- Event-driven architecture
- Message queues
- Service communication

### 3. Explore Worker

Master background processing:
- Job queues
- Asynchronous processing
- Distributed systems patterns
- Production considerations

## What's Inside

Each template includes:

- **Complete source code** - Production-ready implementation
- **Comprehensive README** - Setup instructions and explanations
- **Tests** - Unit and integration tests
- **Documentation** - Architecture diagrams and code comments
- **Best practices** - Following Stratix conventions

## Template Structure

All templates follow the same architecture:

```
src/
├── domain/              # Pure business logic
│   ├── entities/       # Entities & Aggregates
│   ├── value-objects/  # Immutable values
│   ├── repositories/   # Repository interfaces
│   └── events/         # Domain events
├── application/        # Use case orchestration
│   ├── commands/       # State-changing operations
│   └── queries/        # Read-only operations
└── infrastructure/     # External concerns
    ├── http/          # HTTP controllers
    ├── persistence/   # Database implementations
    └── messaging/     # Message queue integration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for Microservices & Worker)

### Quick Start

```bash
# Create a new project
stratix new my-app --template rest-api

# Install dependencies
cd my-app
pnpm install

# Start development
pnpm dev
```

## Key Concepts

### Domain-Driven Design

Rich domain models with business logic:

```typescript
class Product extends AggregateRoot<'Product'> {
  decreaseStock(quantity: number): void {
    if (this._stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this._stock -= quantity;
    this.record(new StockDecreasedEvent(this.id, quantity));
    this.touch();
  }
}
```

### CQRS Pattern

Separate models for reads and writes:

```typescript
// Command - Changes state
class CreateProduct implements Command<CreateProductInput> {}

// Query - Returns data
class GetProduct implements Query<GetProductInput> {}
```

### Hexagonal Architecture

Dependencies point inward:

```
Infrastructure → Application → Domain
```

Domain layer is pure business logic with no external dependencies.

## Next Steps

After exploring examples:

1. **Build Your Own**
   ```bash
   stratix new my-app
   ```

2. **Read Core Concepts**
   - [Architecture](../core-concepts/architecture.md)
   - [Entities & Aggregates](../core-concepts/entities.md)
   - [CQRS](../core-concepts/cqrs.md)

3. **Write Tests**
   - [Testing Guide](../advanced/testing.md)

## Need Help?

- Check example READMEs for detailed instructions
- Review individual example documentation
- Ask in [GitHub Discussions](https://github.com/stratix/stratix/discussions)
