# @stratix/testing

Comprehensive testing utilities for Stratix applications, with specialized support for AI agents.

## Installation

```bash
pnpm add -D @stratix/testing
```

## Features

### AI Agent Testing

- **MockLLMProvider** - Mock LLM provider for deterministic agent testing
- **AgentTester** - High-level testing utility with timeout support
- **Agent Assertions** - Specialized assertions for agent results
- **Test Helpers** - Utilities for creating test contexts and IDs

### General Testing

- **TestApplication** - Simplified test application builder
- **Result Assertions** - Assertions for Result pattern
- **EntityBuilder** - Fluent API for building test entities
- **DataFactory** - Generate test data (emails, IDs, dates, etc.)

## Quick Examples

### Testing AI Agents

```typescript
import { AgentTester, expectSuccess } from '@stratix/testing';

describe('CustomerSupportAgent', () => {
  let tester: AgentTester;

  beforeEach(() => {
    tester = new AgentTester();
  });

  it('should respond to greetings', async () => {
    const agent = new CustomerSupportAgent(...);

    // Set deterministic mock response
    tester.setMockResponse({
      content: 'Hello! How can I help you today?',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    });

    const result = await tester.test(agent, { message: 'Hi' });

    expect(result.passed).toBe(true);
    expectSuccess(result.result);
    expect(result.duration).toBeLessThan(1000);
  });
});
```

### Using MockLLMProvider Directly

```typescript
import { MockLLMProvider } from '@stratix/testing';

const mockProvider = new MockLLMProvider();
mockProvider.setResponse({
  content: '{"result": "success"}',
  usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
});

const agent = new MyAgent({ provider: mockProvider });
const result = await agent.execute(input);

// Verify calls
expect(mockProvider.getCallCount()).toBe(1);
expect(mockProvider.getLastCall()).toBeDefined();
```

### Testing with TestApplication

```typescript
import { TestApplication } from '@stratix/testing';

describe('Integration Tests', () => {
  let app: Application;

  beforeEach(async () => {
    app = await TestApplication.create()
      .useInMemoryDefaults()
      .usePlugin(myPlugin)
      .build();

    await app.start();
  });

  afterEach(async () => {
    await app.stop();
  });

  it('should process commands', async () => {
    // Test with fully configured app
  });
});
```

### Using Result Assertions

```typescript
import { assertSuccess, unwrapSuccess } from '@stratix/testing';

const result = await commandHandler.execute(command);

// Assert success and throw if failed
assertSuccess(result);

// Or unwrap value directly
const value = unwrapSuccess(result);
expect(value.id).toBeDefined();
```

### Building Test Entities

```typescript
import { EntityBuilder } from '@stratix/testing';

const user = new EntityBuilder(User)
  .withProps({ email: 'test@example.com', name: 'Test User' })
  .withId(testUserId)
  .build();

// Build multiple
const users = new EntityBuilder(User)
  .withProps({ role: 'admin' })
  .buildMany(5);
```

### Generating Test Data

```typescript
import { DataFactory } from '@stratix/testing';

const email = DataFactory.email('user'); // user1@example.com
const id = DataFactory.entityId<'User'>();
const date = DataFactory.date(7); // 7 days ago
const status = DataFactory.pick(['active', 'inactive']);
```

## API Reference

### AgentTester

High-level testing utility for AI agents.

```typescript
class AgentTester {
  constructor(options?: TestOptions)

  // Mock configuration
  setMockResponse(response: MockResponse): void
  setMockResponses(responses: MockResponse[]): void
  getMockProvider(): MockLLMProvider

  // Testing
  test<TInput, TOutput>(
    agent: AIAgent<TInput, TOutput>,
    input: TInput,
    context?: AgentContext
  ): Promise<TestResult<TOutput>>

  // Assertions
  assertSuccess<TOutput>(result: TestResult<TOutput>): void
  assertFailure<TOutput>(result: TestResult<TOutput>): void
  assertDuration<TOutput>(result: TestResult<TOutput>, maxDuration: number): void
  assertCallCount(expectedCount: number): void

  // Utilities
  reset(): void
}
```

### MockLLMProvider

Mock LLM provider implementing the `LLMProvider` interface.

```typescript
class MockLLMProvider implements LLMProvider {
  // Configuration
  setResponse(response: MockResponse): void
  setResponses(responses: MockResponse[]): void
  addResponse(response: MockResponse): void

  // Inspection
  getCallHistory(): ReadonlyArray<ChatParams>
  getLastCall(): ChatParams | undefined
  getCallCount(): number

  // Utilities
  reset(): void

  // LLMProvider implementation
  chat(params: ChatParams): Promise<ChatResponse>
  streamChat(params: ChatParams): AsyncIterable<ChatChunk>
  embeddings(params: EmbeddingParams): Promise<EmbeddingResponse>
}
```

### Agent Assertions

Specialized assertions for agent results.

```typescript
// Success/Failure
expectSuccess<T>(result: AgentResult<T>): void
expectFailure<T>(result: AgentResult<T>): void

// Data validation
expectData<T>(result: AgentResult<T>, expected: T): void
expectDataContains<T>(result: AgentResult<T>, expected: Partial<T>): void

// Performance
expectCostWithinBudget<T>(result: AgentResult<T>, budget: number): void
expectDurationWithinLimit<T>(result: AgentResult<T>, maxDuration: number): void

// Error validation
expectErrorContains<T>(result: AgentResult<T>, expectedText: string): void

// Model validation
expectModel<T>(result: AgentResult<T>, expectedModel: string): void
```

### Test Helpers

Utilities for creating test data and running tests.

```typescript
// Context creation
createTestContext(overrides?: Partial<{
  userId: string;
  sessionId: string;
  environment: 'development' | 'staging' | 'production';
  metadata: Record<string, unknown>;
  budget: number;
}>): AgentContext

// ID creation
createTestAgentId(): AgentId
createDeterministicAgentId(seed: string): AgentId

// Timing utilities
wait(ms: number): Promise<void>
createTimeout(ms: number, message?: string): Promise<never>
measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }>

// Test execution
repeatTest<T>(times: number, testFn: (iteration: number) => Promise<T>): Promise<T[]>
runInParallel<T>(testFns: Array<() => Promise<T>>): Promise<T[]>

// Assertions
expectToReject(promise: Promise<unknown>, expectedError?: string | RegExp): Promise<void>
```

### Result Assertions

Assertions for the Result pattern.

```typescript
// Assertions
assertSuccess<T>(result: Result<T>): void
assertFailure<T>(result: Result<T>): void

// Unwrapping
unwrapSuccess<T>(result: Result<T>): T
unwrapFailure<T>(result: Result<T>): Error
```

### TestApplication

Simplified application builder for integration tests.

```typescript
class TestApplication {
  static create(): TestApplication

  useInMemoryDefaults(): this
  useContainer(container: Container): this
  useLogger(logger: Logger): this
  usePlugin(plugin: Plugin, config?: unknown): this

  build(): Promise<Application>
}

// Helper function
createTestApp(): Promise<Application>
```

### EntityBuilder

Fluent API for building test entities.

```typescript
class EntityBuilder<E extends Entity<any>> {
  constructor(EntityClass: new (props: any, id: any) => E)

  withProps(props: Partial<any>): this
  withId(id: any): this
  build(): E
  buildMany(count: number): E[]
}

// Helper function
entityBuilder<E extends Entity<any>>(
  EntityClass: new (props: any, id: any) => E
): EntityBuilder<E>
```

### DataFactory

Factory for generating test data.

```typescript
class DataFactory {
  static email(prefix?: string): Email
  static string(prefix?: string): string
  static number(min?: number, max?: number): number
  static entityId<T extends string>(): EntityId<T>
  static boolean(): boolean
  static date(daysAgo?: number): Date
  static pick<T>(array: T[]): T
  static reset(): void
}
```

## Best Practices

### AI Agent Testing

1. **Use MockLLMProvider for unit tests** - Avoid real API calls, keep tests fast and deterministic
2. **Test multiple conversation turns** - Use `setResponses()` to test multi-turn interactions
3. **Verify token usage** - Ensure cost tracking works correctly
4. **Test error scenarios** - Use mock responses with errors to test error handling
5. **Check call history** - Verify the agent calls the LLM with correct parameters

### Result Pattern Testing

1. **Always assert before accessing values** - Use `assertSuccess()` or `unwrapSuccess()`
2. **Test both success and failure paths** - Ensure error handling works
3. **Use type-safe assertions** - TypeScript narrows types after assertions

### Integration Testing

1. **Use TestApplication for full stack tests** - Test with real implementations
2. **Clean up after tests** - Always call `app.stop()` in afterEach
3. **Use in-memory defaults** - Faster tests without external dependencies
4. **Test plugin integration** - Verify plugins work together correctly

## Examples

See the `examples/` directory in the repository for complete examples:

- `examples/ai-agents/echo-agent/` - Simple agent testing
- `examples/ai-agents/customer-support/` - Production agent with comprehensive tests
- `examples/rest-api/` - Integration testing with TestApplication

## License

MIT
