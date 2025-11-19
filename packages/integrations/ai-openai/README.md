# @stratix/ai-openai

OpenAI LLM provider for Stratix AI agents.

## Installation

```bash
pnpm add @stratix/ai-openai
```

## Features

- Support for GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, and GPT-4o models
- Function/tool calling support
- Streaming responses
- Embeddings generation
- Automatic cost calculation based on token usage
- Structured output with JSON schemas
- Response format control (JSON object, JSON schema)

## Supported Models

**Chat Models:**
- `gpt-4o` - Latest GPT-4 optimized model
- `gpt-4o-mini` - Smaller, faster GPT-4o
- `gpt-4` - Base GPT-4 model
- `gpt-4-turbo` - GPT-4 Turbo with improved performance
- `gpt-4-turbo-preview` - Preview version of GPT-4 Turbo
- `gpt-3.5-turbo` - Fast and cost-effective model
- `gpt-3.5-turbo-16k` - Extended context version

**Embedding Models:**
- `text-embedding-3-small` - Small, efficient embeddings
- `text-embedding-3-large` - High-quality embeddings
- `text-embedding-ada-002` - Legacy embedding model

## Quick Example

```typescript
import { OpenAIProvider } from '@stratix/ai-openai';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: 'org-123',  // Optional
});

// Chat completion
const response = await provider.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.', timestamp: new Date() },
    { role: 'user', content: 'Hello!', timestamp: new Date() }
  ],
  temperature: 0.7,
  maxTokens: 1000
});

console.log(response.content);
console.log('Cost:', provider.calculateCost('gpt-4o', response.usage));

// Streaming chat
for await (const chunk of provider.streamChat({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Tell me a story', timestamp: new Date() }
  ]
})) {
  process.stdout.write(chunk.content);
}

// Embeddings
const embeddingsResponse = await provider.embeddings({
  model: 'text-embedding-3-small',
  input: ['Hello world', 'OpenAI embeddings']
});

console.log(embeddingsResponse.embeddings.length); // 2
```

## Tool/Function Calling

```typescript
const response = await provider.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'What is the weather in NYC?', timestamp: new Date() }
  ],
  tools: [
    {
      name: 'get_weather',
      description: 'Get the current weather in a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'The city name' }
        },
        required: ['location']
      }
    }
  ]
});

if (response.toolCalls) {
  console.log('Tool call:', response.toolCalls[0].name);
  console.log('Arguments:', response.toolCalls[0].arguments);
}
```

## Structured Output

```typescript
const response = await provider.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Extract user info: John Doe, 30 years old', timestamp: new Date() }
  ],
  responseFormat: {
    type: 'json_schema',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      },
      required: ['name', 'age']
    }
  }
});

const userInfo = JSON.parse(response.content);
console.log(userInfo); // { name: 'John Doe', age: 30 }
```

## Configuration

```typescript
interface OpenAIProviderConfig {
  apiKey: string;           // Required: OpenAI API key
  organization?: string;    // Optional: OpenAI organization ID
  baseURL?: string;         // Optional: Custom API base URL
}
```

## Cost Calculation

The provider automatically tracks token usage and can calculate costs:

```typescript
const response = await provider.chat({...});

const cost = provider.calculateCost('gpt-4o', response.usage);
console.log(`Cost: $${cost.toFixed(4)}`);
```

Pricing is based on January 2025 rates and included in the provider.

## Exports

- `OpenAIProvider` - Main provider class implementing `LLMProvider` interface

## License

MIT
