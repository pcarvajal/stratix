# Migrating from LangChain to Stratix

This guide helps you migrate your LangChain applications to Stratix AI Agent Framework.

## Why Migrate?

### Advantages of Stratix

1. **Type Safety**: Full TypeScript support with strict typing
2. **Domain-Driven Design**: Built on DDD principles for enterprise applications
3. **Result Pattern**: Explicit error handling without exceptions
4. **Budget Management**: Built-in cost tracking and budget enforcement
5. **Audit Logging**: Comprehensive execution auditing out of the box
6. **Testing**: First-class testing utilities with deterministic mocks
7. **Performance**: Lightweight runtime with minimal dependencies
8. **Architecture**: Clean separation of concerns with well-defined interfaces

## Conceptual Mapping

### Core Concepts

| LangChain            | Stratix                    | Notes                                      |
| -------------------- | -------------------------- | ------------------------------------------ |
| `Chain`              | `AIAgent`                  | Agents are the primary abstraction         |
| `LLM`                | `LLMProvider`              | Provider interface for LLMs                |
| `Tool`               | `AgentTool`                | Tools with custom validation               |
| `Memory`             | `AgentMemory`              | Memory interface with implementations      |
| `AgentExecutor`      | `StratixAgentOrchestrator` | Orchestrates agent execution               |
| `ChatMessageHistory` | `AgentContext.messages`    | Message history in context                 |
| `CallbackManager`    | Lifecycle hooks            | `beforeExecute`, `afterExecute`, `onError` |

### Package Mapping

| LangChain                  | Stratix                                  |
| -------------------------- | ---------------------------------------- |
| `langchain/llms/openai`    | `@stratix/ext-ai-agents-openai`          |
| `langchain/llms/anthropic` | `@stratix/ext-ai-agents-anthropic`       |
| `langchain/chains`         | `@stratix/primitives` (AIAgent)          |
| `langchain/tools`          | `@stratix/abstractions` (AgentTool)      |
| `langchain/memory`         | `@stratix/primitives` (AgentMemory interface), `@stratix/impl-ai-agents` (InMemoryAgentMemory) |
| `langchain/agents`         | `@stratix/impl-ai-agents` (Orchestrator) |

## Migration Examples

### Example 1: Simple LLM Call

**LangChain:**

```typescript
import { OpenAI } from 'langchain/llms/openai';

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
});

const result = await model.call('What is the capital of France?');
console.log(result);
```

**Stratix:**

```typescript
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
});

const response = await provider.chat({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What is the capital of France?' }],
  temperature: 0.7,
});

console.log(response.content);
```

**Key Differences:**

- Stratix uses explicit chat interface
- Messages are structured objects
- Response includes usage statistics and cost

---

### Example 2: Chain with Prompt Template

**LangChain:**

```typescript
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

const model = new OpenAI({ temperature: 0.7 });

const template = 'What is a good name for a company that makes {product}?';
const prompt = new PromptTemplate({
  template,
  inputVariables: ['product'],
});

const chain = new LLMChain({ llm: model, prompt });
const result = await chain.call({ product: 'colorful socks' });

console.log(result.text);
```

**Stratix:**

```typescript
import { AIAgent, AgentResult } from '@stratix/primitives';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

interface CompanyNameInput {
  product: string;
}

interface CompanyNameOutput {
  name: string;
}

class CompanyNameAgent extends AIAgent<CompanyNameInput, CompanyNameOutput> {
  constructor(private provider: OpenAIProvider) {
    super();
  }

  async execute(input: CompanyNameInput): Promise<AgentResult<CompanyNameOutput>> {
    const startTime = Date.now();

    try {
      const response = await this.provider.chat({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `What is a good name for a company that makes ${input.product}?`,
          },
        ],
        temperature: 0.7,
      });

      return AgentResult.success(
        { name: response.content },
        {
          model: 'gpt-4',
          duration: Date.now() - startTime,
          tokenUsage: response.usage,
        }
      );
    } catch (error) {
      return AgentResult.failure(error instanceof Error ? error : new Error('Unknown error'), {
        model: 'gpt-4',
        duration: Date.now() - startTime,
      });
    }
  }
}

// Usage
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });
const agent = new CompanyNameAgent(provider);

const result = await agent.execute({ product: 'colorful socks' });

if (result.isSuccess()) {
  console.log(result.data.name);
}
```

**Key Differences:**

- Stratix uses class-based agents with type safety
- Explicit error handling with Result pattern
- Built-in execution metadata (duration, tokens, cost)

---

### Example 3: Agent with Tools

**LangChain:**

```typescript
import { OpenAI } from 'langchain/llms/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from 'langchain/tools/calculator';

const model = new OpenAI({ temperature: 0 });
const tools = [new Calculator()];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: 'zero-shot-react-description',
});

const result = await executor.call({
  input: 'What is 15% of 85?',
});

console.log(result.output);
```

**Stratix:**

```typescript
import { AIAgent, AgentResult } from '@stratix/primitives';
import { AgentTool } from '@stratix/abstractions';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

// Define calculator tool
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

// Define agent
class MathAgent extends AIAgent<{ query: string }, { answer: string }> {
  constructor(
    private provider: OpenAIProvider,
    private calculator: CalculatorTool
  ) {
    super();
  }

  async execute(input: { query: string }): Promise<AgentResult<{ answer: string }>> {
    const startTime = Date.now();

    try {
      const response = await this.provider.chat({
        model: 'gpt-4',
        messages: [{ role: 'user', content: input.query }],
        tools: [this.calculator.getDefinition()],
        temperature: 0,
      });

      let answer = response.content;

      if (response.toolCalls) {
        for (const toolCall of response.toolCalls) {
          if (toolCall.name === 'calculator') {
            const result = await this.calculator.executeValidated(toolCall.arguments);
            answer = `The answer is ${result.result}`;
          }
        }
      }

      return AgentResult.success(
        { answer },
        {
          model: 'gpt-4',
          duration: Date.now() - startTime,
          tokenUsage: response.usage,
        }
      );
    } catch (error) {
      return AgentResult.failure(error instanceof Error ? error : new Error('Unknown error'), {
        model: 'gpt-4',
        duration: Date.now() - startTime,
      });
    }
  }
}

// Usage
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });
const calculator = new CalculatorTool();
const agent = new MathAgent(provider, calculator);

const result = await agent.execute({ query: 'What is 15% of 85?' });

if (result.isSuccess()) {
  console.log(result.data.answer);
}
```

**Key Differences:**

- Stratix tools use custom validation methods
- Explicit tool execution with type safety
- Direct control over tool call handling

---

### Example 4: Memory and Context

**LangChain:**

```typescript
import { OpenAI } from 'langchain/llms/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';

const model = new OpenAI({});
const memory = new BufferMemory();

const chain = new ConversationChain({ llm: model, memory });

const result1 = await chain.call({ input: "Hi, I'm John" });
console.log(result1.response);

const result2 = await chain.call({ input: "What's my name?" });
console.log(result2.response); // Should remember "John"
```

**Stratix:**

```typescript
import { AIAgent, AgentResult, AgentContext } from '@stratix/primitives';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

class ConversationAgent extends AIAgent<{ input: string }, { response: string }> {
  constructor(private provider: OpenAIProvider) {
    super();
  }

  async execute(
    input: { input: string },
    context?: AgentContext
  ): Promise<AgentResult<{ response: string }>> {
    const startTime = Date.now();

    try {
      // Add user message to context
      if (context) {
        context.addMessage({
          role: 'user',
          content: input.input,
          timestamp: Date.now(),
        });
      }

      // Get conversation history
      const messages = context?.getMessages() || [];

      const response = await this.provider.chat({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

      // Add assistant response to context
      if (context) {
        context.addMessage({
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
        });
      }

      return AgentResult.success(
        { response: response.content },
        {
          model: 'gpt-4',
          duration: Date.now() - startTime,
          tokenUsage: response.usage,
        }
      );
    } catch (error) {
      return AgentResult.failure(error instanceof Error ? error : new Error('Unknown error'), {
        model: 'gpt-4',
        duration: Date.now() - startTime,
      });
    }
  }
}

// Usage
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });
const agent = new ConversationAgent(provider);

const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production',
});

const result1 = await agent.execute({ input: "Hi, I'm John" }, context);
console.log(result1.data?.response);

const result2 = await agent.execute({ input: "What's my name?" }, context);
console.log(result2.data?.response); // Will remember "John"
```

**Key Differences:**

- Context explicitly passed through execution
- Message history managed in AgentContext
- Full control over conversation state

---

### Example 5: Sequential Chains

**LangChain:**

```typescript
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain, SequentialChain } from 'langchain/chains';

const model = new OpenAI({});

const synopsis = new LLMChain({
  llm: model,
  prompt: new PromptTemplate({
    template: 'Write a synopsis for a play about {title}',
    inputVariables: ['title'],
  }),
  outputKey: 'synopsis',
});

const review = new LLMChain({
  llm: model,
  prompt: new PromptTemplate({
    template: 'Write a review for this play synopsis: {synopsis}',
    inputVariables: ['synopsis'],
  }),
  outputKey: 'review',
});

const chain = new SequentialChain({
  chains: [synopsis, review],
  inputVariables: ['title'],
  outputVariables: ['synopsis', 'review'],
});

const result = await chain.call({ title: 'Hamlet' });
console.log(result.synopsis);
console.log(result.review);
```

**Stratix:**

```typescript
import { AIAgent, AgentResult, AgentContext } from '@stratix/primitives';
import {
  StratixAgentOrchestrator,
  InMemoryAgentRepository,
  InMemoryExecutionAuditLog,
} from '@stratix/impl-ai-agents';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

class SynopsisAgent extends AIAgent<{ title: string }, { synopsis: string }> {
  constructor(private provider: OpenAIProvider) {
    super();
  }

  async execute(input: { title: string }): Promise<AgentResult<{ synopsis: string }>> {
    const startTime = Date.now();

    const response = await this.provider.chat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Write a synopsis for a play about ${input.title}` }],
    });

    return AgentResult.success(
      { synopsis: response.content },
      { model: 'gpt-4', duration: Date.now() - startTime }
    );
  }
}

class ReviewAgent extends AIAgent<{ synopsis: string }, { review: string }> {
  constructor(private provider: OpenAIProvider) {
    super();
  }

  async execute(input: { synopsis: string }): Promise<AgentResult<{ review: string }>> {
    const startTime = Date.now();

    const response = await this.provider.chat({
      model: 'gpt-4',
      messages: [
        { role: 'user', content: `Write a review for this play synopsis: ${input.synopsis}` },
      ],
    });

    return AgentResult.success(
      { review: response.content },
      { model: 'gpt-4', duration: Date.now() - startTime }
    );
  }
}

// Setup orchestrator
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! });
const repository = new InMemoryAgentRepository();
const auditLog = new InMemoryExecutionAuditLog();

const orchestrator = new StratixAgentOrchestrator(repository, auditLog, provider);

const synopsisAgent = new SynopsisAgent(provider);
const reviewAgent = new ReviewAgent(provider);

await orchestrator.registerAgent(synopsisAgent);
await orchestrator.registerAgent(reviewAgent);

// Execute sequential workflow
const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production',
});

const synopsisResult = await orchestrator.executeAgent(
  synopsisAgent.id,
  { title: 'Hamlet' },
  context
);

if (synopsisResult.isSuccess()) {
  console.log('Synopsis:', synopsisResult.data.synopsis);

  const reviewResult = await orchestrator.executeAgent(
    reviewAgent.id,
    { synopsis: synopsisResult.data.synopsis },
    context
  );

  if (reviewResult.isSuccess()) {
    console.log('Review:', reviewResult.data.review);
  }
}
```

**Key Differences:**

- Explicit orchestration of agent workflow
- Type-safe data flow between agents
- Built-in audit logging for each step
- Error handling at each stage

---

## Step-by-Step Migration Guide

### Step 1: Install Stratix Packages

```bash
# Remove LangChain
npm uninstall langchain

# Install Stratix core packages
npm install @stratix/primitives @stratix/abstractions @stratix/impl-ai-agents

# Install provider
npm install @stratix/ext-ai-agents-openai
# or
npm install @stratix/ext-ai-agents-anthropic

# Install testing (dev)
npm install -D @stratix/testing
```

### Step 2: Update Imports

**Before:**

```typescript
import { OpenAI } from 'langchain/llms/openai';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
```

**After:**

```typescript
import { AIAgent, AgentResult, AgentContext } from '@stratix/primitives';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';
import { StratixAgentOrchestrator } from '@stratix/impl-ai-agents';
```

### Step 3: Convert Chains to Agents

**Pattern:**

```typescript
// LangChain Chain
class MyChain extends LLMChain { ... }

// Becomes Stratix Agent
class MyAgent extends AIAgent<InputType, OutputType> {
  async execute(input: InputType): Promise<AgentResult<OutputType>> {
    // Implementation
  }
}
```

### Step 4: Update Tool Definitions

**Pattern:**

```typescript
// LangChain Tool
class MyTool extends Tool {
  name = "my_tool";
  description = "Does something";

  async _call(input: string): Promise<string> {
    // Implementation
  }
}

// Becomes Stratix AgentTool
interface MyToolInput {
  // Input properties
}

interface MyToolOutput {
  // Output properties
}

class MyTool extends AgentTool<MyToolInput, MyToolOutput> {
  readonly name = "my_tool";
  readonly description = "Does something";

  async validate(input: unknown): Promise<MyToolInput> {
    // Implement validation logic
    if (typeof input !== 'object' || !input) {
      throw new Error('Invalid input');
    }
    return input as MyToolInput;
  }

  async execute(input: MyToolInput): Promise<MyToolOutput> {
    // Implementation
  }

  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          // Define parameters
        },
        required: []
      }
    };
  }
}
```

### Step 5: Update Memory Handling

**Pattern:**

```typescript
// LangChain Memory
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory });

// Becomes Stratix Context
const context = new AgentContext({
  userId: 'user-123',
  sessionId: 'session-456',
  environment: 'production',
});

// Pass context through agent execution
const result = await agent.execute(input, context);
```

### Step 6: Update Error Handling

**Pattern:**

```typescript
// LangChain (exception-based)
try {
  const result = await chain.call(input);
  console.log(result.text);
} catch (error) {
  console.error(error);
}

// Becomes Stratix (Result pattern)
const result = await agent.execute(input);

if (result.isSuccess()) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Step 7: Add Budget Management (New Feature)

```typescript
const context = new AgentContext({ ... });
context.setBudget(1.00); // Max $1.00

const result = await orchestrator.executeAgent(agentId, input, context);

console.log(`Cost: $${result.metadata.cost}`);
console.log(`Remaining: $${context.getRemainingBudget()}`);
```

### Step 8: Add Testing

```typescript
import { AgentTester, createTestContext } from '@stratix/testing';

describe('MyAgent', () => {
  let tester: AgentTester;

  beforeEach(() => {
    tester = new AgentTester();
  });

  it('should work correctly', async () => {
    tester.setMockResponse({
      content: '{"result": "success"}',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    });

    const result = await tester.test(agent, input);
    expect(result.passed).toBe(true);
  });
});
```

---

## Common Patterns

### Pattern 1: ReAct Agent

**LangChain:**

```typescript
const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: 'zero-shot-react-description',
});
```

**Stratix:**

```typescript
class ReActAgent extends AIAgent<Input, Output> {
  constructor(
    private provider: LLMProvider,
    private tools: AgentTool<any, any>[]
  ) {
    super();
  }

  async execute(input: Input): Promise<AgentResult<Output>> {
    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      const response = await this.provider.chat({
        model: 'gpt-4',
        messages: [...],
        tools: this.tools.map(t => t.getDefinition())
      });

      if (!response.toolCalls) {
        // Final answer
        return AgentResult.success(this.parseOutput(response.content), {});
      }

      // Execute tools
      for (const toolCall of response.toolCalls) {
        const tool = this.tools.find(t => t.name === toolCall.name);
        if (tool) {
          await tool.executeValidated(toolCall.arguments);
        }
      }

      iterations++;
    }

    return AgentResult.failure(new Error('Max iterations reached'), {});
  }
}
```

### Pattern 2: Map-Reduce

**LangChain:**

```typescript
import { loadSummarizationChain } from 'langchain/chains';

const chain = loadSummarizationChain(llm, { type: 'map_reduce' });
```

**Stratix:**

```typescript
class MapReduceAgent extends AIAgent<{ documents: string[] }, { summary: string }> {
  async execute(input: { documents: string[] }): Promise<AgentResult<{ summary: string }>> {
    // Map phase: summarize each document
    const summaries = await Promise.all(input.documents.map((doc) => this.summarizeDocument(doc)));

    // Reduce phase: combine summaries
    const finalSummary = await this.combineSummaries(summaries);

    return AgentResult.success({ summary: finalSummary }, {});
  }

  private async summarizeDocument(doc: string): Promise<string> {
    const response = await this.provider.chat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Summarize: ${doc}` }],
    });
    return response.content;
  }

  private async combineSummaries(summaries: string[]): Promise<string> {
    const response = await this.provider.chat({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Combine these summaries: ${summaries.join('\n')}` }],
    });
    return response.content;
  }
}
```

---

## Key Differences

### 1. Architecture

**LangChain:**

- Function/class-based chains
- Implicit composition
- Callback-based extensibility

**Stratix:**

- Agent-based architecture
- Explicit orchestration
- Lifecycle hooks for extensibility

### 2. Type Safety

**LangChain:**

- Loose typing
- Runtime validation
- Generic `call()` method

**Stratix:**

- Strict TypeScript
- Compile-time type checking
- Type-safe `execute()` with generics

### 3. Error Handling

**LangChain:**

- Exception-based
- Try-catch blocks

**Stratix:**

- Result pattern
- Explicit success/failure handling

### 4. Testing

**LangChain:**

- Limited testing utilities
- Requires API calls or complex mocking

**Stratix:**

- First-class testing support
- Deterministic mock providers
- Type-safe assertions

### 5. Cost Management

**LangChain:**

- Manual tracking
- Callbacks for monitoring

**Stratix:**

- Built-in budget management
- Automatic cost calculation
- Budget enforcement

---

## Migration Checklist

- [ ] Install Stratix packages
- [ ] Remove LangChain dependencies
- [ ] Update imports
- [ ] Convert chains to agents
- [ ] Update tool definitions with custom validation
- [ ] Replace memory with AgentContext
- [ ] Update error handling to Result pattern
- [ ] Add budget management
- [ ] Update tests to use AgentTester
- [ ] Add audit logging
- [ ] Test all functionality
- [ ] Update documentation

---

## Getting Help

- [API Reference](../api/README.md)
- [Examples](../../examples/)
- [Troubleshooting Guide](./troubleshooting.md)
- [GitHub Issues](https://github.com/pcarvajal/stratix/issues)
- [Discord Community](https://discord.gg/stratix)

---

## FAQ

**Q: Can I use both LangChain and Stratix together?**

A: Yes, but it's not recommended. They have different architectural patterns that may conflict. We recommend a complete migration.

**Q: How do I migrate my custom LangChain tools?**

A: Convert them to `AgentTool` classes with custom validation methods. See the tool migration example above.

**Q: What about vector stores and embeddings?**

A: Stratix providers support embeddings. For vector stores, use your preferred solution (Pinecone, Weaviate, etc.) directly.

**Q: Is there a performance difference?**

A: Stratix is generally faster due to fewer abstractions and dependencies. Benchmark your specific use case.

**Q: How do I migrate streaming responses?**

A: Both frameworks support streaming. Use `provider.streamChat()` in Stratix instead of LangChain's streaming API.

**Q: What about retrieval and document loading?**

A: Stratix focuses on agent orchestration. Use dedicated libraries for document loading and integrate them via AgentTools.
