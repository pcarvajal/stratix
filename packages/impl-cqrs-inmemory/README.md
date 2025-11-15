# @stratix/impl-cqrs-inmemory

In-memory implementation of CQRS buses.

## Installation

```bash
pnpm add @stratix/impl-cqrs-inmemory
```

## What's Included

- **InMemoryCommandBus** - Command execution
- **InMemoryQueryBus** - Query execution
- **InMemoryEventBus** - Event publishing/subscription

## Quick Example

```typescript
import { InMemoryEventBus } from '@stratix/impl-cqrs-inmemory';

const eventBus = new InMemoryEventBus();

eventBus.subscribe(UserCreatedEvent, async (event) => {
  console.log('User created:', event.userId);
});

await eventBus.publish(new UserCreatedEvent('123'));
```

## License

MIT
