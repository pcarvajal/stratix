# @stratix/runtime API Reference

Runtime implementations for orchestrating and managing Stratix AI agents.

Package name: `@stratix/impl-ai-agents`

## Installation

```bash
npm install @stratix/impl-ai-agents
# or
pnpm add @stratix/impl-ai-agents
```

## StratixAgentOrchestrator

Main orchestrator for managing and executing AI agents with advanced features like retries, budget enforcement, and audit logging.

```typescript
class StratixAgentOrchestrator implements AgentOrchestrator
```

### Constructor

```typescript
new StratixAgentOrchestrator(
  repository: AgentRepository,
  auditLog: ExecutionAuditLog,
  llmProvider: LLMProvider,
  options?: OrchestratorOptions
)
```

**Parameters:**

- `repository` - Agent repository for persistence
- `auditLog` - Audit log for tracking executions
- `llmProvider` - LLM provider for agent execution
- `options` - Optional configuration

**OrchestratorOptions:**

```typescript
interface OrchestratorOptions {
  auditEnabled?: boolean;       // Enable audit logging (default: true)
  budgetEnforcement?: boolean;  // Enforce budget limits (default: true)
  autoRetry?: boolean;          // Auto-retry on failure (default: false)
  maxRetries?: number;          // Max retry attempts (default: 3)
  retryDelay?: number;          // Delay between retries in ms (default: 1000)
  timeout?: number;             // Execution timeout in ms (default: 30000)
}
```

### Example

```typescript
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog
} from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

// Create dependencies
const repository = new InMemoryAgentRepository();
const auditLog = new InMemoryExecutionAuditLog();
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });

// Create orchestrator
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  provider,
  {
    auditEnabled: true,
    budgetEnforcement: true,
    autoRetry: true,
    maxRetries: 3,
    timeout: 30000
  }
);
```

### Methods

#### registerAgent(agent: AIAgent): Promise<void>

Registers an agent with the orchestrator.

```typescript
const agent = new MyAgent(provider, {
  model: 'gpt-4',
  temperature: 0.7
});

await orchestrator.registerAgent(agent);
```

#### executeAgent<TInput, TOutput>(agentId, input, context): Promise<AgentResult<TOutput>>

Executes a registered agent with full orchestration features.

```typescript
const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production'
});

context.setBudget(1.00); // Max $1.00

const result = await orchestrator.executeAgent(
  agentId,
  {
    query: 'Analyze sales data',
    context: 'Q4 2024 performance'
  },
  context
);

if (result.isSuccess()) {
  console.log('Analysis:', result.data);
  console.log('Cost:', result.metadata.cost);
  console.log('Duration:', result.metadata.duration, 'ms');
}
```

**Features:**

- **Budget Enforcement**: Throws error if cost exceeds budget
- **Auto-Retry**: Automatically retries on failure (if enabled)
- **Audit Logging**: Logs all executions to audit log
- **Timeout Handling**: Cancels execution after timeout
- **Tracing**: Captures execution trace for debugging

#### getAgent(agentId): Promise<AIAgent | undefined>

Retrieves a registered agent.

```typescript
const agent = await orchestrator.getAgent(agentId);

if (agent) {
  console.log('Agent found:', agent.id);
}
```

#### listAgents(): Promise<AgentId[]>

Lists all registered agent IDs.

```typescript
const agentIds = await orchestrator.listAgents();
console.log(`Total agents: ${agentIds.length}`);
```

### Error Handling

The orchestrator throws specific errors:

**BudgetExceededError**

Thrown when execution cost exceeds budget.

```typescript
try {
  await orchestrator.executeAgent(agentId, input, context);
} catch (error) {
  if (error.message.includes('Budget exceeded')) {
    console.error('Execution exceeded budget limit');
  }
}
```

**TimeoutError**

Thrown when execution exceeds timeout.

```typescript
try {
  await orchestrator.executeAgent(agentId, input, context);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Execution timed out');
  }
}
```

---

## InMemoryAgentRepository

In-memory implementation of AgentRepository for development and testing.

```typescript
class InMemoryAgentRepository implements AgentRepository
```

### Constructor

```typescript
const repository = new InMemoryAgentRepository();
```

### Methods

#### save(agent): Promise<void>

Saves or updates an agent in memory.

```typescript
await repository.save(agent);
```

#### findById(id): Promise<AIAgent | undefined>

Finds an agent by ID.

```typescript
const agent = await repository.findById(agentId);
```

#### findAll(): Promise<AIAgent[]>

Returns all stored agents.

```typescript
const agents = await repository.findAll();
console.log(`Total agents: ${agents.length}`);
```

#### delete(id): Promise<void>

Deletes an agent.

```typescript
await repository.delete(agentId);
```

### Example

```typescript
const repository = new InMemoryAgentRepository();

// Save agents
await repository.save(agent1);
await repository.save(agent2);

// Find all
const agents = await repository.findAll();

// Find by ID
const agent = await repository.findById(agent1.id);

// Delete
await repository.delete(agent1.id);
```

**Note:** This is an in-memory implementation. Data is lost when the process exits. For production, implement a persistent repository (e.g., database-backed).

---

## InMemoryExecutionAuditLog

In-memory implementation of ExecutionAuditLog for development and testing.

```typescript
class InMemoryExecutionAuditLog implements ExecutionAuditLog
```

### Constructor

```typescript
const auditLog = new InMemoryExecutionAuditLog();
```

### Methods

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

Finds an execution by ID.

```typescript
const execution = await auditLog.findById('exec-123');

if (execution) {
  console.log('Status:', execution.status);
  console.log('Duration:', execution.duration, 'ms');
}
```

#### findByAgent(agentId, filter?): Promise<AgentExecution[]>

Finds executions for a specific agent.

```typescript
// All executions
const allExecutions = await auditLog.findByAgent(agentId);

// Filter by status
const successfulExecutions = await auditLog.findByAgent(agentId, {
  status: 'success'
});

// Filter by duration
const slowExecutions = await auditLog.findByAgent(agentId, {
  minDuration: 5000 // Took more than 5 seconds
});

// Paginated results
const recentExecutions = await auditLog.findByAgent(agentId, {
  limit: 10,
  offset: 0
});
```

**ExecutionFilter options:**

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

#### getStatistics(agentId, timeRange?): Promise<ExecutionStatistics>

Gets execution statistics for an agent.

```typescript
// All-time statistics
const stats = await auditLog.getStatistics(agentId);

console.log(`Total executions: ${stats.totalExecutions}`);
console.log(`Success rate: ${stats.successRate}%`);
console.log(`Average duration: ${stats.averageDuration}ms`);
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
console.log(`Average cost: $${stats.averageCost.toFixed(4)}`);

// Statistics for specific time range
const last24Hours = await auditLog.getStatistics(agentId, {
  start: Date.now() - 24 * 60 * 60 * 1000,
  end: Date.now()
});
```

**ExecutionStatistics:**

```typescript
interface ExecutionStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;          // Percentage (0-100)
  averageDuration: number;       // Milliseconds
  totalCost: number;             // USD
  averageCost: number;           // USD
}
```

### Example: Complete Audit Trail

```typescript
const auditLog = new InMemoryExecutionAuditLog();

// Execute agent and log
const result = await orchestrator.executeAgent(agentId, input, context);

// Audit logging is automatic with orchestrator, but you can also log manually:
await auditLog.log({
  executionId: uuid(),
  agentId,
  timestamp: Date.now(),
  input,
  output: result,
  duration: result.metadata.duration,
  cost: result.metadata.cost,
  status: result.isSuccess() ? 'success' : 'failure',
  error: result.isFailure() ? result.error.message : undefined,
  trace: result.metadata.steps
});

// Query audit trail
const executions = await auditLog.findByAgent(agentId, {
  status: 'failure',
  limit: 5
});

console.log('Recent failures:');
executions.forEach(exec => {
  console.log(`- ${new Date(exec.timestamp).toISOString()}: ${exec.error}`);
});

// Get performance insights
const stats = await auditLog.getStatistics(agentId);

if (stats.successRate < 90) {
  console.warn('Agent success rate is below 90%');
}

if (stats.averageCost > 0.10) {
  console.warn('Average cost exceeds $0.10 per execution');
}
```

**Note:** This is an in-memory implementation. For production, implement a persistent audit log (e.g., database or log aggregation service).

---

## Usage Examples

### Basic Setup

```typescript
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog
} from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
import { AgentContext } from '@stratix/primitives';

// Setup
const repository = new InMemoryAgentRepository();
const auditLog = new InMemoryExecutionAuditLog();
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY
});

const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  provider,
  {
    auditEnabled: true,
    budgetEnforcement: true,
    autoRetry: true,
    maxRetries: 3
  }
);

// Register agent
const agent = new MyAgent(provider, { model: 'gpt-4' });
await orchestrator.registerAgent(agent);

// Execute
const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production'
});
context.setBudget(0.50);

const result = await orchestrator.executeAgent(
  agent.id,
  { query: 'Process this data' },
  context
);
```

### With Auto-Retry

```typescript
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  provider,
  {
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 2000 // 2 second delay between retries
  }
);

// Will automatically retry up to 3 times on failure
const result = await orchestrator.executeAgent(agentId, input, context);
```

### Budget Monitoring

```typescript
const context = new AgentContext({ ... });
context.setBudget(1.00); // $1.00 budget

try {
  const result = await orchestrator.executeAgent(agentId, input, context);

  console.log(`Cost: $${result.metadata.cost?.toFixed(4)}`);
  console.log(`Remaining: $${context.getRemainingBudget().toFixed(4)}`);
} catch (error) {
  if (error.message.includes('Budget exceeded')) {
    console.error('Execution exceeded budget');
  }
}
```

### Performance Analysis

```typescript
// Execute multiple times
for (let i = 0; i < 100; i++) {
  await orchestrator.executeAgent(agentId, input, context);
}

// Analyze performance
const stats = await auditLog.getStatistics(agentId);

console.log('Performance Report:');
console.log(`Success Rate: ${stats.successRate}%`);
console.log(`Average Duration: ${stats.averageDuration}ms`);
console.log(`P95 Duration: ${calculateP95(executions)}ms`);
console.log(`Average Cost: $${stats.averageCost.toFixed(4)}`);
console.log(`Total Cost: $${stats.totalCost.toFixed(2)}`);
```

### Error Analysis

```typescript
const failures = await auditLog.findByAgent(agentId, {
  status: 'failure',
  limit: 100
});

// Group by error type
const errorsByType = failures.reduce((acc, exec) => {
  const errorType = exec.error?.split(':')[0] || 'Unknown';
  acc[errorType] = (acc[errorType] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Errors by type:', errorsByType);
```

---

## Best Practices

### 1. Use Orchestrator for All Executions

```typescript
// Good: Centralized management, audit logging, retries
const result = await orchestrator.executeAgent(agentId, input, context);

// Avoid: Direct agent execution loses orchestration benefits
const result = await agent.execute(input);
```

### 2. Set Budget Limits

```typescript
// Always set budget to prevent runaway costs
const context = new AgentContext({ ... });
context.setBudget(1.00); // Reasonable limit

const result = await orchestrator.executeAgent(agentId, input, context);
```

### 3. Enable Audit Logging

```typescript
// Production configuration
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  provider,
  {
    auditEnabled: true,  // Always enable in production
    budgetEnforcement: true,
    autoRetry: true,
    maxRetries: 3
  }
);
```

### 4. Monitor Performance

```typescript
// Regular performance checks
setInterval(async () => {
  const stats = await auditLog.getStatistics(agentId);

  if (stats.successRate < 95) {
    alert('Agent success rate dropped below 95%');
  }

  if (stats.averageDuration > 5000) {
    alert('Agent average duration exceeds 5 seconds');
  }
}, 60000); // Check every minute
```

### 5. Implement Persistent Storage

```typescript
// For production, implement database-backed storage
class PostgresAgentRepository implements AgentRepository {
  async save(agent: AIAgent): Promise<void> {
    // Save to PostgreSQL
  }

  async findById(id: AgentId): Promise<AIAgent | undefined> {
    // Query from PostgreSQL
  }

  // ... other methods
}

class ElasticsearchAuditLog implements ExecutionAuditLog {
  async log(execution: AgentExecution): Promise<void> {
    // Index in Elasticsearch
  }

  // ... other methods
}
```

---

## Next Steps

- [Primitives API Reference](./primitives.md)
- [Abstractions API Reference](./abstractions.md)
- [Testing API Reference](./testing.md)
- [Production Deployment Guide](../guides/production.md)
