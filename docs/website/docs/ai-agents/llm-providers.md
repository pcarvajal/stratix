---
sidebar_position: 3
title: LLM Providers
description: OpenAI, Anthropic, and custom LLM provider integrations
---

# LLM Providers

Stratix supports multiple LLM providers through a unified `LLMProvider` interface.

## Supported Providers

- **OpenAI** - GPT-4, GPT-4 Turbo, GPT-3.5
- **Anthropic** - Claude 3 (Opus, Sonnet, Haiku)
- **Custom** - Build your own provider

## OpenAI Provider

### Installation

```bash
npm install @stratix/ai-openai
```

### Setup

```typescript
import { OpenAIProvider } from '@stratix/ai-openai';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: 'org-123', // Optional
  baseURL: 'https://api.openai.com/v1' // Optional
});
```

### Supported Models

```typescript
// GPT-4 models
'gpt-4o'              // Latest, fastest GPT-4
'gpt-4o-mini'         // Smaller, faster
'gpt-4-turbo'         // High performance
'gpt-4'               // Base model

// GPT-3.5 models
'gpt-3.5-turbo'       // Fast and cost-effective
'gpt-3.5-turbo-16k'   // Extended context

// Embedding models
'text-embedding-3-small'
'text-embedding-3-large'
```

### Usage

```typescript
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
console.log('Tokens:', response.usage.totalTokens);
console.log('Cost:', provider.calculateCost('gpt-4o', response.usage));
```

### Function Calling

```typescript
const response = await provider.chat({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'What is the weather in NYC?', timestamp: new Date() }
  ],
  tools: [
    {
      name: 'get_weather',
      description: 'Get current weather',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    }
  ]
});

if (response.toolCalls) {
  console.log('Tool:', response.toolCalls[0].name);
  console.log('Args:', response.toolCalls[0].arguments);
}
```

## Anthropic Provider

### Installation

```bash
npm install @stratix/ai-anthropic
```

### Setup

```typescript
import { AnthropicProvider } from '@stratix/ai-anthropic';

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!
});
```

### Supported Models

```typescript
'claude-3-opus-20240229'    // Most capable
'claude-3-sonnet-20240229'  // Balanced
'claude-3-haiku-20240307'   // Fastest
```

### Usage

```typescript
const response = await provider.chat({
  model: 'claude-3-sonnet-20240229',
  messages: [
    { role: 'user', content: 'Explain quantum computing', timestamp: new Date() }
  ],
  maxTokens: 1000
});
```

## Custom Provider

### Implementation

```typescript
import { LLMProvider, ChatRequest, ChatResponse, ChatChunk, TokenUsage } from '@stratix/core';

export class CustomLLMProvider implements LLMProvider {
  constructor(private config: CustomConfig) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Call your LLM API
    const response = await fetch('https://your-llm-api.com/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens
      })
    });

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: request.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      finishReason: data.choices[0].finish_reason
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<ChatChunk> {
    // Implement streaming
    const response = await fetch('https://your-llm-api.com/chat/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...request, stream: true})
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      yield { content: chunk, delta: chunk };
    }
  }

  calculateCost(model: string, usage: TokenUsage): number {
    // Your pricing logic
    const inputCost = 0.01 / 1000;  // per 1K tokens
    const outputCost = 0.03 / 1000; // per 1K tokens

    return (
      (usage.promptTokens * inputCost) +
      (usage.completionTokens * outputCost)
    );
  }

  async embeddings(request: EmbeddingsRequest): Promise<EmbeddingsResponse> {
    // Implement embeddings if supported
    throw new Error('Not implemented');
  }
}
```

## Provider Comparison

| Feature | OpenAI | Anthropic | Custom |
|---------|--------|-----------|--------|
| **Chat** | ✅ | ✅ | ✅ |
| **Streaming** | ✅ | ✅ | ✅ |
| **Function Calling** | ✅ | ✅ | Optional |
| **Embeddings** | ✅ | ❌ | Optional |
| **Vision** | ✅ | ✅ | Optional |
| **Cost Tracking** | ✅ | ✅ | ✅ |

## Best Practices

### 1. Use Environment Variables

```typescript
const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!
});
```

### 2. Handle Rate Limits

```typescript
try {
  const response = await provider.chat(request);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Retry with exponential backoff
    await sleep(1000);
    return await provider.chat(request);
  }
  throw error;
}
```

### 3. Track Costs

```typescript
const cost = provider.calculateCost(model, response.usage);
console.log(`Cost: $${cost.toFixed(4)}`);
```

### 4. Use Appropriate Models

```typescript
// For simple tasks
model: 'gpt-3.5-turbo'

// For complex reasoning
model: 'gpt-4o'

// For speed
model: 'claude-3-haiku-20240307'
```

## Next Steps

- **[Agent Tools](./agent-tools)** - Function calling
- **[Agent Memory](./agent-memory)** - Conversation history
- **[Creating Agents](./creating-agents)** - Build agents
