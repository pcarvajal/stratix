# Troubleshooting Guide

Common issues and solutions when working with Stratix AI Agent Framework.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Build Errors](#build-errors)
- [Runtime Errors](#runtime-errors)
- [LLM Provider Issues](#llm-provider-issues)
- [Performance Issues](#performance-issues)
- [Testing Issues](#testing-issues)
- [Memory Issues](#memory-issues)
- [Debugging Tips](#debugging-tips)

---

## Installation Issues

### Error: Cannot find module '@stratix/core'

**Symptoms:**

```
Error: Cannot find module '@stratix/core'
```

**Cause:** Package not installed or workspace not linked properly.

**Solution:**

```bash
# Install all dependencies
pnpm install

# If using workspace, ensure pnpm-workspace.yaml is configured
# packages/*/package.json should have "workspace:*" dependencies

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: Peer dependency version mismatch

**Symptoms:**

```
WARN  Issues with peer dependencies found
├─┬ @stratix/ai-runtime
│ └── ✕ missing peer @stratix/core@^0.1.0
```

**Solution:**

```bash
# Install all peer dependencies
pnpm add @stratix/core @stratix/core

# Or use --force to override
pnpm install --force
```

### TypeScript version incompatibility

**Symptoms:**

```
error TS2307: Cannot find module '@stratix/core' or its corresponding type declarations.
```

**Solution:**

```bash
# Ensure TypeScript version >= 5.0
npm install typescript@^5.0 --save-dev

# Rebuild packages
pnpm -r build
```

---

## Build Errors

### Error: Property 'X' does not exist on type 'Y'

**Symptoms:**

```typescript
error TS2339: Property 'data' does not exist on type 'AgentResult<Output>'.
```

**Cause:** Not checking result success status before accessing data.

**Solution:**

```typescript
// Bad
const result = await agent.execute(input);
console.log(result.data); // Error: data might be undefined

// Good
const result = await agent.execute(input);
if (result.isSuccess()) {
  console.log(result.data); // TypeScript knows data exists
}
```

### Error: Type 'unknown' is not assignable to type 'T'

**Symptoms:**

```typescript
error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'MyType'.
```

**Cause:** Using orchestrator without proper type casting.

**Solution:**

```typescript
// Bad
const result = await orchestrator.executeAgent(agentId, input, context);
console.log(result.data.someField); // Error: result.data is unknown

// Good
const result = await orchestrator.executeAgent(agentId, input, context);
if (result.isSuccess()) {
  const data = result.data as MyOutputType;
  console.log(data.someField);
}
```

### Error: Argument of type 'string' is not assignable to parameter of type 'Error'

**Symptoms:**

```typescript
error TS2345: Argument of type 'string' is not assignable to parameter of type 'Error'.
```

**Cause:** Using string instead of Error object with AgentResult.failure.

**Solution:**

```typescript
// Bad
return AgentResult.failure('Something went wrong', metadata);

// Good
return AgentResult.failure(
  new Error('Something went wrong'),
  metadata
);

// Or preserve original error
catch (error) {
  return AgentResult.failure(
    error instanceof Error ? error : new Error(String(error)),
    metadata
  );
}
```

### Error: Invalid tool input

**Symptoms:**

```typescript
Error: Invalid input: expected object with required properties
```

**Cause:** Tool validation failed due to incorrect input format.

**Solution:**

```typescript
// Implement proper validation in your AgentTool
class MyTool extends AgentTool<Input, Output> {
  async validate(input: unknown): Promise<Input> {
    if (typeof input !== 'object' || !input) {
      throw new Error('Invalid input: expected object');
    }
    // Add specific property checks
    if (!('query' in input)) {
      throw new Error('Invalid input: query property required');
    }
    return input as Input;
  }
}
```

---

## Runtime Errors

### Error: Budget exceeded

**Symptoms:**

```
Error: Budget exceeded: cost $1.25 exceeds budget $1.00
```

**Cause:** Agent execution cost exceeded the budget limit.

**Solution:**

```typescript
// Increase budget
context.setBudget(2.0);

// Or disable budget enforcement
const orchestrator = new StratixAgentOrchestrator(repository, auditLog, provider, {
  budgetEnforcement: false,
});

// Or check remaining budget before execution
if (context.getRemainingBudget() < 0.1) {
  console.warn('Low budget remaining');
}
```

### Error: Test timeout after 30000ms

**Symptoms:**

```
Error: Test timeout after 30000ms
```

**Cause:** Agent execution took longer than timeout limit.

**Solution:**

```typescript
// Increase timeout
const tester = new AgentTester({
  timeout: 60000, // 60 seconds
});

// Or in orchestrator
const orchestrator = new StratixAgentOrchestrator(repository, auditLog, provider, {
  timeout: 60000,
});
```

### Error: No mock responses configured

**Symptoms:**

```
Error: No mock responses configured. Use setResponse() or setResponses()
```

**Cause:** Using MockLLMProvider without setting responses.

**Solution:**

```typescript
const mockProvider = new MockLLMProvider();

// Set response before using
mockProvider.setResponse({
  content: '{"result": "success"}',
  usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
});

const result = await mockProvider.chat({ ... });
```

### Error: Agent not found

**Symptoms:**

```
Error: Agent with ID 'agent-123' not found
```

**Cause:** Agent not registered with orchestrator.

**Solution:**

```typescript
// Register before executing
await orchestrator.registerAgent(agent);

// Then execute
const result = await orchestrator.executeAgent(agent.id, input, context);
```

---

## LLM Provider Issues

### Error: Invalid API key

**Symptoms:**

```
Error: Incorrect API key provided
```

**Cause:** API key is missing, invalid, or expired.

**Solution:**

```typescript
// Check environment variables
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);

// Use correct key
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
});

// For development, create .env file
// OPENAI_API_KEY=sk-...
// ANTHROPIC_API_KEY=sk-ant-...
```

### Error: Rate limit exceeded

**Symptoms:**

```
Error: Rate limit reached for requests
```

**Cause:** Too many requests to LLM provider.

**Solution:**

```typescript
// Add retry with exponential backoff
const orchestrator = new StratixAgentOrchestrator(repository, auditLog, provider, {
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
});

// Or implement custom retry logic
async function executeWithRetry(agent, input, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await agent.execute(input);
    } catch (error) {
      if (error.message.includes('rate_limit') && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
}
```

### Error: Model not found

**Symptoms:**

```
Error: The model 'gpt-5' does not exist
```

**Cause:** Invalid model name.

**Solution:**

```typescript
// Use valid model names
const validOpenAIModels = ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];

const validAnthropicModels = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307',
];

// Check provider.models
console.log('Available models:', provider.models);
```

### Error: Context length exceeded

**Symptoms:**

```
Error: This model's maximum context length is 8192 tokens
```

**Cause:** Input messages exceed model's token limit.

**Solution:**

```typescript
// Truncate messages
function truncateMessages(messages, maxTokens = 6000) {
  // Keep system message and recent messages
  const systemMessages = messages.filter((m) => m.role === 'system');
  const otherMessages = messages.filter((m) => m.role !== 'system');

  return [
    ...systemMessages,
    ...otherMessages.slice(-10), // Keep last 10 messages
  ];
}

// Use model with larger context
const response = await provider.chat({
  model: 'gpt-4-turbo', // 128k context
  messages: truncateMessages(messages),
});

// Or clear context periodically
if (context.getMessages().length > 20) {
  context.clear(); // Implement clear method
}
```

---

## Performance Issues

### Slow agent execution

**Symptoms:** Agent takes too long to execute.

**Diagnosis:**

```typescript
// Measure execution time
const start = Date.now();
const result = await agent.execute(input);
const duration = Date.now() - start;

console.log(`Execution took ${duration}ms`);

// Check execution trace
if (result.metadata.steps) {
  result.metadata.steps.forEach((step) => {
    console.log(`${step.type}: ${step.duration}ms`);
  });
}
```

**Solutions:**

1. **Use faster models:**

```typescript
// Instead of gpt-4
model: 'gpt-3.5-turbo'; // Much faster

// Instead of claude-3-opus
model: 'claude-3-haiku-20240307'; // Much faster
```

2. **Reduce token usage:**

```typescript
// Limit max tokens
maxTokens: 500; // Instead of 2000

// Shorter prompts
messages: [{ role: 'user', content: 'Summarize briefly: ...' }];
```

3. **Parallel execution:**

```typescript
// Execute multiple agents in parallel
const results = await Promise.all([
  orchestrator.executeAgent(agent1.id, input1, context1),
  orchestrator.executeAgent(agent2.id, input2, context2),
  orchestrator.executeAgent(agent3.id, input3, context3),
]);
```

4. **Caching:**

```typescript
// Cache results
const cache = new Map<string, AgentResult<Output>>();

async function executeWithCache(agent, input) {
  const key = JSON.stringify(input);

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const result = await agent.execute(input);
  cache.set(key, result);
  return result;
}
```

### High costs

**Symptoms:** LLM costs are too high.

**Solutions:**

1. **Use cheaper models:**

```typescript
// GPT-3.5 instead of GPT-4
model: 'gpt-3.5-turbo'; // 30x cheaper

// Claude Haiku instead of Opus
model: 'claude-3-haiku-20240307'; // 60x cheaper
```

2. **Set token limits:**

```typescript
const response = await provider.chat({
  model: 'gpt-4',
  maxTokens: 500, // Limit output
  messages: [...]
});
```

3. **Monitor costs:**

```typescript
// Track costs
const stats = await auditLog.getStatistics(agentId);
console.log(`Total cost: $${stats.totalCost.toFixed(2)}`);
console.log(`Average cost: $${stats.averageCost.toFixed(4)}`);

// Set alerts
if (stats.totalCost > 10.0) {
  console.warn('Cost threshold exceeded!');
}
```

4. **Use budget enforcement:**

```typescript
context.setBudget(1.0); // Hard limit

const orchestrator = new StratixAgentOrchestrator(repository, auditLog, provider, {
  budgetEnforcement: true,
});
```

### Memory leaks

**Symptoms:** Memory usage grows over time.

**Diagnosis:**

```bash
# Monitor memory usage
node --expose-gc --max-old-space-size=4096 your-app.js

# Use heap snapshot
const v8 = require('v8');
const fs = require('fs');

const snapshot = v8.writeHeapSnapshot();
console.log('Heap snapshot written to:', snapshot);
```

**Solutions:**

1. **Clear context periodically:**

```typescript
// Clear message history
if (context.getMessages().length > 100) {
  const recentMessages = context.getMessages().slice(-20);
  context.clearMessages();
  recentMessages.forEach((m) => context.addMessage(m));
}
```

2. **Limit audit log size:**

```typescript
class BoundedAuditLog extends InMemoryExecutionAuditLog {
  private maxSize = 1000;

  async log(execution: AgentExecution): Promise<void> {
    await super.log(execution);

    // Remove old entries
    const executions = await this.findByAgent(execution.agentId);
    if (executions.length > this.maxSize) {
      // Remove oldest
      executions
        .slice(0, executions.length - this.maxSize)
        .forEach((e) => this.delete(e.executionId));
    }
  }
}
```

3. **Use WeakMap for caching:**

```typescript
const cache = new WeakMap<Object, AgentResult<Output>>();
```

---

## Testing Issues

### Tests are flaky

**Symptoms:** Tests pass sometimes and fail other times.

**Cause:** Using real LLM provider instead of mocks.

**Solution:**

```typescript
// Bad: Real provider
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });

// Good: Mock provider
import { MockLLMProvider } from '@stratix/testing';

const mockProvider = new MockLLMProvider();
mockProvider.setResponse({
  content: 'Deterministic response',
  usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
});
```

### Mock responses not working

**Symptoms:** Tests fail because mock responses aren't being used.

**Cause:** Not injecting mock provider into agent.

**Solution:**

```typescript
// Ensure agent uses mock provider
const mockProvider = new MockLLMProvider();
mockProvider.setResponse({ content: '{"result": "success"}' });

// Inject mock provider
const agent = new MyAgent(mockProvider); // Not real provider

const result = await agent.execute(input);
```

### Cannot verify tool calls

**Symptoms:** Need to verify that specific tools were called.

**Solution:**

```typescript
// Use mock provider's call history
const mockProvider = new MockLLMProvider();
mockProvider.setResponse({
  content: '{"result": "success"}',
  toolCalls: [{ name: 'calculator', arguments: { expression: '2+2' } }],
});

await agent.execute(input);

// Verify calls
const history = mockProvider.getCallHistory();
expect(history).toHaveLength(1);
expect(history[0].tools).toBeDefined();
expect(history[0].tools![0].function.name).toBe('calculator');
```

---

## Memory Issues

### Context growing too large

**Symptoms:** Memory usage increases with each agent execution.

**Solution:**

```typescript
// Implement message limit
class BoundedContext extends AgentContext {
  private maxMessages = 50;

  addMessage(message: AgentMessage): void {
    super.addMessage(message);

    const messages = this.getMessages();
    if (messages.length > this.maxMessages) {
      // Keep system messages and recent messages
      const systemMsgs = messages.filter((m) => m.role === 'system');
      const otherMsgs = messages
        .filter((m) => m.role !== 'system')
        .slice(-this.maxMessages + systemMsgs.length);

      this.clearMessages();
      [...systemMsgs, ...otherMsgs].forEach((m) => super.addMessage(m));
    }
  }
}
```

### Audit log consuming too much memory

**Symptoms:** InMemoryExecutionAuditLog grows indefinitely.

**Solution:**

```typescript
// Use bounded audit log or persistent storage
class BoundedAuditLog extends InMemoryExecutionAuditLog {
  private maxExecutions = 1000;

  async log(execution: AgentExecution): Promise<void> {
    await super.log(execution);

    const all = await this.findAll();
    if (all.length > this.maxExecutions) {
      // Remove oldest
      const toRemove = all
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, all.length - this.maxExecutions);

      for (const exec of toRemove) {
        await this.delete(exec.executionId);
      }
    }
  }
}
```

---

## Debugging Tips

### Enable verbose logging

```typescript
class VerboseAgent extends AIAgent<Input, Output> {
  protected async beforeExecute(input: Input): Promise<void> {
    console.log('[Agent] Starting execution', { input });
  }

  protected async afterExecute(result: AgentResult<Output>): Promise<void> {
    console.log('[Agent] Execution completed', {
      success: result.isSuccess(),
      duration: result.metadata.duration,
      cost: result.metadata.cost,
    });
  }

  protected async onError(error: Error): Promise<void> {
    console.error('[Agent] Error occurred', {
      message: error.message,
      stack: error.stack,
    });
  }
}
```

### Inspect execution traces

```typescript
const result = await agent.execute(input);

if (result.metadata.steps) {
  console.log('Execution trace:');
  result.metadata.steps.forEach((step, i) => {
    console.log(`Step ${i + 1}: ${step.type} (${step.duration}ms)`);
    console.log('  Status:', step.status);
    if (step.metadata) {
      console.log('  Metadata:', step.metadata);
    }
  });
}
```

### Use audit log for debugging

```typescript
// Get recent failures
const failures = await auditLog.findByAgent(agentId, {
  status: 'failure',
  limit: 10,
});

console.log('Recent failures:');
failures.forEach((exec) => {
  console.log(`- ${new Date(exec.timestamp).toISOString()}`);
  console.log(`  Error: ${exec.error}`);
  console.log(`  Input:`, exec.input);
});
```

### Debug tool execution

```typescript
class DebugTool extends AgentTool<Input, Output> {
  async execute(input: Input): Promise<Output> {
    console.log('[Tool] Executing with input:', input);

    try {
      const result = await this.performWork(input);
      console.log('[Tool] Success:', result);
      return result;
    } catch (error) {
      console.error('[Tool] Error:', error);
      throw error;
    }
  }
}
```

### Capture full conversation history

```typescript
const context = new AgentContext({ ... });

// Execute agent
await agent.execute(input, context);

// Dump full conversation
console.log('Full conversation:');
context.getMessages().forEach((msg, i) => {
  console.log(`${i + 1}. [${msg.role}] ${msg.content}`);
});
```

---

## Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues**: https://github.com/pcarvajal/stratix/issues
2. **Join Discord**: https://discord.gg/stratix
3. **Read API Docs**: [API Reference](../api/README.md)

When reporting issues, include:

- Stratix version
- Node.js version
- TypeScript version
- Minimal reproduction code
- Error messages and stack traces
- Steps to reproduce

---

## Common Error Messages

| Error                               | Likely Cause                | Solution                      |
| ----------------------------------- | --------------------------- | ----------------------------- |
| `Cannot find module '@stratix/...'` | Package not installed       | Run `pnpm install`            |
| `Property 'data' does not exist`    | Not checking result success | Use `if (result.isSuccess())` |
| `Budget exceeded`                   | Cost exceeds limit          | Increase budget or optimize   |
| `Test timeout`                      | Execution too slow          | Increase timeout or optimize  |
| `Invalid API key`                   | Wrong/missing key           | Check environment variables   |
| `Rate limit exceeded`               | Too many requests           | Enable auto-retry             |
| `Context length exceeded`           | Too many tokens             | Truncate messages             |
| `No mock responses configured`      | Missing mock setup          | Call `setResponse()`          |
| `Agent not found`                   | Not registered              | Call `registerAgent()` first  |
| `Type 'unknown' is not assignable`  | Missing type cast           | Cast result.data to type      |
