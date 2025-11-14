# @stratix/primitives API Reference

Core primitives and building blocks for Stratix AI agents.

## Installation

```bash
npm install @stratix/primitives
# or
pnpm add @stratix/primitives
```

## Core Classes

### AIAgent

Base class for all AI agents.

```typescript
abstract class AIAgent<TInput, TOutput>
```

**Type Parameters:**
- `TInput` - Input type for the agent
- `TOutput` - Output type for the agent

**Methods:**

#### execute(input: TInput): Promise<AgentResult<TOutput>>

Executes the agent with the given input.

```typescript
const result = await agent.execute({
  query: "Analyze this data",
  context: "Sales data from Q4"
});

if (result.isSuccess()) {
  console.log(result.data);
}
```

#### beforeExecute(input: TInput): Promise<void>

Lifecycle hook called before execution. Override to add custom logic.

```typescript
protected async beforeExecute(input: TInput): Promise<void> {
  console.log('Starting execution...');
}
```

#### afterExecute(result: AgentResult<TOutput>): Promise<void>

Lifecycle hook called after execution. Override to add custom logic.

```typescript
protected async afterExecute(result: AgentResult<TOutput>): Promise<void> {
  if (result.isSuccess()) {
    console.log('Execution succeeded');
  }
}
```

#### onError(error: Error): Promise<void>

Lifecycle hook called on error. Override to add custom error handling.

```typescript
protected async onError(error: Error): Promise<void> {
  console.error('Error occurred:', error.message);
}
```

**Properties:**

- `id: AgentId` - Unique identifier for the agent
- `version: AgentVersion` - Version information

---

### AgentResult

Result wrapper for agent executions following the Result pattern.

```typescript
class AgentResult<T>
```

**Static Methods:**

#### AgentResult.success(data: T, metadata?: Partial<AgentExecutionMetadata>): AgentResult<T>

Creates a successful result.

```typescript
return AgentResult.success(
  { analysis: "Complete", confidence: 0.95 },
  { model: "gpt-4", duration: 1234, cost: 0.05 }
);
```

#### AgentResult.failure(error: Error, metadata?: Partial<AgentExecutionMetadata>): AgentResult<T>

Creates a failed result.

```typescript
return AgentResult.failure(
  new Error("Invalid input format"),
  { model: "gpt-4", duration: 100 }
);
```

**Methods:**

#### isSuccess(): boolean

Returns true if the result is successful.

```typescript
if (result.isSuccess()) {
  console.log(result.data);
}
```

#### isFailure(): boolean

Returns true if the result is a failure.

```typescript
if (result.isFailure()) {
  console.error(result.error);
}
```

**Properties:**

- `success: boolean` - Whether the execution succeeded
- `data?: T` - Result data (only present on success)
- `error?: Error` - Error information (only present on failure)
- `metadata: AgentExecutionMetadata` - Execution metadata

---

### AgentContext

Execution context for agents containing session information and message history.

```typescript
class AgentContext
```

**Constructor:**

```typescript
new AgentContext(config: {
  userId: string;
  sessionId: string;
  environment: 'development' | 'staging' | 'production';
  metadata?: Record<string, unknown>;
})
```

**Example:**

```typescript
const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production',
  metadata: {
    source: 'web-app',
    version: '2.0'
  }
});
```

**Methods:**

#### addMessage(message: AgentMessage): void

Adds a message to the conversation history.

```typescript
context.addMessage({
  role: 'user',
  content: 'What are the sales trends?',
  timestamp: Date.now()
});
```

#### getMessages(): AgentMessage[]

Returns all messages in the conversation.

```typescript
const history = context.getMessages();
```

#### setBudget(amount: number): void

Sets the execution budget (in USD).

```typescript
context.setBudget(1.00); // Max $1.00
```

#### getRemainingBudget(): number

Returns the remaining budget.

```typescript
const remaining = context.getRemainingBudget();
```

#### addCost(cost: number): void

Adds cost to the current execution.

```typescript
context.addCost(0.05); // Add $0.05
```

#### getTotalCost(): number

Returns the total cost so far.

```typescript
const cost = context.getTotalCost();
```

**Properties:**

- `userId: string` - User identifier
- `sessionId: string` - Session identifier
- `environment: string` - Execution environment
- `metadata: Record<string, unknown>` - Custom metadata

---

### ExecutionTrace

Trace of agent execution steps for debugging and monitoring.

```typescript
class ExecutionTrace
```

**Methods:**

#### addStep(step: ExecutionStep): void

Adds an execution step.

```typescript
trace.addStep({
  timestamp: Date.now(),
  type: 'llm_call',
  duration: 1234,
  status: 'success',
  metadata: {
    model: 'gpt-4',
    tokens: 150
  }
});
```

#### getSteps(): ExecutionStep[]

Returns all execution steps.

```typescript
const steps = trace.getSteps();
```

#### getDuration(): number

Returns total execution duration in milliseconds.

```typescript
const duration = trace.getDuration();
```

#### getTokenUsage(): TokenUsage

Returns total token usage across all LLM calls.

```typescript
const tokens = trace.getTokenUsage();
console.log(`Total tokens: ${tokens.totalTokens}`);
```

---

### AgentMemory

Interface for agent memory implementations. The interface remains in `@stratix/primitives` as it's a domain concept used by `AIAgent`.

**Note:** The `InMemoryAgentMemory` implementation has been moved to `@stratix/impl-ai-agents` following the layered architecture pattern where implementations are separated from domain primitives.

**Interface** (in `@stratix/primitives`):

```typescript
import type { AgentMemory } from '@stratix/primitives';
```

**Built-in Implementation** (in `@stratix/impl-ai-agents`):

```typescript
import { InMemoryAgentMemory } from '@stratix/impl-ai-agents';

const memory = new InMemoryAgentMemory();

await memory.store('context', { lastQuery: 'sales data' }, 'short');
const context = await memory.retrieve('context');
```

For production use, implement the `AgentMemory` interface with persistent storage (Redis, PostgreSQL, etc.).

---

## Core Building Blocks

### Entity

Base class for domain entities with identity.

```typescript
abstract class Entity<T>
```

**Constructor:**

```typescript
constructor(id: EntityId<T>)
```

**Methods:**

- `getId(): EntityId<T>` - Returns entity ID
- `equals(entity: Entity<T>): boolean` - Compares entities by ID

**Example:**

```typescript
class User extends Entity<'User'> {
  constructor(
    id: EntityId<'User'>,
    private name: string
  ) {
    super(id);
  }
}
```

---

### EntityId

Type-safe entity identifier.

```typescript
class EntityId<T extends string>
```

**Static Methods:**

#### EntityId.create<T>(): EntityId<T>

Creates a new UUID-based entity ID.

```typescript
const agentId = EntityId.create<'AIAgent'>();
const userId = EntityId.create<'User'>();
```

#### EntityId.from<T>(value: string): EntityId<T>

Creates an entity ID from an existing string.

```typescript
const id = EntityId.from<'AIAgent'>('existing-uuid');
```

**Methods:**

- `toString(): string` - Returns string representation
- `equals(other: EntityId<T>): boolean` - Compares IDs

---

### ValueObject

Base class for value objects (immutable, compared by value).

```typescript
abstract class ValueObject<T>
```

**Methods:**

- `equals(other: ValueObject<T>): boolean` - Compares by value
- `abstract getValue(): T` - Returns the value

---

### AggregateRoot

Base class for aggregate roots in Domain-Driven Design.

```typescript
abstract class AggregateRoot<T> extends Entity<T>
```

**Methods:**

- `addDomainEvent(event: DomainEvent): void` - Adds domain event
- `getDomainEvents(): DomainEvent[]` - Returns domain events
- `clearDomainEvents(): void` - Clears domain events

---

## Result Pattern

### Result<T>

Type for representing success or failure.

```typescript
type Result<T> = Success<T> | Failure
```

**Success:**

```typescript
const success = new Success({ value: 42 });

if (success.isSuccess()) {
  console.log(success.value);
}
```

**Failure:**

```typescript
const failure = new Failure(new Error('Operation failed'));

if (failure.isFailure()) {
  console.error(failure.error);
}
```

**ResultUtils:**

Utility functions for working with results.

```typescript
// Combine multiple results
const combined = ResultUtils.combine([result1, result2, result3]);

// Map result value
const mapped = ResultUtils.map(result, value => value * 2);

// Chain operations
const chained = ResultUtils.flatMap(result, value =>
  someOperation(value)
);
```

---

## Error Handling

### DomainError

Base class for domain-specific errors.

```typescript
class DomainError extends Error
```

**Constructor:**

```typescript
new DomainError(message: string, code?: string)
```

**Example:**

```typescript
class InvalidInputError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_INPUT');
  }
}

throw new InvalidInputError('Input must be a positive number');
```

---

## Value Objects

### Money

Represents monetary values with currency.

```typescript
class Money extends ValueObject<{ amount: number; currency: Currency }>
```

**Static Methods:**

```typescript
Money.of(amount: number, currency: Currency): Money
```

**Example:**

```typescript
const price = Money.of(99.99, Currency.USD);
const doubled = price.multiply(2);
const sum = price.add(Money.of(10, Currency.USD));
```

**Methods:**

- `add(other: Money): Money` - Adds two money values
- `subtract(other: Money): Money` - Subtracts money values
- `multiply(factor: number): Money` - Multiplies by a factor
- `divide(divisor: number): Money` - Divides by a divisor
- `equals(other: Money): boolean` - Compares money values

---

### Currency

Enumeration of supported currencies.

```typescript
enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY'
}
```

---

### Email

Value object for email addresses with validation.

```typescript
class Email extends ValueObject<string>
```

**Static Methods:**

```typescript
Email.create(value: string): Result<Email>
```

**Example:**

```typescript
const result = Email.create('user@example.com');

if (result.isSuccess()) {
  const email = result.value;
  console.log(email.getValue()); // "user@example.com"
}
```

---

## Types

### AgentId

Type alias for agent entity IDs.

```typescript
type AgentId = EntityId<'AIAgent'>
```

### ModelConfig

Configuration for LLM models.

```typescript
interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
```

### AgentMessage

Message in agent conversation.

```typescript
interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
```

### TokenUsage

Token usage statistics.

```typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

### AgentExecutionMetadata

Metadata about agent execution.

```typescript
interface AgentExecutionMetadata {
  model: string;
  duration: number;
  cost?: number;
  tokenUsage?: TokenUsage;
  steps?: ExecutionStep[];
}
```

### AgentCapability

Type for agent capability identifiers. Can be any string, allowing for custom capabilities.

```typescript
type AgentCapability = string;
```

**Built-in Capabilities:**

The framework provides common capabilities as constants for convenience:

```typescript
const AgentCapabilities = {
  CUSTOMER_SUPPORT: 'customer_support',
  DATA_ANALYSIS: 'data_analysis',
  KNOWLEDGE_RETRIEVAL: 'knowledge_retrieval',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
  SQL_GENERATION: 'sql_generation',
  VISUALIZATION: 'visualization',
  CONTENT_CREATION: 'content_creation',
  CODE_GENERATION: 'code_generation',
  DECISION_SUPPORT: 'decision_support',
} as const;
```

**Usage:**

```typescript
// Using built-in capabilities
capabilities: [AgentCapabilities.CUSTOMER_SUPPORT, AgentCapabilities.DATA_ANALYSIS]

// Using custom capabilities
capabilities: ['legal_advice', 'medical_diagnosis', 'translation']

// Mixing both
capabilities: [AgentCapabilities.CODE_GENERATION, 'custom_capability']
```

---

## Best Practices

### 1. Always Handle Results

```typescript
const result = await agent.execute(input);

if (result.isSuccess()) {
  // Handle success
  processData(result.data);
} else {
  // Handle failure
  console.error(result.error);
}
```

### 2. Use Type-Safe IDs

```typescript
// Good
const agentId = EntityId.create<'AIAgent'>();

// Avoid
const agentId = 'some-string-id';
```

### 3. Set Budget Limits

```typescript
const context = new AgentContext({ ... });
context.setBudget(1.00); // Prevent runaway costs
```

### 4. Leverage Lifecycle Hooks

```typescript
class MyAgent extends AIAgent<Input, Output> {
  protected async beforeExecute(input: Input): Promise<void> {
    // Validate input
    // Initialize resources
  }

  protected async afterExecute(result: AgentResult<Output>): Promise<void> {
    // Log metrics
    // Clean up resources
  }

  protected async onError(error: Error): Promise<void> {
    // Custom error handling
    // Alert monitoring systems
  }
}
```

### 5. Use AgentContext for State

```typescript
// Pass context through execution
const context = new AgentContext({ ... });
context.addMessage({ role: 'user', content: 'Hello', timestamp: Date.now() });

// Access history in agents
const history = context.getMessages();
```

---

## Next Steps

- [Abstractions API Reference](./abstractions.md)
- [Runtime API Reference](./runtime.md)
- [Testing API Reference](./testing.md)
- [Getting Started Guide](../guides/getting-started.md)
