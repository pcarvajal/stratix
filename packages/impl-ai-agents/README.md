# @stratix/impl-ai-agents

AI Agent orchestrator with budget control, retries, and audit logging.

## Installation

```bash
pnpm add @stratix/impl-ai-agents
```

## Features

- Budget enforcement per execution
- Automatic retries with exponential backoff
- Audit log of all executions
- Cost tracking across agents
- Thread-safe execution

## Quick Example

```typescript
import { StratixAgentOrchestrator } from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY })
);

orchestrator.registerAgent(agent);

const context = new AgentContext({ sessionId: 'session-1' });
context.setBudget(1.0); // Max $1

const result = await orchestrator.executeAgent(agent.id, input, context);
```

## License

MIT
