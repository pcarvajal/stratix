# AI Agents

AI Agents in Stratix are first-class domain entities that extend the `AIAgent<TInput, TOutput>` base class. Unlike traditional frameworks that treat AI as an afterthought, Stratix makes agents core domain entities with the same rigor as the rest of your application.

## Why AI Agents as Domain Entities?

Traditional approaches treat AI as utilities or service classes:

```typescript
// Traditional approach - AI as a utility
class AIService {
  async complete(prompt: string): Promise<string> {
    // No type safety, no domain modeling
  }
}
```

Stratix treats agents as domain entities with identity, lifecycle, and domain logic:

```typescript
// Stratix approach - AI as domain entity
class CustomerSupportAgent extends AIAgent<Ticket, Response> {
  readonly name = 'Customer Support';

  async execute(ticket: Ticket): Promise<AgentResult<Response>> {
    // Type-safe, trackable, observable
  }
}
```

## Core Concepts

### AIAgent Base Class

All agents extend `AIAgent<TInput, TOutput>`:

```typescript
import { AIAgent, AgentResult, AgentVersionFactory, EntityId } from '@stratix/primitives';
import { LLMProvider } from '@stratix/abstractions';

class MyAgent extends AIAgent<InputType, OutputType> {
  readonly name = 'My Agent';
  readonly version = AgentVersionFactory.create('1.0.0');

  constructor(private llmProvider: LLMProvider) {
    super(EntityId.create<'Agent'>());
  }

  async execute(input: InputType): Promise<AgentResult<OutputType>> {
    // Your agent logic here
  }
}
```

**Key Properties**:
- `name`: Human-readable agent name
- `description`: What the agent does
- `version`: Semantic versioning for agents
- `capabilities`: Array of agent capabilities
- `status`: Current status (ACTIVE, INACTIVE, MAINTENANCE)

### Type-Safe Execution

Agents are fully type-safe with TypeScript generics:

```typescript
interface AnalysisInput {
  data: string;
  format: 'json' | 'csv';
}

interface AnalysisOutput {
  summary: string;
  insights: string[];
  confidence: number;
}

class DataAnalysisAgent extends AIAgent<AnalysisInput, AnalysisOutput> {
  async execute(input: AnalysisInput): Promise<AgentResult<AnalysisOutput>> {
    // TypeScript enforces types throughout
    const response = await this.llmProvider.chat({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a data analyst.' },
        { role: 'user', content: `Analyze: ${input.data}` }
      ]
    });

    return AgentResult.success({
      summary: response.content,
      insights: this.extractInsights(response.content),
      confidence: 0.85
    });
  }
}
```

### LLM Provider Abstraction

Stratix provides an abstraction layer for LLM providers:

```typescript
interface LLMProvider {
  readonly name: string;
  readonly models: string[];

  chat(params: ChatParams): Promise<ChatResponse>;
  streamChat(params: ChatParams): AsyncIterable<ChatChunk>;
  embeddings(params: EmbeddingParams): Promise<EmbeddingResponse>;
}
```

**Available Providers**:
- `OpenAIProvider` - GPT-4, GPT-3.5, embeddings
- `AnthropicProvider` - Claude 3 family
- `MockLLMProvider` - Testing and development

**Switching Providers**:

```typescript
// OpenAI
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY
});

// Anthropic
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';
const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Mock (for testing)
import { MockLLMProvider } from '@stratix/testing';
const provider = new MockLLMProvider({
  responses: ['Mocked response'],
  cost: 0.001
});
```

## Agent Orchestration

The `StratixAgentOrchestrator` manages agent lifecycle and execution:

```typescript
import { StratixAgentOrchestrator } from '@stratix/impl-ai-agents';
import { InMemoryAgentRepository, InMemoryExecutionAuditLog } from '@stratix/impl-ai-agents';

const repository = new InMemoryAgentRepository();
const auditLog = new InMemoryExecutionAuditLog();

const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  openAIProvider
);

// Register agent
await orchestrator.registerAgent(myAgent);

// Execute with context
const context = new AgentContext({ sessionId: 'session-1' });
const result = await orchestrator.executeAgent(myAgent.id, input, context);
```

### Budget Enforcement

Control costs with budget enforcement:

```typescript
const context = new AgentContext({
  sessionId: 'session-1',
  userId: 'user-123'
});

// Set budget: max $5 per execution
context.setBudget(5.0);

const result = await orchestrator.executeAgent(agentId, input, context);

console.log('Cost:', context.getTotalCost());
console.log('Remaining:', context.getRemainingBudget());

if (context.isBudgetExceeded()) {
  console.error('Budget exceeded!');
}
```

### Automatic Retries

Configure retry strategy:

```typescript
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  provider,
  {
    retryConfig: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    }
  }
);
```

### Audit Logging

All executions are automatically logged:

```typescript
const executions = await auditLog.findByAgentId(agentId);

for (const execution of executions) {
  console.log({
    executionId: execution.executionId,
    agentId: execution.agentId,
    input: execution.input,
    output: execution.output,
    cost: execution.cost,
    duration: execution.duration,
    timestamp: execution.timestamp,
    success: execution.success
  });
}
```

## Agent Tools

Agents can use tools for function calling:

```typescript
import { StratixTool } from '@stratix/primitives';
import { z } from 'zod';

const SearchInputSchema = z.object({
  query: z.string(),
  limit: z.number().optional()
});

class SearchTool extends StratixTool<
  z.infer<typeof SearchInputSchema>,
  { results: string[] }
> {
  readonly name = 'search_database';
  readonly description = 'Search the product database';

  async execute(input: z.infer<typeof SearchInputSchema>) {
    const results = await this.database.search(input.query, input.limit);
    return { results };
  }

  async validate(input: unknown): Promise<boolean> {
    return SearchInputSchema.safeParse(input).success;
  }
}

// Register tool with agent
const agent = AIAgent.create({
  name: 'Product Assistant',
  llmProvider,
  tools: [new SearchTool(database)]
});
```

## Agent Memory

Agents can maintain context across executions:

```typescript
interface MemoryStore {
  store(key: string, value: unknown, scope: MemoryScope): Promise<void>;
  retrieve(key: string, scope: MemoryScope): Promise<unknown | null>;
  search(query: string, limit: number): Promise<MemoryEntry[]>;
}

class CustomerSupportAgent extends AIAgent<Query, Response> {
  async execute(input: Query): Promise<AgentResult<Response>> {
    // Store short-term memory (conversation)
    await this.remember('currentQuery', input, 'short');

    // Retrieve long-term memory (user history)
    const history = await this.recall('userHistory');

    // Search similar conversations
    const similar = await this.searchMemory('similar issue', 5);

    // Use context in LLM call
    const response = await this.llmProvider.chat({
      messages: [
        { role: 'system', content: this.buildContext(history, similar) },
        { role: 'user', content: input.message }
      ]
    });

    return AgentResult.success({ response: response.content });
  }
}
```

## Multi-Agent Patterns

### Sequential Execution

Run agents in sequence, passing output to next agent:

```typescript
const blogPost = await orchestrator.executeSequential(
  [researchAgent, writingAgent, reviewAgent],
  { topic: 'AI in Healthcare' },
  context
);
```

### Parallel Execution

Run agents in parallel:

```typescript
const results = await orchestrator.executeParallel(
  [sqlAgent, apiAgent, fileAgent],
  { query: 'Q4 revenue' },
  context
);
```

### Agent Pipelines

Build complex workflows:

```typescript
class BlogWritingPipeline {
  constructor(
    private research: ResearchAgent,
    private writer: WritingAgent,
    private editor: EditorAgent,
    private seo: SEOAgent
  ) {}

  async execute(topic: string): Promise<BlogPost> {
    const context = new AgentContext({ sessionId: uuidv4() });
    context.setBudget(10.0);

    // Step 1: Research
    const research = await this.research.execute({ topic });
    if (research.isFailure) throw research.error;

    // Step 2: Write draft
    const draft = await this.writer.execute({
      topic,
      research: research.value
    });
    if (draft.isFailure) throw draft.error;

    // Step 3: Edit
    const edited = await this.editor.execute({
      draft: draft.value
    });
    if (edited.isFailure) throw edited.error;

    // Step 4: SEO optimization
    const optimized = await this.seo.execute({
      content: edited.value
    });
    if (optimized.isFailure) throw optimized.error;

    return optimized.value;
  }
}
```

## Testing AI Agents

Use mock providers for deterministic testing:

```typescript
import { describe, it, expect } from 'vitest';
import { MockLLMProvider } from '@stratix/testing';

describe('CustomerSupportAgent', () => {
  it('should respond to greeting', async () => {
    const mockProvider = new MockLLMProvider({
      responses: ['Hello! How can I help you today?'],
      cost: 0.001,
      tokensPerRequest: 50
    });

    const agent = new CustomerSupportAgent(mockProvider);
    const result = await agent.execute({ message: 'Hi' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.response).toBe('Hello! How can I help you today?');
  });

  it('should handle failures gracefully', async () => {
    const mockProvider = new MockLLMProvider({
      responses: [],
      failureRate: 1.0  // Always fail
    });

    const agent = new CustomerSupportAgent(mockProvider);
    const result = await agent.execute({ message: 'Hi' });

    expect(result.isFailure).toBe(true);
  });
});
```

## Cost Tracking

Track costs automatically:

```typescript
const result = await orchestrator.executeAgent(agentId, input, context);

console.log({
  promptTokens: result.usage.promptTokens,
  completionTokens: result.usage.completionTokens,
  totalTokens: result.usage.totalTokens,
  cost: result.cost  // in USD
});

// Provider calculates cost based on model pricing
const cost = provider.calculateCost('gpt-4', {
  promptTokens: 1000,
  completionTokens: 500,
  totalTokens: 1500
});
```

## Production Patterns

### Error Handling

Always handle errors with Result pattern:

```typescript
class RobustAgent extends AIAgent<Input, Output> {
  async execute(input: Input): Promise<AgentResult<Output>> {
    try {
      // Validate input
      if (!this.validateInput(input)) {
        return AgentResult.failure(
          new Error('Invalid input')
        );
      }

      // Execute LLM call
      const response = await this.llmProvider.chat({...});

      // Validate output
      if (!this.validateOutput(response)) {
        return AgentResult.failure(
          new Error('Invalid output from LLM')
        );
      }

      return AgentResult.success(this.parseOutput(response));

    } catch (error) {
      return AgentResult.failure(error as Error);
    }
  }
}
```

### Monitoring

Monitor agent performance:

```typescript
const executions = await auditLog.findByAgentId(agentId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});

const metrics = {
  totalExecutions: executions.length,
  successRate: executions.filter(e => e.success).length / executions.length,
  avgDuration: executions.reduce((sum, e) => sum + e.duration, 0) / executions.length,
  totalCost: executions.reduce((sum, e) => sum + e.cost, 0),
  avgCost: executions.reduce((sum, e) => sum + e.cost, 0) / executions.length
};

console.log('Agent Metrics:', metrics);
```

### Versioning

Version your agents:

```typescript
class MyAgent extends AIAgent<Input, Output> {
  constructor(llmProvider: LLMProvider) {
    super(AgentId.create());
    this.version = AgentVersion.create('2.1.0');
  }
}

// Track version in executions
const execution = await auditLog.findById(executionId);
console.log('Agent version:', execution.agentVersion);
```

## Learn More

Start with the **AI Agent Starter** template to learn these patterns hands-on:

```bash
npm create stratix my-learning -- --template ai-agent-starter
cd my-learning
pnpm start
```

The interactive learning path covers:
1. Agent fundamentals (no API key)
2. Testing patterns (no API key)
3. LLM integration
4. Tools and function calling
5. Memory management
6. Production patterns

Total cost: ~$0.30-0.50

## Next Steps

- [Architecture](./architecture.md) - Understand how agents fit in the architecture
- [Testing](../advanced/testing.md) - Testing strategies for AI agents
- [Examples](../examples/overview.md) - See complete agent examples
