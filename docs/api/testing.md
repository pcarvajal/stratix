# @stratix/testing

Testing utilities for Stratix AI agents, providing mock providers, test harnesses, and assertion helpers for deterministic testing without API calls.

## Installation

```bash
npm install @stratix/testing --save-dev
# or
pnpm add @stratix/testing -D
```

## Features

- **MockLLMProvider**: Deterministic LLM provider for testing without API calls
- **AgentTester**: High-level test harness with timeout handling and assertions
- **Type-safe assertions**: Assert agent results, costs, durations, and errors
- **Test helpers**: Utilities for creating test contexts, measuring time, and more

## Quick Start

### Basic Agent Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AgentTester, createTestContext } from '@stratix/testing';
import { MyAgent } from './MyAgent';

describe('MyAgent', () => {
  let tester: AgentTester;

  beforeEach(() => {
    tester = new AgentTester();
  });

  it('should process input correctly', async () => {
    const agent = new MyAgent();

    // Set mock response
    tester.setMockResponse({
      content: '{"result": "success", "message": "Task completed"}',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    const context = createTestContext();
    const result = await tester.test(agent, { task: 'analyze data' }, context);

    expect(result.passed).toBe(true);
    expect(result.result.isSuccess()).toBe(true);
  });
});
```

### Using Assertions

```typescript
import {
  expectSuccess,
  expectCostWithinBudget,
  expectDurationWithinLimit
} from '@stratix/testing';

it('should complete within budget and time limit', async () => {
  const result = await agent.execute(input);

  // Assert success and narrow type
  expectSuccess(result);
  expect(result.data.status).toBe('completed');

  // Assert performance constraints
  expectCostWithinBudget(result, 0.10); // Max $0.10
  expectDurationWithinLimit(result, 5000); // Max 5 seconds
});
```

## API Reference

### MockLLMProvider

A mock LLM provider that returns deterministic responses for testing.

#### Methods

**setResponse(response: MockResponse)**

Sets a single response that will be returned for all calls.

```typescript
const mockProvider = new MockLLMProvider();

mockProvider.setResponse({
  content: '{"answer": "42"}',
  usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
  finishReason: 'stop',
  delay: 100 // Optional delay in ms
});
```

**setResponses(responses: MockResponse[])**

Sets multiple responses that will be returned in sequence.

```typescript
mockProvider.setResponses([
  { content: 'First response' },
  { content: 'Second response' },
  { content: 'Third response' }
]);
```

**getCallHistory()**

Returns all chat calls made to the provider.

```typescript
const history = mockProvider.getCallHistory();
expect(history).toHaveLength(3);
expect(history[0].messages[0].content).toBe('User prompt');
```

**getCallCount()**

Returns the number of calls made.

```typescript
expect(mockProvider.getCallCount()).toBe(1);
```

**reset()**

Clears all responses and call history.

### AgentTester

High-level testing utility for AI agents.

#### Constructor

```typescript
const tester = new AgentTester({
  timeout: 30000,           // Max execution time (default: 30s)
  enableTracing: true,      // Capture traces (default: true)
  mockProvider: customMock  // Optional custom mock provider
});
```

#### Methods

**test(agent, input, context?)**

Tests an agent with the given input.

```typescript
const result = await tester.test(agent, input, context);

// TestResult<TOutput>
result.result    // AgentResult<TOutput>
result.duration  // Execution time in ms
result.passed    // Boolean success status
result.error     // Error message if failed
```

**setMockResponse(response)**

Sets a single mock response.

**setMockResponses(responses)**

Sets multiple mock responses in sequence.

**assertSuccess(result)**

Asserts that the test result is successful.

```typescript
const result = await tester.test(agent, input);
tester.assertSuccess(result); // Throws if failed
```

**assertFailure(result)**

Asserts that the test result is a failure.

**assertDuration(result, maxDuration)**

Asserts execution time is within limit.

```typescript
tester.assertDuration(result, 5000); // Max 5 seconds
```

**assertCallCount(expectedCount)**

Asserts the mock provider was called N times.

```typescript
tester.assertCallCount(3); // Expects exactly 3 calls
```

**reset()**

Resets the tester state.

### Assertion Helpers

#### expectSuccess(result)

Asserts that the agent result is successful and narrows the type.

```typescript
expectSuccess(result);
// result.data is now guaranteed to be defined
console.log(result.data);
```

#### expectFailure(result)

Asserts that the agent result is a failure.

```typescript
expectFailure(result);
// result.error is now guaranteed to be defined
console.log(result.error.message);
```

#### expectData(result, expected)

Asserts that the result data matches the expected value exactly.

```typescript
expectData(result, { status: 'success', count: 42 });
```

#### expectDataContains(result, expected)

Asserts that the result data contains the expected subset.

```typescript
expectDataContains(result, { status: 'success' });
// Other properties in result.data are ignored
```

#### expectCostWithinBudget(result, budget)

Asserts that execution cost is within budget.

```typescript
expectCostWithinBudget(result, 0.50); // Max $0.50
```

#### expectDurationWithinLimit(result, maxDuration)

Asserts that execution duration is within limit.

```typescript
expectDurationWithinLimit(result, 3000); // Max 3 seconds
```

#### expectErrorContains(result, expectedText)

Asserts that the error message contains the expected text.

```typescript
expectFailure(result);
expectErrorContains(result, 'rate limit');
```

#### expectModel(result, expectedModel)

Asserts that the result uses the expected model.

```typescript
expectModel(result, 'gpt-4');
```

### Test Helpers

#### createTestContext(overrides?)

Creates a test AgentContext with default values.

```typescript
const context = createTestContext({
  userId: 'test-user-123',
  sessionId: 'test-session-456',
  environment: 'development',
  budget: 1.00
});
```

#### createTestAgentId()

Creates a test AgentId.

```typescript
const agentId = createTestAgentId();
```

#### wait(ms)

Waits for a specified duration.

```typescript
await wait(1000); // Wait 1 second
```

#### repeatTest(times, testFn)

Repeats a test function N times.

```typescript
const results = await repeatTest(10, async (iteration) => {
  return await agent.execute(input);
});

expect(results).toHaveLength(10);
```

#### runInParallel(testFns)

Runs tests in parallel.

```typescript
const results = await runInParallel([
  () => agent1.execute(input1),
  () => agent2.execute(input2),
  () => agent3.execute(input3)
]);
```

#### expectToReject(promise, expectedError?)

Asserts that a promise rejects with a specific error.

```typescript
await expectToReject(
  agent.execute(invalidInput),
  'Invalid input format'
);
```

#### measureTime(fn)

Measures execution time of an async function.

```typescript
const { result, duration } = await measureTime(async () => {
  return await agent.execute(input);
});

console.log(`Execution took ${duration}ms`);
```

## Advanced Usage

### Sequential Mock Responses

Test agents that make multiple LLM calls:

```typescript
tester.setMockResponses([
  { content: '{"step": "analyze", "status": "in_progress"}' },
  { content: '{"step": "process", "status": "in_progress"}' },
  { content: '{"step": "complete", "status": "success"}' }
]);

const result = await tester.test(multiStepAgent, input);
tester.assertCallCount(3);
```

### Custom Mock Provider

Create a custom mock provider for advanced scenarios:

```typescript
const customMock = new MockLLMProvider();

customMock.setResponses([
  {
    content: 'Processing...',
    delay: 500,
    usage: { promptTokens: 50, completionTokens: 10, totalTokens: 60 }
  }
]);

const tester = new AgentTester({ mockProvider: customMock });
```

### Performance Testing

Test agent performance constraints:

```typescript
it('should meet performance requirements', async () => {
  const { result, duration } = await measureTime(async () => {
    return await agent.execute(largeInput);
  });

  expectSuccess(result);
  expect(duration).toBeLessThan(5000); // Max 5 seconds
  expectCostWithinBudget(result, 0.10); // Max $0.10
});
```

### Stress Testing

Test agent reliability under load:

```typescript
it('should handle concurrent requests', async () => {
  const results = await repeatTest(100, async (i) => {
    tester.setMockResponse({
      content: `{"result": "success", "iteration": ${i}}`
    });
    return await tester.test(agent, input);
  });

  const successCount = results.filter(r => r.passed).length;
  expect(successCount).toBe(100);
});
```

## Best Practices

1. **Reset between tests**: Always reset the tester or mock provider between tests

```typescript
beforeEach(() => {
  tester.reset();
});
```

2. **Use type-safe assertions**: Prefer `expectSuccess` over manual checks for better type inference

```typescript
// Good
expectSuccess(result);
console.log(result.data.value); // TypeScript knows data exists

// Less ideal
expect(result.isSuccess()).toBe(true);
console.log(result.data.value); // TypeScript may complain
```

3. **Test error paths**: Don't just test success cases

```typescript
it('should handle invalid input gracefully', async () => {
  tester.setMockResponse({
    content: 'Error: Invalid format',
    finishReason: 'stop'
  });

  const result = await tester.test(agent, invalidInput);
  expectFailure(result);
  expectErrorContains(result, 'Invalid format');
});
```

4. **Verify LLM calls**: Check that your agent makes the expected calls

```typescript
const result = await tester.test(agent, input);
const history = tester.getMockProvider().getCallHistory();

expect(history[0].messages[0].content).toContain('expected prompt');
```

## License

MIT
