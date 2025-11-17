---
id: llm-provider
title: LLMProvider
sidebar_label: LLMProvider
---

# LLMProvider

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

LLM provider interface for AI agents. Abstracts different LLM providers (OpenAI, Anthropic, etc.) enabling swappable implementations.

## Import

```typescript
import type { LLMProvider, LLMRequest, LLMResponse } from '@stratix/abstractions';
```

## Type Signature

```typescript
interface LLMProvider {
  readonly name: string;
  generate(request: LLMRequest): Promise<LLMResponse>;
  stream?(request: LLMRequest): AsyncIterable<LLMResponse>;
}

interface LLMRequest {
  model: string;
  messages: AgentMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

interface LLMResponse {
  content: string;
  usage: { tokens: number; cost: number };
  toolCalls?: ToolCall[];
}
```

## Usage

```typescript
// OpenAI implementation
const openai: LLMProvider = new OpenAIProvider({ apiKey: 'key' });

// Anthropic implementation
const anthropic: LLMProvider = new AnthropicProvider({ apiKey: 'key' });

// Use with agent (swappable)
const agent = new MyAgent(openai);
// or: const agent = new MyAgent(anthropic);
```

## See Also

- [OpenAIProvider](../../layer-5-extensions/ai-providers/openai.md)
- [AnthropicProvider](../../layer-5-extensions/ai-providers/anthropic.md)
