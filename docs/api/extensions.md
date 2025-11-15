# LLM Provider Extensions API Reference

Official LLM provider implementations for Stratix AI agents.

## @stratix/ext-ai-agents-openai

OpenAI provider implementation supporting GPT-4, GPT-3.5, and embedding models.

### Installation

```bash
npm install @stratix/ext-ai-agents-openai
# or
pnpm add @stratix/ext-ai-agents-openai
```

### OpenAIProvider

```typescript
class OpenAIProvider implements LLMProvider
```

#### Constructor

```typescript
new OpenAIProvider(config: {
  apiKey: string;
  organization?: string;
  baseURL?: string;
})
```

**Parameters:**

- `apiKey` - OpenAI API key (required)
- `organization` - OpenAI organization ID (optional)
- `baseURL` - Custom API base URL (optional, for proxies or compatible endpoints)

#### Supported Models

- `gpt-4` - Most capable model, best for complex tasks
- `gpt-4-turbo` - Faster and cheaper GPT-4
- `gpt-4-turbo-preview` - Latest GPT-4 turbo preview
- `gpt-3.5-turbo` - Fast and efficient for simple tasks
- `gpt-3.5-turbo-16k` - Extended context window version

#### Embedding Models

- `text-embedding-3-small` - Small, fast embeddings
- `text-embedding-3-large` - Large, high-quality embeddings
- `text-embedding-ada-002` - Legacy embedding model

#### Example: Basic Usage

```typescript
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!
});

const response = await provider.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'What is the capital of France?' }
  ],
  temperature: 0.7,
  maxTokens: 100
});

console.log(response.content);
console.log('Tokens used:', response.usage.totalTokens);
```

#### Example: With Function Calling

```typescript
const response = await provider.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'What is the weather in Paris?' }
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City name'
            },
            unit: {
              type: 'string',
              enum: ['celsius', 'fahrenheit']
            }
          },
          required: ['location']
        }
      }
    }
  ]
});

if (response.toolCalls) {
  console.log('Tool calls:', response.toolCalls);
}
```

#### Example: Streaming

```typescript
for await (const chunk of provider.streamChat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Tell me a story' }
  ]
})) {
  process.stdout.write(chunk.content);

  if (chunk.isComplete) {
    console.log('\n\nDone!');
  }
}
```

#### Example: Embeddings

```typescript
const response = await provider.embeddings({
  model: 'text-embedding-3-small',
  input: 'The quick brown fox jumps over the lazy dog'
});

console.log('Embedding dimensions:', response.embeddings[0].length);
console.log('First 5 values:', response.embeddings[0].slice(0, 5));
```

#### Example: Structured Output

```typescript
const response = await provider.chat({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Extract person info: John Doe, 30 years old, lives in NYC' }
  ],
  responseFormat: {
    type: 'json_schema',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        city: { type: 'string' }
      },
      required: ['name', 'age', 'city']
    }
  }
});

const data = JSON.parse(response.content);
console.log(data); // { name: "John Doe", age: 30, city: "NYC" }
```

#### Pricing (as of 2025)

Per 1M tokens:

| Model | Input | Output |
|-------|-------|--------|
| GPT-4 | $30.00 | $60.00 |
| GPT-4 Turbo | $10.00 | $30.00 |
| GPT-3.5 Turbo | $0.50 | $1.50 |
| Embedding 3 Small | $0.02 | - |
| Embedding 3 Large | $0.13 | - |

The provider automatically calculates costs and includes them in execution metadata.

---

## @stratix/ext-ai-agents-anthropic

Anthropic provider implementation supporting Claude 3 models.

### Installation

```bash
npm install @stratix/ext-ai-agents-anthropic
# or
pnpm add @stratix/ext-ai-agents-anthropic
```

### AnthropicProvider

```typescript
class AnthropicProvider implements LLMProvider
```

#### Constructor

```typescript
new AnthropicProvider(config: {
  apiKey: string;
  baseURL?: string;
})
```

**Parameters:**

- `apiKey` - Anthropic API key (required)
- `baseURL` - Custom API base URL (optional)

#### Supported Models

- `claude-3-opus-20240229` - Most capable, best for complex tasks
- `claude-3-sonnet-20240229` - Balanced performance and cost
- `claude-3-5-sonnet-20241022` - Latest Sonnet with improved capabilities
- `claude-3-haiku-20240307` - Fastest and most affordable

#### Example: Basic Usage

```typescript
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

const response = await provider.chat({
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'user', content: 'Explain quantum computing in simple terms' }
  ],
  temperature: 0.7,
  maxTokens: 1000
});

console.log(response.content);
console.log('Tokens used:', response.usage.totalTokens);
```

#### Example: With System Prompt

```typescript
const response = await provider.chat({
  model: 'claude-3-sonnet-20240229',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful physics teacher explaining concepts to high school students'
    },
    {
      role: 'user',
      content: 'What is relativity?'
    }
  ]
});
```

#### Example: With Tool Use

```typescript
const response = await provider.chat({
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'user', content: 'Calculate 15% tip on $85.50' }
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        parameters: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Math expression to evaluate'
            }
          },
          required: ['expression']
        }
      }
    }
  ]
});

if (response.toolCalls) {
  for (const toolCall of response.toolCalls) {
    console.log(`Tool: ${toolCall.name}`);
    console.log('Arguments:', toolCall.arguments);
  }
}
```

#### Example: Streaming

```typescript
for await (const chunk of provider.streamChat({
  model: 'claude-3-haiku-20240307',
  messages: [
    { role: 'user', content: 'Write a haiku about programming' }
  ]
})) {
  process.stdout.write(chunk.content);

  if (chunk.isComplete) {
    console.log('\n\nDone!');
  }
}
```

#### Example: Multi-Turn Conversation

```typescript
const messages = [
  {
    role: 'user' as const,
    content: 'What is the capital of France?'
  }
];

let response = await provider.chat({
  model: 'claude-3-sonnet-20240229',
  messages
});

console.log('Claude:', response.content);

// Continue conversation
messages.push({
  role: 'assistant' as const,
  content: response.content
});

messages.push({
  role: 'user' as const,
  content: 'What is its population?'
});

response = await provider.chat({
  model: 'claude-3-sonnet-20240229',
  messages
});

console.log('Claude:', response.content);
```

#### Pricing (as of 2025)

Per 1M tokens:

| Model | Input | Output |
|-------|-------|--------|
| Claude 3 Opus | $15.00 | $75.00 |
| Claude 3 Sonnet | $3.00 | $15.00 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Haiku | $0.25 | $1.25 |

The provider automatically calculates costs and includes them in execution metadata.

#### Embeddings

Note: Anthropic does not currently offer embedding models. For embeddings, use OpenAI's provider or a dedicated embedding service.

```typescript
// Not supported
await anthropicProvider.embeddings({ ... }); // Throws error
```

---

## Using with Agents

### Creating an Agent with OpenAI

```typescript
import { AIAgent, AgentContext, AgentResult } from '@stratix/primitives';
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

class SummaryAgent extends AIAgent<{ text: string }, { summary: string }> {
  constructor(private provider: OpenAIProvider) {
    super();
  }

  async execute(input: { text: string }): Promise<AgentResult<{ summary: string }>> {
    const startTime = Date.now();

    try {
      const response = await this.provider.chat({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a summarization assistant. Provide concise summaries.'
          },
          {
            role: 'user',
            content: `Summarize this text:\n\n${input.text}`
          }
        ],
        temperature: 0.3,
        maxTokens: 200
      });

      return AgentResult.success(
        { summary: response.content },
        {
          model: 'gpt-4',
          duration: Date.now() - startTime,
          cost: this.calculateCost(response.usage, 'gpt-4'),
          tokenUsage: response.usage
        }
      );
    } catch (error) {
      return AgentResult.failure(
        error instanceof Error ? error : new Error('Unknown error'),
        {
          model: 'gpt-4',
          duration: Date.now() - startTime
        }
      );
    }
  }

  private calculateCost(usage: TokenUsage, model: string): number {
    const pricing = { 'gpt-4': { input: 30, output: 60 } };
    const input = (usage.promptTokens / 1_000_000) * pricing[model].input;
    const output = (usage.completionTokens / 1_000_000) * pricing[model].output;
    return input + output;
  }
}

// Usage
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!
});

const agent = new SummaryAgent(provider);

const result = await agent.execute({
  text: 'Long text to summarize...'
});

if (result.isSuccess()) {
  console.log('Summary:', result.data.summary);
  console.log('Cost:', result.metadata.cost);
}
```

### Creating an Agent with Anthropic

```typescript
import { AIAgent, AgentResult } from '@stratix/primitives';
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';

class AnalysisAgent extends AIAgent<{ data: string }, { insights: string[] }> {
  constructor(private provider: AnthropicProvider) {
    super();
  }

  async execute(input: { data: string }): Promise<AgentResult<{ insights: string[] }>> {
    const startTime = Date.now();

    try {
      const response = await this.provider.chat({
        model: 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'system',
            content: 'You are a data analyst. Provide key insights in bullet points.'
          },
          {
            role: 'user',
            content: `Analyze this data:\n\n${input.data}`
          }
        ],
        temperature: 0.5,
        maxTokens: 500
      });

      const insights = response.content
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());

      return AgentResult.success(
        { insights },
        {
          model: 'claude-3-sonnet-20240229',
          duration: Date.now() - startTime,
          cost: this.calculateCost(response.usage),
          tokenUsage: response.usage
        }
      );
    } catch (error) {
      return AgentResult.failure(
        error instanceof Error ? error : new Error('Unknown error'),
        {
          model: 'claude-3-sonnet-20240229',
          duration: Date.now() - startTime
        }
      );
    }
  }

  private calculateCost(usage: TokenUsage): number {
    const input = (usage.promptTokens / 1_000_000) * 3.00;
    const output = (usage.completionTokens / 1_000_000) * 15.00;
    return input + output;
  }
}
```

### Switching Between Providers

```typescript
// Create agents that accept any LLMProvider
class FlexibleAgent extends AIAgent<Input, Output> {
  constructor(private provider: LLMProvider) {
    super();
  }

  async execute(input: Input): Promise<AgentResult<Output>> {
    const response = await this.provider.chat({
      model: this.getModelForProvider(),
      messages: [...]
    });

    // Process response...
  }

  private getModelForProvider(): string {
    switch (this.provider.name) {
      case 'openai':
        return 'gpt-4';
      case 'anthropic':
        return 'claude-3-sonnet-20240229';
      default:
        throw new Error(`Unsupported provider: ${this.provider.name}`);
    }
  }
}

// Use with OpenAI
const openaiAgent = new FlexibleAgent(
  new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! })
);

// Or use with Anthropic
const anthropicAgent = new FlexibleAgent(
  new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY! })
);
```

---

## Best Practices

### 1. Environment Variables

```typescript
// Good: Use environment variables
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!
});

// Avoid: Hardcoding API keys
const provider = new OpenAIProvider({
  apiKey: 'sk-...'
});
```

### 2. Error Handling

```typescript
try {
  const response = await provider.chat(params);
  // Process response
} catch (error) {
  if (error.message.includes('rate_limit')) {
    // Handle rate limiting
    await wait(1000);
    return retry();
  } else if (error.message.includes('insufficient_quota')) {
    // Handle quota issues
    console.error('API quota exceeded');
  } else {
    // Handle other errors
    throw error;
  }
}
```

### 3. Cost Optimization

```typescript
// Use cheaper models for simple tasks
const simple = await openaiProvider.chat({
  model: 'gpt-3.5-turbo',  // Cheaper
  messages: [...]
});

// Use powerful models only when needed
const complex = await openaiProvider.chat({
  model: 'gpt-4',  // More expensive but more capable
  messages: [...]
});

// Set reasonable token limits
const response = await provider.chat({
  model: 'gpt-4',
  maxTokens: 500,  // Limit output tokens
  messages: [...]
});
```

### 4. Temperature Settings

```typescript
// Creative tasks: Higher temperature
const creative = await provider.chat({
  model: 'gpt-4',
  temperature: 0.9,
  messages: [{ role: 'user', content: 'Write a poem' }]
});

// Analytical tasks: Lower temperature
const analytical = await provider.chat({
  model: 'gpt-4',
  temperature: 0.1,
  messages: [{ role: 'user', content: 'Calculate the sum' }]
});
```

### 5. Model Selection

**OpenAI:**
- `gpt-4`: Best quality, use for critical tasks
- `gpt-4-turbo`: Good balance of speed and quality
- `gpt-3.5-turbo`: Fast and cheap, use for simple tasks

**Anthropic:**
- `claude-3-opus`: Best for complex reasoning
- `claude-3-sonnet` / `claude-3-5-sonnet`: Balanced, good default
- `claude-3-haiku`: Fastest, use for simple queries

---

## Next Steps

- [Primitives API Reference](./primitives.md)
- [Abstractions API Reference](./abstractions.md)
- [Runtime API Reference](./runtime.md)
- [Testing API Reference](./testing.md)
