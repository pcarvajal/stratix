# @stratix/testing

Test utilities for Stratix applications.

## Installation

```bash
pnpm add -D @stratix/testing
```

## Features

- **MockLLMProvider** - Deterministic LLM responses
- **InMemoryEventBus** - Event bus for testing
- **TestContainer** - DI container for tests
- Helper functions for test entities

## Quick Example

```typescript
import { MockLLMProvider } from '@stratix/testing';

const mockProvider = new MockLLMProvider({
  responses: ['Mocked response'],
  cost: 0.001
});

const agent = new MyAgent(mockProvider);
const result = await agent.execute(input);

// No API calls, deterministic results, zero cost
```

## License

MIT
