# Stratix Modular Monolith

A production-ready modular monolith template with bounded contexts that communicate via events. Designed for teams that want to start with a monolith but maintain the option to extract microservices later.

## Architecture

This template implements a **Modular Monolith** architecture where:

- Each **bounded context** is a self-contained module with its own domain, application, and infrastructure layers
- Contexts communicate only through **integration events** via an event bus
- A **shared kernel** contains common types and contracts agreed upon by multiple contexts
- The monolith runs as a single process but is architected for easy extraction into microservices

### Bounded Contexts

```
src/
├── shared/                      # Shared Kernel
│   ├── events/
│   │   └── IntegrationEvent.ts # Base class for inter-context events
│   └── types/
│       └── CommonTypes.ts       # Shared types (UserId, OrderId, Money, etc.)
│
└── contexts/
    ├── users/                   # Users Bounded Context
    │   └── src/
    │       ├── domain/
    │       │   ├── entities/
    │       │   ├── events/
    │       │   └── repositories/
    │       ├── application/
    │       │   ├── commands/
    │       │   └── queries/
    │       └── infrastructure/
    │           ├── persistence/
    │           └── http/
    │
    └── orders/                  # Orders Bounded Context
        └── src/
            ├── domain/
            ├── application/
            │   └── events/      # Handles events from other contexts
            └── infrastructure/
```

## Key Features

### Event-Driven Communication

Contexts communicate exclusively through integration events:

```typescript
// Users context publishes
await eventBus.publish(
  new UserRegisteredIntegrationEvent(userId, email, name)
);

// Orders context subscribes
eventBus.subscribe(UserRegisteredIntegrationEvent.name, userRegisteredHandler);
```

### Shared Kernel

Common types that multiple contexts need:

```typescript
// Shared across contexts
export type UserId = EntityId<'User'>;
export type OrderId = EntityId<'Order'>;

export interface Money {
  amount: number;
  currency: string;
}
```

### Loose Coupling

Each context:
- Has its own repositories and databases (in memory for this template)
- Cannot directly call code from other contexts
- Communicates only via events
- Can be extracted to a microservice without rewriting business logic

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

### Run Development Server

```bash
pnpm dev
```

The application will start on `http://localhost:3000`.

## Available Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "UP",
  "timestamp": "2024-11-11T20:00:00.000Z",
  "contexts": {
    "users": "UP",
    "orders": "UP"
  }
}
```

### Users Context

#### Register User
```bash
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Get User
```bash
GET /api/users/:id
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "isActive": true,
  "createdAt": "2024-11-11T20:00:00.000Z"
}
```

## Inter-Context Communication Example

When a user registers in the **Users context**:

1. `RegisterUserHandler` creates the user
2. Publishes `UserRegisteredIntegrationEvent` to the event bus
3. **Orders context** receives the event via `UserRegisteredHandler`
4. Orders context can react (e.g., create welcome offer, initialize preferences)

```typescript
// Users context (publisher)
export class RegisterUserHandler {
  async handle(command: RegisterUser): Promise<Result<RegisterUserOutput>> {
    const user = User.create({ email, name, isActive: true });
    await this.userRepository.save(user);

    // Publish integration event
    await this.eventBus.publish(
      new UserRegisteredIntegrationEvent(user.id, user.email, user.name)
    );

    return Success.create({ userId: user.id.toString() });
  }
}

// Orders context (subscriber)
export class UserRegisteredHandler {
  async handle(event: UserRegisteredIntegrationEvent): Promise<void> {
    this.logger.info('Orders context: New user registered', {
      userId: event.userId,
      email: event.email
    });

    // Initialize user's order preferences
    // Create welcome discount
    // Setup customer-specific pricing
    // etc.
  }
}
```

## Adding New Contexts

### 1. Create Context Directory Structure

```bash
mkdir -p src/contexts/new-context/src/{domain,application,infrastructure}
```

### 2. Implement Domain Layer

```typescript
// src/contexts/new-context/src/domain/entities/MyEntity.ts
import { AggregateRoot } from '@stratix/primitives';

export class MyEntity extends AggregateRoot<'MyEntity'> {
  // Your domain logic
}
```

### 3. Define Integration Events

```typescript
// src/contexts/new-context/src/domain/events/MyIntegrationEvent.ts
import { IntegrationEvent } from '../../../../shared/events/IntegrationEvent.js';

export class MyIntegrationEvent extends IntegrationEvent {
  constructor(readonly data: any) {
    super('new-context');
  }

  get eventType(): string {
    return 'new-context.my_event';
  }
}
```

### 4. Register in Bootstrap

```typescript
// src/index.ts
import { MyContextHandler } from './contexts/new-context/...';

// Subscribe to events from other contexts
eventBus.subscribe(SomeEvent.name, new MyContextHandler(logger));

// Publish events to other contexts
await eventBus.publish(new MyIntegrationEvent(data));
```

## Migration to Microservices

When you need to extract a context to a microservice:

### 1. Replace Event Bus

Change from in-memory event bus to RabbitMQ/Kafka:

```typescript
// Before (monolith)
const eventBus = new InMemoryEventBus(logger);

// After (distributed)
import { RabbitMQPlugin } from '@stratix/ext-rabbitmq';
const eventBus = new RabbitMQEventBus(config);
```

### 2. Replace Repositories

Change from in-memory to real databases:

```typescript
// Before (monolith)
const userRepository = new InMemoryUserRepository();

// After (microservice)
import { PostgresPlugin } from '@stratix/ext-postgres';
const userRepository = new PostgresUserRepository(connection);
```

### 3. Extract Context

Copy the entire context directory to a new service:

```bash
# New microservice structure
users-service/
├── src/
│   ├── domain/          # Copy from contexts/users/src/domain
│   ├── application/     # Copy from contexts/users/src/application
│   └── infrastructure/  # Copy from contexts/users/src/infrastructure
└── package.json
```

### 4. Communication Stays the Same

The event-based communication pattern remains identical:

```typescript
// Both monolith and microservice use the same code
await eventBus.publish(new UserRegisteredIntegrationEvent(...));
```

The only difference is the event bus implementation (in-memory vs RabbitMQ).

## Best Practices

### Context Independence

Each context should:
-  Have its own database/tables
-  Publish integration events for other contexts
-  Subscribe to events from other contexts
-  Never import domain code from other contexts
-  Never share repositories or services
-  Never directly access another context's database

### Shared Kernel Guidelines

Only include in shared kernel:
-  Common value objects (Money, Address)
-  Shared IDs (UserId, OrderId)
-  Integration event base classes
-  Business logic
-  Repositories or services
-  Implementation details

### Event Design

Integration events should:
-  Be immutable
-  Include all data subscribers need
-  Have clear, past-tense names (UserRegistered, OrderPlaced)
-  Include correlation IDs for tracing
-  Reference domain entities directly
-  Include too much or too little data

## Testing

### Unit Tests

Test each context independently:

```typescript
describe('RegisterUserHandler', () => {
  it('should publish UserRegisteredIntegrationEvent', async () => {
    const mockEventBus = new MockEventBus();
    const handler = new RegisterUserHandler(repository, mockEventBus);

    await handler.handle({ data: { email: 'test@example.com', name: 'Test' } });

    expect(mockEventBus.published).toContain(UserRegisteredIntegrationEvent);
  });
});
```

### Integration Tests

Test inter-context communication:

```typescript
describe('User Registration Flow', () => {
  it('should notify orders context when user registers', async () => {
    const eventBus = new InMemoryEventBus(logger);
    const mockHandler = jest.fn();

    eventBus.subscribe(UserRegisteredIntegrationEvent.name, { handle: mockHandler });

    const userHandler = new RegisterUserHandler(userRepo, eventBus);
    await userHandler.handle({ data: { email: 'test@example.com', name: 'Test' } });

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
  });
});
```

## Scripts

- `pnpm dev` - Development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm typecheck` - Type check
- `pnpm lint` - Lint code
- `pnpm format` - Format code

## Learn More

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
- [Modular Monolith](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- [Integration Events](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/multi-container-microservice-net-applications/integration-event-based-microservice-communications)

## Architecture Decision Records (ADRs)

### Why Event-Driven Communication?

**Decision**: Use event bus for all inter-context communication.

**Rationale**:
- Loose coupling between contexts
- Easy migration to distributed events (RabbitMQ/Kafka)
- Auditable communication trail
- Asynchronous by default (better performance)

**Consequences**:
- Eventual consistency between contexts
- Need to handle event failures
- More complex debugging

### Why Shared Kernel?

**Decision**: Create shared package for common types.

**Rationale**:
- Some types (UserId, Money) are universally needed
- Agreement on these types is low-risk
- Reduces duplication

**Consequences**:
- Must be careful not to bloat shared kernel
- Changes to shared kernel affect multiple contexts
- Clear ownership and versioning required

## Troubleshooting

### Event Not Received

Check that:
1. Event is published: `await eventBus.publish(event)`
2. Handler is subscribed: `eventBus.subscribe(EventName, handler)`
3. Handler is registered before event is published

### Context Cannot Find Type

Make sure you're importing from shared kernel:

```typescript
// Correct
import { UserId } from '../../../shared/types/CommonTypes.js';

// Incorrect
import { UserId } from '../other-context/domain/...'; // Never import from other contexts!
```

### Circular Dependencies

If you get circular dependency errors:
1. Check that contexts don't import from each other
2. Move shared types to shared kernel
3. Use integration events instead of direct imports

## Next Steps

1. Add more bounded contexts (Products, Payments, Shipping)
2. Replace in-memory repositories with PostgreSQL
3. Replace in-memory event bus with RabbitMQ
4. Add API Gateway for external access
5. Extract high-traffic contexts to microservices
6. Add distributed tracing (OpenTelemetry)
7. Implement saga pattern for distributed transactions

## Contributing

This is a template. Customize it for your needs. Common modifications:

- Add authentication/authorization
- Add API versioning
- Add rate limiting
- Add GraphQL instead of REST
- Add event sourcing
- Add CQRS read models
