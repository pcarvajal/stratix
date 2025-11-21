---
sidebar_position: 7
title: Agent Testing
description: Testing strategies for AI agents
---

# Agent Testing

Test AI agents effectively using mocks and assertions.

## MockLLMProvider

```typescript
import { MockLLMProvider } from '@stratix/testing';

const mockProvider = new MockLLMProvider({
  responses: [
    'First response',
    'Second response',
    'Third response'
  ]
});

const agent = new MyAgent(mockProvider);
```

## Basic Testing

```typescript
import { MockLLMProvider } from '@stratix/testing';

describe('CustomerSupportAgent', () => {
  let agent: CustomerSupportAgent;
  let mockProvider: MockLLMProvider;

  beforeEach(() => {
    mockProvider = new MockLLMProvider({
      responses: [
        'To reset your password, click "Forgot Password".'
      ]
    });
    agent = new CustomerSupportAgent(mockProvider);
  });

  it('should provide password reset instructions', async () => {
    const result = await agent.run({
      question: 'How do I reset my password?',
      customerTier: 'free'
    });

    expect(result.isSuccess).toBe(true);
    expect(result.output.answer).toContain('Forgot Password');
  });

  it('should track token usage', async () => {
    const result = await agent.run({
      question: 'Test',
      customerTier: 'premium'
    });

    expect(result.metadata.totalTokens).toBeGreaterThan(0);
  });
});
```

## Testing with AgentTester

```typescript
import { AgentTester } from '@stratix/testing';

describe('ProductRecommendationAgent', () => {
  const tester = new AgentTester(agent);

  it('should recommend products', async () => {
    await tester
      .withInput({ budget: 1000, preferences: 'laptop' })
      .expectSuccess()
      .expectOutput((output) => {
        expect(output.length).toBeGreaterThan(0);
        expect(output[0].price).toBeLessThanOrEqual(1000);
      })
      .run();
  });
});
```

## Testing Error Handling

```typescript
it('should handle LLM errors', async () => {
  const errorProvider = new MockLLMProvider({
    shouldFail: true,
    error: new Error('API rate limit exceeded')
  });

  const agent = new MyAgent(errorProvider);
  const result = await agent.run('test');

  expect(result.isFailure).toBe(true);
  expect(result.error.message).toContain('rate limit');
});
```

## Testing Tool Calls

```typescript
it('should call weather tool', async () => {
  const mockProvider = new MockLLMProvider({
    responses: [
      {
        content: '',
        toolCalls: [
          {
            id: 'call-1',
            name: 'get_weather',
            arguments: JSON.stringify({ location: 'NYC' })
          }
        ]
      }
    ]
  });

  const agent = new WeatherAgent(mockProvider);
  const result = await agent.run('What is the weather in NYC?');

  expect(result.isSuccess).toBe(true);
});
```

## Integration Testing

```typescript
describe('Integration: CustomerServiceFlow', () => {
  it('should handle end-to-end customer query', async () => {
    // Use real provider with test API key
    const provider = new OpenAIProvider({
      apiKey: process.env.TEST_OPENAI_API_KEY!
    });

    const agent = new CustomerSupportAgent(provider);
    const result = await agent.run({
      question: 'How do I reset my password?',
      customerTier: 'premium'
    });

    expect(result.isSuccess).toBe(true);
    expect(result.output.answer).toBeTruthy();
    expect(result.metadata.cost).toBeGreaterThan(0);
  });
});
```

## Best Practices

### 1. Use Mocks for Unit Tests

```typescript
const mockProvider = new MockLLMProvider({
  responses: ['Expected response']
});
```

### 2. Test Error Cases

```typescript
it('should handle invalid input', async () => {
  const result = await agent.run(null);
  expect(result.isFailure).toBe(true);
});
```

### 3. Verify Metadata

```typescript
expect(result.metadata.totalTokens).toBeGreaterThan(0);
expect(result.metadata.cost).toBeGreaterThan(0);
```

### 4. Test with Real Provider (Sparingly)

```typescript
// Only for critical integration tests
const provider = new OpenAIProvider({
  apiKey: process.env.TEST_API_KEY
});
```

## Next Steps

- **[AI Agents Overview](./ai-agents-overview)** - AI agents guide
- **[Creating Agents](./creating-agents)** - Agent creation
- **[LLM Providers](./llm-providers)** - Provider configuration
