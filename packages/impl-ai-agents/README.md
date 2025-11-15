# @stratix/impl-ai-agents

AI Agent orchestrator with budget control, retries, and audit logging.

## Installation

```bash
pnpm add @stratix/impl-ai-agents
```

## What's Included

- **StratixAgentOrchestrator** - Main orchestrator for agent execution
- **InMemoryAgentRepository** - In-memory agent storage
- **InMemoryExecutionAuditLog** - In-memory execution audit logging
- **Error Classes** - AgentNotFoundError, BudgetExceededError, ExecutionTimeoutError

## Features

- Budget enforcement per execution
- Automatic retries with exponential backoff
- Audit log of all executions
- Cost tracking across agents
- Thread-safe execution
- Sequential and parallel agent execution
- Agent delegation support

## Quick Example

```typescript
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog,
} from '@stratix/impl-ai-agents';
import { AIAgent, AgentContext } from '@stratix/primitives';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

// Create dependencies
const repository = new InMemoryAgentRepository();
const auditLog = new InMemoryExecutionAuditLog();
const llmProvider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });

// Create orchestrator
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  llmProvider,
  {
    auditEnabled: true,
    budgetEnforcement: true,
    autoRetry: true,
    maxRetries: 3,
  }
);

// Register agent
orchestrator.registerAgent(agent);

// Create execution context
const context = new AgentContext({
  sessionId: 'session-1',
  environment: 'production'
});
context.setBudget(1.0); // Max $1

// Execute agent
const result = await orchestrator.executeAgent(agent.getAgentId(), input, context);
```

## Orchestrator Options

```typescript
interface OrchestratorOptions {
  auditEnabled: boolean;           // Enable audit logging
  budgetEnforcement: boolean;      // Enforce budget limits
  autoRetry: boolean;              // Enable automatic retries
  maxRetries: number;              // Maximum retry attempts
  maxExecutionTime?: number;       // Optional execution timeout in ms
}
```

## License

MIT
