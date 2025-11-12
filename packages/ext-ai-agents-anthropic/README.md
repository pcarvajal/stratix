# @stratix/ext-ai-agents-anthropic

Anthropic Claude LLM provider for Stratix AI agents.

## Installation

```bash
pnpm add @stratix/ext-ai-agents-anthropic
```

## Features

- Support for Claude 3 Opus, Sonnet, Haiku, and Claude 3.5 Sonnet
- Tool use (function calling) support
- Streaming responses
- Automatic cost calculation based on token usage
- System message support
- Proper message role handling (system messages separated from conversation)

## Supported Models

- `claude-3-5-sonnet-20241022` - Latest Claude 3.5 Sonnet (most capable)
- `claude-3-opus-20240229` - Claude 3 Opus (highest intelligence)
- `claude-3-sonnet-20240229` - Claude 3 Sonnet (balanced performance)
- `claude-3-haiku-20240307` - Claude 3 Haiku (fastest and most cost-effective)

## Quick Example

```typescript
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: 'https://api.anthropic.com',  // Optional
});

// Chat completion
const response = await provider.chat({
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.', timestamp: new Date() },
    { role: 'user', content: 'Hello!', timestamp: new Date() }
  ],
  temperature: 0.7,
  maxTokens: 1024
});

console.log(response.content);
console.log('Cost:', provider.calculateCost('claude-3-5-sonnet-20241022', response.usage));

// Streaming chat
for await (const chunk of provider.streamChat({
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'user', content: 'Tell me a story', timestamp: new Date() }
  ]
})) {
  process.stdout.write(chunk.content);
  if (chunk.isComplete) {
    console.log('\nStream completed');
  }
}
```

## Tool Use (Function Calling)

```typescript
const response = await provider.chat({
  model: 'claude-3-5-sonnet-20241022',
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

## System Messages

The provider automatically handles system messages correctly:

```typescript
const response = await provider.chat({
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'system', content: 'You are an expert in TypeScript.', timestamp: new Date() },
    { role: 'system', content: 'Always provide code examples.', timestamp: new Date() },
    { role: 'user', content: 'How do I create a class?', timestamp: new Date() }
  ]
});

// System messages are automatically combined and sent as the system parameter
```

## Configuration

```typescript
interface AnthropicProviderConfig {
  apiKey: string;        // Required: Anthropic API key
  baseURL?: string;      // Optional: Custom API base URL
}
```

## Cost Calculation

The provider automatically tracks token usage and can calculate costs:

```typescript
const response = await provider.chat({...});

const cost = provider.calculateCost('claude-3-5-sonnet-20241022', response.usage);
console.log(`Cost: $${cost.toFixed(4)}`);
```

Pricing is based on 2025 rates and included in the provider.

## Embeddings

Note: Anthropic does not provide embedding models. The `embeddings()` method will throw an error. Use OpenAI or another provider for embeddings:

```typescript
try {
  await provider.embeddings({...});
} catch (error) {
  console.error('Anthropic does not support embeddings');
}
```

## Exports

- `AnthropicProvider` - Main provider class implementing `LLMProvider` interface

## License

MIT
