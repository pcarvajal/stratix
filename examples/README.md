# Stratix Examples

Production-ready examples demonstrating Stratix patterns and best practices.

## Available Examples

### REST API
Basic REST API with DDD/CQRS patterns.

**Quick Start:**
```bash
cd rest-api
pnpm install && pnpm dev
```

**Features:**
- Domain-Driven Design
- CQRS pattern
- Hexagonal architecture
- HTTP API with Fastify
- In-memory persistence

[View REST API Example](./rest-api/README.md)

### Microservices
Event-driven architecture with independent services.

**Quick Start:**
```bash
# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-management

# Start services
cd microservices/order-service && pnpm dev
cd microservices/inventory-service && pnpm dev
```

**Features:**
- Service independence
- Asynchronous messaging
- Event-driven communication
- Fault tolerance

[View Microservices Example](./microservices/README.md)

### Worker
Background job processing system.

**Quick Start:**
```bash
# Start infrastructure
docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-management
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start worker
cd worker && pnpm install && pnpm dev
```

**Features:**
- Asynchronous job processing
- Job queues with RabbitMQ
- Status tracking with Redis
- Retry logic

[View Worker Example](./worker/README.md)

### AI Agents

Production AI agent examples.

**Customer Support:**
```bash
cd ai-agents/customer-support
pnpm install && pnpm start
```

**Data Analysis:**
```bash
cd ai-agents/data-analysis
pnpm install && pnpm start
```

## Learning Path

1. **Beginner** - Start with REST API to learn DDD and CQRS basics
2. **Intermediate** - Move to Microservices for event-driven architecture
3. **Advanced** - Explore Worker for background processing patterns

## Requirements

- Node.js 18+
- pnpm 8+
- Docker (for Microservices & Worker)

## Architecture

All examples follow:
```
src/
├── domain/           # Business logic
│   ├── entities/
│   ├── value-objects/
│   └── repositories/
├── application/      # Use cases
│   ├── commands/
│   └── queries/
└── infrastructure/   # External concerns
    ├── http/
    └── persistence/
```

## Testing

```bash
# Run tests
pnpm test

# With coverage
pnpm test:coverage
```

## License

MIT
