# Stratix REST API Application

A complete REST API application built with Stratix, Fastify, and CQRS pattern.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm run dev
```

## Project Structure

```
src/
├── domain/
│   ├── entities/          # Domain entities (Item)
│   └── repositories/      # Repository interfaces
├── application/
│   ├── commands/          # Command handlers (CreateItem)
│   └── queries/           # Query handlers (GetItem, ListItems)
├── infrastructure/
│   ├── persistence/       # Repository implementations
│   └── http/             # HTTP controllers
└── index.ts              # Application bootstrap
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

### Create Item
```bash
POST /items
Content-Type: application/json

{
  "name": "Example Item",
  "description": "This is an example"
}
```

### List Items
```bash
GET /items
```

### Get Item
```bash
GET /items/:id
```

## Architecture

This application follows Clean Architecture principles with:

- **Domain Layer**: Business logic and rules (entities, value objects, domain events)
- **Application Layer**: Use cases and orchestration (commands, queries, handlers)
- **Infrastructure Layer**: External concerns (HTTP, database, message queues)

### CQRS Pattern

Commands and queries are separated:
- **Commands**: Change state (CreateItem, UpdateItem)
- **Queries**: Read state (GetItem, ListItems)

### Domain Events

Domain events are automatically published after successful command execution, enabling event-driven architecture.

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [CQRS Pattern](https://stratix.dev/docs/patterns/cqrs)
- [Domain-Driven Design](https://stratix.dev/docs/architecture/ddd)
