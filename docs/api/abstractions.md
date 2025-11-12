# @stratix/abstractions API Reference

Core abstractions and interfaces for Stratix AI agents.

## Installation

```bash
npm install @stratix/abstractions
# or
pnpm add @stratix/abstractions
```

## LLM Provider

### LLMProvider

Interface for LLM provider implementations.

```typescript
interface LLMProvider {
  readonly name: string;
  readonly models: string[];

  chat(params: ChatParams): Promise<ChatResponse>;
  streamChat(params: ChatParams): AsyncIterable<ChatChunk>;
  embeddings(params: EmbeddingParams): Promise<EmbeddingResponse>;
}
```

**Properties:**

- `name` - Provider name (e.g., "openai", "anthropic")
- `models` - List of supported model names

**Methods:**

#### chat(params: ChatParams): Promise<ChatResponse>

Performs a chat completion request.

```typescript
const response = await provider.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  maxTokens: 1000
});

console.log(response.content);
console.log(response.usage);
```

#### streamChat(params: ChatParams): AsyncIterable<ChatChunk>

Streams a chat completion response.

```typescript
for await (const chunk of provider.streamChat(params)) {
  process.stdout.write(chunk.content);

  if (chunk.isComplete) {
    console.log('\nDone!');
  }
}
```

#### embeddings(params: EmbeddingParams): Promise<EmbeddingResponse>

Generates embeddings for text.

```typescript
const response = await provider.embeddings({
  model: 'text-embedding-3-small',
  input: 'The quick brown fox'
});

console.log(response.embeddings[0]); // [0.123, -0.456, ...]
```

---

### ChatParams

Parameters for chat completion requests.

```typescript
interface ChatParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  tools?: ToolDefinition[];
  responseFormat?: ResponseFormat;
}
```

**Example:**

```typescript
const params: ChatParams = {
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'What is 2+2?' }
  ],
  temperature: 0.7,
  maxTokens: 500,
  tools: [
    {
      type: 'function',
      function: {
        name: 'calculate',
        description: 'Performs calculation',
        parameters: {
          type: 'object',
          properties: {
            expression: { type: 'string' }
          },
          required: ['expression']
        }
      }
    }
  ]
};
```

---

### ChatResponse

Response from chat completion.

```typescript
interface ChatResponse {
  content: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  toolCalls?: ToolCall[];
}
```

**Properties:**

- `content` - Generated text
- `usage` - Token usage statistics
- `finishReason` - Why generation stopped
- `toolCalls` - Function/tool calls (if any)

---

### ChatChunk

Chunk from streaming chat completion.

```typescript
interface ChatChunk {
  content: string;
  isComplete: boolean;
  toolCalls?: ToolCall[];
}
```

---

### EmbeddingParams

Parameters for embedding generation.

```typescript
interface EmbeddingParams {
  model: string;
  input: string | string[];
  dimensions?: number;
}
```

---

### EmbeddingResponse

Response from embedding generation.

```typescript
interface EmbeddingResponse {
  embeddings: number[][];
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}
```

---

### ToolDefinition

Definition of a tool/function for LLM.

```typescript
interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}
```

---

### ResponseFormat

Structured output format specification.

```typescript
interface ResponseFormat {
  type: 'json_schema' | 'text';
  schema?: Record<string, unknown>;
}
```

---

## Agent Tool

### AgentTool

Base class for creating tools that agents can use.

```typescript
abstract class AgentTool<TInput, TOutput>
```

**Type Parameters:**

- `TInput` - Tool input type
- `TOutput` - Tool output type

**Abstract Properties:**

```typescript
abstract readonly name: string;
abstract readonly description: string;
```

**Optional Properties:**

```typescript
readonly requiresApproval: boolean = false; // Whether tool requires human approval
```

**Abstract Methods:**

```typescript
abstract execute(input: TInput): Promise<TOutput>;
abstract validate(input: unknown): Promise<TInput>;
abstract getDefinition(): ToolDefinition;
```

**Methods:**

#### executeValidated(input: unknown): Promise<TOutput>

Executes the tool with input validation.

```typescript
const result = await tool.executeValidated(userInput);
console.log(result);
```

**Example:**

```typescript
import { AgentTool } from '@stratix/abstractions';

interface CalculatorInput {
  expression: string;
}

interface CalculatorOutput {
  result: number;
}

class CalculatorTool extends AgentTool<CalculatorInput, CalculatorOutput> {
  readonly name = 'calculator';
  readonly description = 'Evaluates mathematical expressions';

  async validate(input: unknown): Promise<CalculatorInput> {
    if (typeof input !== 'object' || !input || !('expression' in input)) {
      throw new Error('Invalid input: expression required');
    }
    const { expression } = input as { expression: unknown };
    if (typeof expression !== 'string') {
      throw new Error('Invalid input: expression must be a string');
    }
    return { expression };
  }

  async execute(input: CalculatorInput): Promise<CalculatorOutput> {
    const result = eval(input.expression);
    return { result };
  }

  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Mathematical expression to evaluate' }
        },
        required: ['expression']
      }
    };
  }
}

// Usage
const calc = new CalculatorTool();
const result = await calc.executeValidated({ expression: '2 + 2' });
console.log(result.result); // 4
```

---

## Agent Orchestrator

### AgentOrchestrator

Interface for orchestrating agent execution.

```typescript
interface AgentOrchestrator {
  registerAgent(agent: AIAgent<unknown, unknown>): Promise<void>;

  executeAgent<TInput, TOutput>(
    agentId: AgentId,
    input: TInput,
    context: AgentContext
  ): Promise<AgentResult<TOutput>>;

  getAgent(agentId: AgentId): Promise<AIAgent<unknown, unknown> | undefined>;

  listAgents(): Promise<AgentId[]>;
}
```

**Methods:**

#### registerAgent(agent: AIAgent): Promise<void>

Registers an agent with the orchestrator.

```typescript
await orchestrator.registerAgent(myAgent);
```

#### executeAgent(agentId, input, context): Promise<AgentResult>

Executes a registered agent.

```typescript
const result = await orchestrator.executeAgent(
  agentId,
  { query: 'Analyze this' },
  context
);
```

#### getAgent(agentId): Promise<AIAgent | undefined>

Retrieves a registered agent.

```typescript
const agent = await orchestrator.getAgent(agentId);
```

#### listAgents(): Promise<AgentId[]>

Lists all registered agent IDs.

```typescript
const agents = await orchestrator.listAgents();
```

---

## Agent Repository

### AgentRepository

Interface for persisting agents.

```typescript
interface AgentRepository {
  save(agent: AIAgent<unknown, unknown>): Promise<void>;
  findById(id: AgentId): Promise<AIAgent<unknown, unknown> | undefined>;
  findAll(): Promise<AIAgent<unknown, unknown>[]>;
  delete(id: AgentId): Promise<void>;
}
```

**Methods:**

#### save(agent): Promise<void>

Saves or updates an agent.

```typescript
await repository.save(agent);
```

#### findById(id): Promise<AIAgent | undefined>

Finds an agent by ID.

```typescript
const agent = await repository.findById(agentId);
```

#### findAll(): Promise<AIAgent[]>

Returns all agents.

```typescript
const agents = await repository.findAll();
```

#### delete(id): Promise<void>

Deletes an agent.

```typescript
await repository.delete(agentId);
```

---

## Execution Audit Log

### ExecutionAuditLog

Interface for auditing agent executions.

```typescript
interface ExecutionAuditLog {
  log(execution: AgentExecution): Promise<void>;

  findById(executionId: string): Promise<AgentExecution | undefined>;

  findByAgent(
    agentId: AgentId,
    filter?: ExecutionFilter
  ): Promise<AgentExecution[]>;

  getStatistics(
    agentId: AgentId,
    timeRange?: { start: number; end: number }
  ): Promise<ExecutionStatistics>;
}
```

**Methods:**

#### log(execution): Promise<void>

Logs an agent execution.

```typescript
await auditLog.log({
  executionId: 'exec-123',
  agentId,
  timestamp: Date.now(),
  input: userInput,
  output: result,
  duration: 1234,
  cost: 0.05,
  status: 'success'
});
```

#### findById(executionId): Promise<AgentExecution | undefined>

Finds execution by ID.

```typescript
const execution = await auditLog.findById('exec-123');
```

#### findByAgent(agentId, filter?): Promise<AgentExecution[]>

Finds executions for an agent.

```typescript
const executions = await auditLog.findByAgent(agentId, {
  status: 'success',
  minDuration: 1000,
  limit: 10
});
```

#### getStatistics(agentId, timeRange?): Promise<ExecutionStatistics>

Gets execution statistics.

```typescript
const stats = await auditLog.getStatistics(agentId, {
  start: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
  end: Date.now()
});

console.log(`Success rate: ${stats.successRate}%`);
console.log(`Average duration: ${stats.averageDuration}ms`);
console.log(`Total cost: $${stats.totalCost}`);
```

---

### AgentExecution

Record of an agent execution.

```typescript
interface AgentExecution {
  executionId: string;
  agentId: AgentId;
  timestamp: number;
  input: unknown;
  output: unknown;
  duration: number;
  cost?: number;
  status: 'success' | 'failure';
  error?: string;
  trace?: ExecutionTrace;
}
```

---

### ExecutionFilter

Filter for querying executions.

```typescript
interface ExecutionFilter {
  status?: 'success' | 'failure';
  minDuration?: number;
  maxDuration?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}
```

---

### ExecutionStatistics

Statistics about agent executions.

```typescript
interface ExecutionStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageDuration: number;
  totalCost: number;
  averageCost: number;
}
```

---

## Dependency Injection

### Container

Interface for dependency injection container.

```typescript
interface Container {
  register<T>(
    token: Token<T>,
    factory: Factory<T>,
    options?: RegisterOptions
  ): void;

  resolve<T>(token: Token<T>): T;

  createScope(): Container;
}
```

---

### ServiceLifetime

Service lifetime enumeration.

```typescript
enum ServiceLifetime {
  TRANSIENT = 'transient',  // New instance each time
  SCOPED = 'scoped',        // One instance per scope
  SINGLETON = 'singleton'   // One instance globally
}
```

---

## Messaging

### Command

Represents a command (write operation).

```typescript
interface Command {
  readonly type: string;
}
```

---

### Query

Represents a query (read operation).

```typescript
interface Query<TResult> {
  readonly type: string;
}
```

---

### Event

Represents a domain event.

```typescript
interface Event {
  readonly type: string;
  readonly timestamp: number;
}
```

---

### CommandHandler

Handler for commands.

```typescript
interface CommandHandler<TCommand extends Command> {
  handle(command: TCommand): Promise<void>;
}
```

---

### QueryHandler

Handler for queries.

```typescript
interface QueryHandler<TQuery extends Query<TResult>, TResult> {
  handle(query: TQuery): Promise<TResult>;
}
```

---

### EventHandler

Handler for events.

```typescript
interface EventHandler<TEvent extends Event> {
  handle(event: TEvent): Promise<void>;
}
```

---

## Infrastructure

### Logger

Interface for logging.

```typescript
interface Logger {
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
```

---

### LogLevel

Log level enumeration.

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
```

---

### Repository

Generic repository interface.

```typescript
interface Repository<T, TId> {
  save(entity: T): Promise<void>;
  findById(id: TId): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  delete(id: TId): Promise<void>;
}
```

---

### HealthCheck

Interface for health checks.

```typescript
interface HealthCheck {
  check(): Promise<HealthCheckResult>;
}

interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  details?: Record<string, unknown>;
}

enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded'
}
```

---

## Plugin System

### Plugin

Interface for plugins.

```typescript
interface Plugin {
  readonly metadata: PluginMetadata;

  install(context: PluginContext): Promise<void>;
  uninstall(context: PluginContext): Promise<void>;
}
```

---

### PluginMetadata

Plugin metadata.

```typescript
interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
}
```

---

### PluginContext

Context provided to plugins.

```typescript
interface PluginContext {
  container: Container;
  logger: Logger;
  config: Record<string, unknown>;
}
```

---

## Best Practices

### 1. Implement LLMProvider Correctly

```typescript
class MyProvider implements LLMProvider {
  readonly name = 'my-provider';
  readonly models = ['model-1', 'model-2'];

  async chat(params: ChatParams): Promise<ChatResponse> {
    // Implement chat logic
  }

  async *streamChat(params: ChatParams): AsyncIterable<ChatChunk> {
    // Implement streaming logic
  }

  async embeddings(params: EmbeddingParams): Promise<EmbeddingResponse> {
    // Implement embeddings logic
  }
}
```

### 2. Create Reusable Tools

```typescript
// Good: Type-safe, validated tool
class MyTool extends AgentTool<Input, Output> {
  readonly name = 'my_tool';
  readonly description = 'My tool description';

  async validate(input: unknown): Promise<Input> {
    // Implement validation
    if (typeof input !== 'object' || !input) {
      throw new Error('Invalid input');
    }
    return input as Input;
  }

  async execute(input: Input): Promise<Output> {
    // Implementation
  }

  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: { /* ... */ }
    };
  }
}

// Usage
const result = await tool.executeValidated(input);
```

### 3. Use Orchestrator for Agent Management

```typescript
// Register agents
await orchestrator.registerAgent(agent1);
await orchestrator.registerAgent(agent2);

// Execute through orchestrator for unified monitoring
const result = await orchestrator.executeAgent(agentId, input, context);
```

### 4. Implement Audit Logging

```typescript
// Log all executions for compliance and debugging
await auditLog.log({
  executionId: uuid(),
  agentId,
  timestamp: Date.now(),
  input,
  output: result,
  duration,
  cost,
  status: result.isSuccess() ? 'success' : 'failure'
});
```

---

## Next Steps

- [Primitives API Reference](./primitives.md)
- [Runtime API Reference](./runtime.md)
- [Testing API Reference](./testing.md)
- [LLM Provider Guide](../guides/llm-providers.md)
