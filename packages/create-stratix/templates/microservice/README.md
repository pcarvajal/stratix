# Stratix Microservice Application

A microservice application built with Stratix, Fastify, CQRS, and RabbitMQ.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start RabbitMQ (using Docker):

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Start development server:

```bash
pnpm run dev
```

## Project Structure

```
src/
├── domain/
│   ├── entities/          # Domain entities (Task)
│   ├── events/           # Domain events
│   └── repositories/     # Repository interfaces
├── application/
│   ├── commands/         # Command handlers
│   ├── queries/          # Query handlers
│   └── events/           # Event handlers
├── infrastructure/
│   ├── persistence/      # Repository implementations
│   └── http/            # HTTP controllers
└── index.ts             # Application bootstrap
```

## Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm run typecheck` - Type check without emitting
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## API Endpoints

### Health Check
```bash
GET /health
```

### Create Task
```bash
POST /tasks
Content-Type: application/json

{
  "title": "Example Task",
  "description": "This is an example task"
}
```

### Get Task
```bash
GET /tasks/:id
```

## Environment Variables

```bash
PORT=3000                                    # HTTP server port
RABBITMQ_URL=amqp://localhost:5672          # RabbitMQ connection URL
```

## Architecture

This microservice implements:

- **Clean Architecture**: Domain, Application, and Infrastructure layers
- **CQRS Pattern**: Separate command and query handlers
- **Event-Driven**: Publishes domain events to RabbitMQ
- **Hexagonal Architecture**: Ports and adapters pattern

### Message Queue

RabbitMQ is used for:
- Publishing domain events (task.created, task.completed)
- Consuming events from other services
- Asynchronous inter-service communication

### Domain Events

Events are automatically published to RabbitMQ after successful commands:
- `TaskCreatedEvent` - Published when a task is created
- `TaskCompletedEvent` - Published when a task is completed

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Microservices Pattern](https://stratix.dev/docs/patterns/microservices)
- [Event-Driven Architecture](https://stratix.dev/docs/architecture/event-driven)
- [RabbitMQ Plugin](https://stratix.dev/docs/extensions/rabbitmq)
