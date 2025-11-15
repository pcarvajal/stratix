# AI Agents Examples

Production-ready AI agent examples demonstrating the Stratix AI Agent framework.

## Available Examples

### Echo Agent (Simple)

Minimal agent demonstrating core concepts without LLM integration.

```bash
cd echo-agent
pnpm start
```

- No API key required
- Learn agent basics
- Understand lifecycle and execution
- See audit logging

### Customer Support Agent (Advanced)

Production-ready agent with real LLM integration and tools.

```bash
export OPENAI_API_KEY=sk-your-key-here
cd customer-support
pnpm start
```

- Uses OpenAI GPT-4
- Multiple tools (knowledge base, customer history)
- Structured outputs with Zod
- Budget enforcement and cost tracking

### Data Analysis Agent (Advanced)

Agent that analyzes data and generates visualizations.

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
cd data-analysis
pnpm start
```

- Uses Anthropic Claude
- SQL query execution
- Data visualization
- Report generation

## Learning Path

1. **Start with Echo Agent** - Learn basic agent structure
2. **Move to Customer Support Agent** - Real LLM integration
3. **Build Your Own** - Use examples as templates

## Framework Features

**Type Safety:**
- Full TypeScript type safety
- Zod schema validation
- Generic input/output types

**Production Ready:**
- Error handling with retries
- Budget enforcement
- Cost tracking
- Execution audit logs

**Multi-Provider:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3, Claude 3.5)
- Easy to add custom providers

## Key Concepts

**Agent Structure:**
```typescript
import { AIAgent, AgentResult } from '@stratix/primitives';

class MyAgent extends AIAgent<MyInput, MyOutput> {
  readonly name = 'My Agent';
  readonly version = AgentVersionFactory.create('1.0.0');

  async execute(input: MyInput): Promise<AgentResult<MyOutput>> {
    // Your implementation
  }
}
```

**Orchestration:**
```typescript
import { StratixAgentOrchestrator } from '@stratix/impl-ai-agents';

const orchestrator = new StratixAgentOrchestrator(repository, auditLog, llmProvider);
orchestrator.registerAgent(myAgent);
const result = await orchestrator.executeAgent(agentId, input, context);
```

**LLM Providers:**
```typescript
// OpenAI
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
const provider = new OpenAIProvider({ apiKey: '...' });

// Anthropic
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';
const provider = new AnthropicProvider({ apiKey: '...' });
```

**Tools:**
```typescript
import { AgentTool } from '@stratix/abstractions';

class MyTool extends AgentTool<Input, Output> {
  readonly name = 'my_tool';
  readonly description = 'What this tool does';

  async execute(input: Input): Promise<Output> {
    // Implementation
  }

  async validate(input: unknown): Promise<Input> {
    return MyInputSchema.parse(input);
  }
}
```

## Common Patterns

**Sequential Execution:**
```typescript
const result = await orchestrator.executeSequential(
  [researchAgent, writingAgent, reviewAgent],
  initialInput,
  context
);
```

**Parallel Execution:**
```typescript
const results = await orchestrator.executeParallel(
  [analyzerAgent, summarizerAgent, translatorAgent],
  input,
  context
);
```

**Budget Control:**
```typescript
const context = new AgentContext({ sessionId: '...' });
context.setBudget(1.0); // $1 max

if (context.isBudgetExceeded()) {
  console.log('Stop execution');
}
```

## License

MIT
