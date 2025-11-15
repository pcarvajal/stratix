# Customer Support Agent Example

A comprehensive example demonstrating production-ready AI agent features with real LLM integration.

## Overview

The Customer Support Agent is a fully-featured AI agent that:
- Handles support tickets with intelligent, empathetic responses
- Searches a knowledge base for relevant solutions
- Reviews customer history for context
- Performs sentiment analysis
- Recommends escalation when appropriate
- Tracks costs and enforces budgets
- Uses OpenAI GPT-4o with structured outputs

## Features Demonstrated

- **Real LLM Integration**: Uses OpenAI GPT-4o API
- **Tool Usage**: Multiple tools (knowledge base search, customer history)
- **Structured Outputs**: JSON schema validation with Zod
- **Memory Management**: Agent memory for context
- **Cost Tracking**: Per-request cost calculation and budget enforcement
- **Error Handling**: Automatic retries and graceful failures
- **Audit Logging**: Complete execution history
- **Lifecycle Hooks**: beforeExecute, afterExecute for custom logic
- **Type Safety**: End-to-end TypeScript type safety

## Prerequisites

This example requires an OpenAI API key and will make actual API calls.

1. **OpenAI API Key**: Get one at https://platform.openai.com/api-keys
2. **API Credits**: Example will cost approximately $0.01-0.05 per run

## Setup

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key-here

# From the project root
cd examples/ai-agents/customer-support

# Install dependencies (if not already installed)
pnpm install

# Run the example
pnpm start
```

## Expected Output

The example processes 3 different support tickets:

```
=== Stratix AI Agents: Customer Support Agent Example ===

Registered agent: Customer Support Agent v1.0.0
Capabilities: customer_support, knowledge_retrieval, sentiment_analysis
Model: openai/gpt-4o

======================================================================
Processing Ticket 1/3: T-001
======================================================================

Subject: Cannot log in to my account
Description: I forgot my password and the reset email is not arriving
Priority: high | Category: account

[CustomerSupportAgent] Processing ticket T-001
Priority: high | Category: account

--- Agent Response ---
I'm sorry to hear you're having trouble logging in! I understand how frustrating
that can be. Let me help you with the password reset process...

[Full response with solution steps]

--- Analysis ---
Sentiment: positive
Escalate: NO
Suggested Actions: verify_email, check_spam_folder, try_alternative_email
Estimated Resolution: 0.5 hours

--- Execution Metadata ---
Model: gpt-4o
Tokens: 856
Cost: $0.0067
Budget Remaining: $0.9933

[... processes remaining tickets ...]

======================================================================
Overall Statistics
======================================================================

Total Executions: 3
Successful: 3
Failed: 0
Average Duration: 2341.33ms
Total Cost: $0.0150
Average Cost per Ticket: $0.0050

=== Example Complete ===
```

## Code Structure

```
customer-support/
├── src/
│   ├── domain/
│   │   └── types.ts              # Domain types and Zod schemas
│   ├── tools/
│   │   ├── SearchKnowledgeBaseTool.ts    # KB search tool
│   │   └── GetCustomerHistoryTool.ts     # Customer history tool
│   ├── CustomerSupportAgent.ts   # Main agent implementation
│   └── index.ts                  # Example runner
├── package.json
├── tsconfig.json
└── README.md
```

## Key Concepts

### 1. Agent with LLM Provider

```typescript
export class CustomerSupportAgent extends AIAgent<SupportTicket, SupportResponse> {
  readonly model: ModelConfig = {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000
  };

  constructor(private llmProvider: LLMProvider) {
    super(EntityId.create<'AIAgent'>(), new Date(), new Date());
  }

  async execute(ticket: SupportTicket): Promise<AgentResult<SupportResponse>> {
    // Call LLM with structured output
    const response = await this.llmProvider.chat({
      model: this.model.model,
      messages,
      responseFormat: { type: 'json_schema', schema: ... }
    });
  }
}
```

### 2. Custom Tools with Validation

```typescript
export class SearchKnowledgeBaseTool extends AgentTool<Input, Output> {
  readonly name = 'search_knowledge_base';
  readonly description = 'Search company knowledge base...';

  async execute(input: Input): Promise<Output> {
    // Implementation
  }

  async validate(input: unknown): Promise<Input> {
    return InputSchema.parse(input); // Zod validation
  }

  getDefinition(): ToolDefinition {
    // For LLM function calling
  }
}
```

### 3. Budget Enforcement

```typescript
const context = new AgentContext({
  sessionId: 'session-id',
  environment: 'production'
});

context.setBudget(1.00); // $1 maximum

// Orchestrator will stop execution if budget exceeded
const result = await orchestrator.executeAgent(agentId, input, context);

console.log(`Remaining: $${context.getRemainingBudget()}`);
```

### 4. Structured Outputs with Zod

```typescript
const SupportResponseSchema = z.object({
  response: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  suggestedActions: z.array(z.string()),
  escalate: z.boolean()
});

// LLM returns validated JSON matching this schema
const response = await llmProvider.chat({
  responseFormat: {
    type: 'json_schema',
    schema: zodToJsonSchema(SupportResponseSchema)
  }
});
```

### 5. Audit Logging and Statistics

```typescript
const stats = await auditLog.getStatistics({
  agentId: supportAgent.getAgentId()
});

console.log(`Total Cost: $${stats.totalCost.toFixed(4)}`);
console.log(`Success Rate: ${stats.successfulExecutions / stats.totalExecutions * 100}%`);
```

## Customization

### Add More Tools

Create new tools by extending `AgentTool`:

```typescript
class CreateRefundTool extends AgentTool<RefundInput, RefundOutput> {
  readonly name = 'create_refund';
  readonly requiresApproval = true; // Requires human approval

  async execute(input: RefundInput): Promise<RefundOutput> {
    // Implementation
  }
}
```

### Change LLM Provider

Switch to Anthropic Claude:

```typescript
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';

const llmProvider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

const agent = new CustomerSupportAgent(llmProvider);
agent.model = {
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  temperature: 0.7,
  maxTokens: 2000
};
```

### Add Persistent Memory

Replace in-memory with Redis:

```typescript
// (Future implementation)
import { RedisAgentMemory } from '@stratix/ext-ai-agents-memory-redis';

const memory = new RedisAgentMemory({
  url: process.env.REDIS_URL
});

agent.setMemory(memory);
```

## Production Considerations

### 1. Rate Limiting

Add rate limiting to prevent API quota exhaustion:

```typescript
// Implement in your orchestrator or tool
const rateLimiter = new RateLimiter({ maxRequests: 10, perMinutes: 1 });
```

### 2. Caching

Cache knowledge base searches and customer history:

```typescript
class CachedSearchTool extends SearchKnowledgeBaseTool {
  private cache = new Map();

  async execute(input: Input): Promise<Output> {
    const cacheKey = input.query;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    const result = await super.execute(input);
    this.cache.set(cacheKey, result);
    return result;
  }
}
```

### 3. Error Monitoring

Integrate with error tracking:

```typescript
protected async onError(error: Error): Promise<void> {
  Sentry.captureException(error, {
    tags: { agent: this.name, version: this.version.value }
  });
}
```

### 4. Human-in-the-Loop

Implement approval workflows for sensitive actions:

```typescript
if (response.escalate || ticket.priority === 'urgent') {
  await approvalService.requestApproval({
    agentId: this.getAgentId(),
    action: 'send_response',
    context: { ticket, response }
  });
}
```

## Troubleshooting

### API Key Not Found

```
ERROR: OPENAI_API_KEY environment variable not set
```

**Solution**: Set the environment variable:
```bash
export OPENAI_API_KEY=sk-your-key-here
```

### Budget Exceeded

```
Budget exceeded! Stopping execution.
```

**Solution**: Increase budget or optimize prompts:
```typescript
context.setBudget(5.00); // Increase to $5
```

### Rate Limit Errors

**Solution**: Enable automatic retries:
```typescript
const orchestrator = new StratixAgentOrchestrator(
  repository,
  auditLog,
  llmProvider,
  {
    autoRetry: true,
    maxRetries: 3 // Retry up to 3 times
  }
);
```

## Next Steps

- Add more sophisticated tools (database queries, API integrations)
- Implement multi-agent workflows (escalation chains)
- Add vector-based semantic search for knowledge base
- Integrate with real ticketing systems (Zendesk, Intercom)
- Deploy to production with proper monitoring

## Related Examples

- **echo-agent**: Simple agent without LLM (learn basics)
- **data-analysis-agent**: Agent with SQL and visualization (coming soon)
