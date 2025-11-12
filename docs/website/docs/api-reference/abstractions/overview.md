# @stratix/abstractions

Core abstractions and interfaces that define the contracts for Stratix applications.

## Installation

```bash
pnpm add @stratix/abstractions
```

## Repository Pattern

Generic repository interface for data access.

```typescript
import { Repository } from '@stratix/abstractions';
import { User, UserId } from './domain/entities/User';

interface UserRepository extends Repository<User, UserId> {
  findByEmail(email: string): Promise<User | null>;
}
```

**Base Methods**:
- `save(entity: T): Promise<void>`: Save or update an entity
- `findById(id: TId): Promise<T | null>`: Find entity by ID
- `delete(id: TId): Promise<void>`: Delete an entity
- `exists(id: TId): Promise<boolean>`: Check if entity exists

## CQRS Pattern

### Commands

Commands represent write operations that change state.

```typescript
import { Command, CommandHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface CreateUserOutput {
  id: string;
}

export class CreateUser implements Command {
  constructor(public readonly data: CreateUserInput) {}
}

export class CreateUserHandler implements CommandHandler<CreateUser, Result<CreateUserOutput>> {
  constructor(private readonly userRepository: UserRepository) {}

  async handle(command: CreateUser): Promise<Result<CreateUserOutput>> {
    try {
      const user = User.create(command.data.email, command.data.name);
      await this.userRepository.save(user);
      return Success.create({ id: user.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

**Interfaces**:
- `Command`: Marker interface for commands
- `CommandHandler<TCommand, TResult>`: Command handler interface
  - `handle(command: TCommand): Promise<TResult>`

### Queries

Queries represent read operations that don't change state.

```typescript
import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';

export interface GetUserInput {
  id: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export class GetUser implements Query {
  constructor(public readonly data: GetUserInput) {}
}

export class GetUserHandler implements QueryHandler<GetUser, Result<UserDto>> {
  constructor(private readonly userRepository: UserRepository) {}

  async handle(query: GetUser): Promise<Result<UserDto>> {
    try {
      const user = await this.userRepository.findById(EntityId.fromString(query.data.id));

      if (!user) {
        return Failure.create(new Error('User not found'));
      }

      return Success.create({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
```

**Interfaces**:
- `Query`: Marker interface for queries
- `QueryHandler<TQuery, TResult>`: Query handler interface
  - `handle(query: TQuery): Promise<TResult>`

### Command and Query Buses

```typescript
import { CommandBus, QueryBus } from '@stratix/abstractions';

// Register handlers
commandBus.register(CreateUser, createUserHandler);
queryBus.register(GetUser, getUserHandler);

// Dispatch
const createResult = await commandBus.dispatch(new CreateUser({ email: 'user@example.com' }));
const getResult = await queryBus.dispatch(new GetUser({ id: 'user-123' }));
```

**CommandBus API**:
- `register<T extends Command>(command: Constructor<T>, handler: CommandHandler<T, any>): void`
- `dispatch<TResult>(command: Command): Promise<TResult>`

**QueryBus API**:
- `register<T extends Query>(query: Constructor<T>, handler: QueryHandler<T, any>): void`
- `dispatch<TResult>(query: Query): Promise<TResult>`

## Event-Driven Architecture

### Event Handler

```typescript
import { EventHandler } from '@stratix/abstractions';

class UserCreatedEventHandler implements EventHandler<UserCreatedEvent> {
  constructor(private readonly logger: Logger) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    this.logger.info('User created', { userId: event.userId });
    // Send welcome email, etc.
  }
}
```

**Interface**:
- `EventHandler<TEvent>`: Event handler interface
  - `handle(event: TEvent): Promise<void>`

### Event Bus

```typescript
import { EventBus } from '@stratix/abstractions';

// Subscribe to events
eventBus.subscribe(UserCreatedEvent, userCreatedHandler);

// Publish events
await eventBus.publish([new UserCreatedEvent('user-123', 'user@example.com')]);
```

**EventBus API**:
- `subscribe<T extends DomainEvent>(event: Constructor<T>, handler: EventHandler<T>): void`
- `publish(events: DomainEvent[]): Promise<void>`

## Logging

```typescript
import { Logger, LogLevel } from '@stratix/abstractions';

class MyService {
  constructor(private readonly logger: Logger) {}

  async doSomething() {
    this.logger.info('Starting operation', { userId: '123' });
    this.logger.debug('Debug information');
    this.logger.warn('Warning message');
    this.logger.error('Error occurred', { error: new Error() });
  }
}
```

**Logger API**:
- `info(message: string, meta?: Record<string, unknown>): void`
- `debug(message: string, meta?: Record<string, unknown>): void`
- `warn(message: string, meta?: Record<string, unknown>): void`
- `error(message: string, meta?: Record<string, unknown>): void`

**LogLevel**:
- `DEBUG = 0`
- `INFO = 1`
- `WARN = 2`
- `ERROR = 3`

## Dependency Injection

### Container

```typescript
import { Container, ServiceLifetime } from '@stratix/abstractions';

// Register services
container.register('userRepository', () => new InMemoryUserRepository(), {
  lifetime: ServiceLifetime.SINGLETON
});

container.register('createUserHandler', (c) => {
  return new CreateUserHandler(c.resolve('userRepository'));
}, {
  lifetime: ServiceLifetime.SCOPED
});

// Resolve services
const handler = container.resolve<CreateUserHandler>('createUserHandler');
```

**Container API**:
- `register<T>(name: string, factory: (container: Container) => T, options?: RegistrationOptions): void`
- `resolve<T>(name: string): T`
- `has(name: string): boolean`
- `createScope(): Container`

**ServiceLifetime**:
- `SINGLETON`: One instance for the entire application
- `SCOPED`: One instance per scope (request)
- `TRANSIENT`: New instance every time

## Plugin System

```typescript
import { Plugin } from '@stratix/abstractions';

class MyPlugin implements Plugin {
  name = 'my-plugin';

  async onStart(container: Container, config: unknown): Promise<void> {
    // Initialize plugin
  }

  async onStop(): Promise<void> {
    // Cleanup
  }
}
```

**Plugin API**:
- `name: string`: Plugin name
- `onStart(container: Container, config: unknown): Promise<void>`: Called on application start
- `onStop(): Promise<void>`: Called on application shutdown

## See Also

- [CQRS Guide](../../core-concepts/cqrs.md)
- [Architecture Overview](../../core-concepts/architecture.md)
- [Repository Pattern](../../core-concepts/entities.md)
