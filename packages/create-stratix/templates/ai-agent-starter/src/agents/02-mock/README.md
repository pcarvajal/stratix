# Level 2: Mock Agent

## Overview

The Mock Agent demonstrates how to test AI agents without making real LLM API calls. It uses a mock LLM provider that simulates responses deterministically.

## What You'll Learn

1. **LLM Provider Pattern**
   - How agents interact with LLM providers
   - Provider abstraction for multi-model support
   - Request/response structure

2. **Testing Strategies**
   - Using mock providers for tests
   - Deterministic responses
   - Cost and token simulation
   - Latency simulation

3. **Provider Configuration**
   - Setting up mock responses
   - Configuring costs and tokens
   - Simulating failures
   - Resetting state

4. **Production Patterns**
   - Switching between mock and real providers
   - Testing before deploying
   - CI/CD integration
   - Cost estimation

## Key Concepts

### LLM Provider Interface

All LLM providers implement the same interface:
```typescript
interface LLMProvider {
  complete(request: LLMRequest): Promise<LLMResponse>;
  stream(request: LLMRequest): AsyncGenerator<LLMResponse>;
}
```

### Mock Provider Benefits

1. **No API Key Required**: Test without credentials
2. **Zero Cost**: Run unlimited tests for free
3. **Deterministic**: Same input = same output
4. **Fast**: No network latency
5. **Offline**: Works without internet
6. **Controllable**: Simulate any scenario

### Request Structure

```typescript
const request: LLMRequest = {
  messages: [
    { role: 'system', content: 'You are...' },
    { role: 'user', content: 'Hello!' }
  ],
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 500
};
```

### Response Structure

```typescript
const response: LLMResponse = {
  id: 'mock-123',
  model: 'mock-gpt-4',
  choices: [{
    message: { role: 'assistant', content: '...' },
    finishReason: 'stop'
  }],
  usage: {
    promptTokens: 30,
    completionTokens: 70,
    totalTokens: 100,
    totalCost: 0.001
  }
};
```

## Running the Example

From the project root:
```bash
pnpm run example:mock
```

Or run the interactive menu:
```bash
pnpm start
# Select "2. Mock Agent"
```

## What It Does

1. Creates a mock LLM provider with predefined responses
2. Creates a Mock Agent using the provider
3. Executes multiple test cases
4. Shows cost and token tracking
5. Demonstrates deterministic behavior
6. Tests with different configurations

## Example Output

```
=== Level 2: Mock Agent ===

This agent uses a mock LLM provider for testing.
- No API key required
- Deterministic responses
- Perfect for testing

Test 1: Simple question
  Input: "What is the weather today?"
  Output: "Based on current data, the weather is sunny and warm!"
  Tokens: 100 (30 prompt + 70 completion)
  Cost: $0.0010
  Duration: 50ms

Test 2: Complex question
  Input: "Explain quantum computing"
  Output: "Quantum computing uses quantum mechanics principles..."
  Tokens: 100 (30 prompt + 70 completion)
  Cost: $0.0010
  Duration: 45ms

Statistics:
  Total Executions: 2
  Total Cost: $0.0020 (simulated)
  Average Duration: 47.5ms
```

## Configuration Options

### Basic Configuration
```typescript
const provider = new MockLLMProvider({
  responses: [
    'First response',
    'Second response',
    'Third response'
  ]
});
```

### With Cost Simulation
```typescript
const provider = new MockLLMProvider({
  costPerRequest: 0.05,      // $0.05 per request
  tokensPerRequest: 1000     // Report 1000 tokens
});
```

### With Latency Simulation
```typescript
const provider = new MockLLMProvider({
  latencyMs: 500  // Simulate 500ms network delay
});
```

### With Failure Simulation
```typescript
const provider = new MockLLMProvider({
  failureRate: 0.1  // 10% of requests will fail
});
```

## Use Cases

### 1. Unit Testing
```typescript
describe('MyAgent', () => {
  it('should handle greetings', async () => {
    const provider = new MockLLMProvider({
      responses: ['Hello! How can I help you?']
    });

    const agent = new MyAgent(provider);
    const result = await agent.execute({ message: 'Hi' });

    expect(result.isSuccess()).toBe(true);
    expect(result.data.response).toContain('Hello');
  });
});
```

### 2. Cost Estimation
```typescript
const provider = new MockLLMProvider({
  costPerRequest: 0.02  // Real GPT-4 cost estimate
});

// Run 100 test executions
for (let i = 0; i < 100; i++) {
  await agent.execute(testInput);
}

const stats = await auditLog.getStatistics();
console.log(`Estimated cost: $${stats.totalCost}`);
```

### 3. Load Testing
```typescript
const provider = new MockLLMProvider({
  latencyMs: 1000  // Simulate 1s API latency
});

// Test with high concurrency
const promises = Array.from({ length: 100 }, () =>
  orchestrator.executeAgent(agentId, input, context)
);

await Promise.all(promises);
```

### 4. Failure Handling
```typescript
const provider = new MockLLMProvider({
  failureRate: 0.5  // 50% failure rate
});

// Test retry logic
const result = await orchestrator.executeAgent(
  agentId,
  input,
  context,
  { retries: 3 }
);
```

## Switching to Real Provider

When ready for production, just swap the provider:

```typescript
// Development/Testing
const provider = new MockLLMProvider({
  responses: ['Test response']
});

// Production
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY
});

// Agent code stays the same!
const agent = new MyAgent(provider);
```

## Exercises

1. **Add Custom Responses**
   ```typescript
   const provider = new MockLLMProvider({
     responses: [
       'Response 1',
       'Response 2',
       'Response 3'
     ]
   });

   // Run 5 times - responses will cycle
   ```

2. **Test Error Handling**
   ```typescript
   const provider = new MockLLMProvider({
     failureRate: 1.0  // Always fail
   });

   const result = await agent.execute(input);
   // Verify error handling works
   ```

3. **Measure Performance**
   ```typescript
   const provider = new MockLLMProvider({
     latencyMs: 2000  // 2 second delay
   });

   const start = Date.now();
   await agent.execute(input);
   const duration = Date.now() - start;

   console.log(`Duration: ${duration}ms`);
   ```

4. **Calculate Costs**
   ```typescript
   const provider = new MockLLMProvider({
     costPerRequest: 0.02  // GPT-4 cost
   });

   // Run your workflow
   const stats = await auditLog.getStatistics();
   console.log(`Total cost: $${stats.totalCost}`);
   ```

## Next Steps

Once you understand Mock Agent, you're ready for Level 3:
- **Basic LLM** - Use a real LLM provider (OpenAI or Anthropic)
- Requires API key
- Real costs (but very small)
- See `../03-basic-llm/README.md`

## Questions?

**Q: Why use a mock provider?**
A: Testing, development, CI/CD, cost estimation, offline work.

**Q: Is this only for testing?**
A: Primarily, but also useful for demos and development.

**Q: How accurate is the cost simulation?**
A: Configure it to match real provider pricing for accuracy.

**Q: Can I use this in production?**
A: No, mock providers don't provide real AI responses.

**Q: What about the @stratix/testing package?**
A: This shows you how mocking works. The @stratix/testing package provides production-ready mocks.
