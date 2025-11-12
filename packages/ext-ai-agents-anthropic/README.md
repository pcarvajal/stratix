# @stratix/ext-ai-agents-anthropic

Anthropic Claude LLM provider for Stratix AI agents.

## Installation

```bash
pnpm add @stratix/ext-ai-agents-anthropic
```

## Supported Models

- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Haiku

## Quick Example

```typescript
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022'
});

const response = await provider.chat({
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});
```

## License

MIT
