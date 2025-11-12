# @stratix/ext-ai-agents-openai

OpenAI LLM provider for Stratix AI agents.

## Installation

```bash
pnpm add @stratix/ext-ai-agents-openai
```

## Supported Models

- GPT-4o, GPT-4o-mini
- GPT-4, GPT-4 Turbo
- GPT-3.5 Turbo

## Quick Example

```typescript
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

const response = await provider.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
});
```

## License

MIT
