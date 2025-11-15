# @stratix/abstractions

Pure TypeScript interfaces with zero runtime code.

## Installation

```bash
pnpm add @stratix/abstractions
```

## What's Included

### Dependency Injection

- **Container** - Dependency injection container interface
- **Token** - Type-safe dependency tokens
- **Factory** - Factory function types for service creation
- **ServiceLifetime** - Service lifetime scopes (Singleton, Transient, Scoped)
- **RegisterOptions** - Service registration configuration

### CQRS and Messaging

- **Command** - Command interface for state changes
- **CommandHandler** - Command handler interface
- **CommandBus** - Command bus for dispatching commands
- **Query** - Query interface for data retrieval
- **QueryHandler** - Query handler interface
- **QueryBus** - Query bus for dispatching queries
- **Event** - Event interface for domain events
- **EventHandler** - Event handler interface
- **EventBus** - Event bus for publishing and subscribing to events

### Infrastructure

- **Logger** - Logging interface (info, warn, error, debug)
- **LogLevel** - Log level enumeration
- **Repository** - Data persistence abstraction
- **UnitOfWork** - Transaction management interface
- **HealthCheck** - Health check interface
- **HealthCheckResult** - Health check result type
- **HealthStatus** - Health status enumeration

### Plugin System

- **Plugin** - Plugin lifecycle interface (initialize, start, stop, healthCheck)
- **PluginContext** - Context provided to plugins during initialization
- **PluginMetadata** - Plugin metadata (name, version, dependencies)

### AI Agents

- **AgentOrchestrator** - Interface for managing AI agent lifecycle and execution
- **AgentExecutionContext** - Context for agent execution
- **AgentExecutionResult** - Result of agent execution

## Usage Examples

### Logger Interface

```typescript
import type { Logger, LogLevel } from '@stratix/abstractions';

class MyService {
  constructor(private logger: Logger) {}

  doSomething(): void {
    this.logger.info('Operation started');
    this.logger.debug('Debug information', { userId: 123 });
    this.logger.error('Something went wrong', new Error('Failed'));
  }
}
```

### Repository Pattern

```typescript
import type { Repository } from '@stratix/abstractions';
import { EntityId } from '@stratix/primitives';

interface User {
  id: EntityId<'User'>;
  email: string;
  name: string;
}

class UserService {
  constructor(private userRepository: Repository<User, EntityId<'User'>>) {}

  async getUser(id: EntityId<'User'>): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async saveUser(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}
```

### Command Handler

```typescript
import type { Command, CommandHandler } from '@stratix/abstractions';
import { Success, type Result } from '@stratix/primitives';

interface CreateUserCommand extends Command {
  email: string;
  name: string;
}

class CreateUserHandler implements CommandHandler<CreateUserCommand, string> {
  async handle(command: CreateUserCommand): Promise<Result<string>> {
    // Handle command logic
    const userId = 'user-123';
    return Success.create(userId);
  }
}
```

### Event Bus

```typescript
import type { Event, EventHandler, EventBus } from '@stratix/abstractions';

interface UserCreatedEvent extends Event {
  userId: string;
  email: string;
}

class EmailNotificationHandler implements EventHandler<UserCreatedEvent> {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Send welcome email
  }
}

// Subscribe to events
eventBus.subscribe('UserCreated', new EmailNotificationHandler());

// Publish events
await eventBus.publish({
  type: 'UserCreated',
  userId: '123',
  email: 'user@example.com',
  timestamp: new Date(),
});
```

### Plugin Interface

```typescript
import type { Plugin, PluginContext, HealthCheckResult } from '@stratix/abstractions';
import { HealthStatus } from '@stratix/abstractions';

export class DatabasePlugin implements Plugin {
  readonly metadata = {
    name: 'database',
    version: '1.0.0',
    description: 'Database plugin',
    dependencies: ['logger']
  };

  async initialize(context: PluginContext): Promise<void> {
    // Register services
    context.container.register('db', () => new Database());
  }

  async start(): Promise<void> {
    // Start database connection
  }

  async stop(): Promise<void> {
    // Close database connection
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return { status: HealthStatus.UP };
  }
}
```

## Why Abstractions?

All Stratix packages depend on abstractions, not implementations. This enables:

- **Dependency Inversion** - High-level modules don't depend on low-level modules
- **Swappable Implementations** - Switch implementations without changing code
- **Easy Testing** - Mock interfaces for unit tests
- **Zero Coupling** - No runtime dependencies between layers
- **Tree-shakeable** - Only import types, zero runtime code
- **Framework Agnostic** - Use any implementation you prefer

## Zero Runtime Code

This package contains only TypeScript interfaces and types. It compiles to zero JavaScript code, making it perfect for defining contracts between layers without adding bundle size.

## License

MIT
