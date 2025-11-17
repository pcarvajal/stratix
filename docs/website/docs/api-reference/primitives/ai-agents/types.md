---
id: types
title: Types
sidebar_label: Types
---

# AI Agent Types

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Core type definitions for the AI Agent framework including identifiers, versions, capabilities, model configurations, and message structures.

## Import

```typescript
import type {
  AgentId,
  AgentVersion,
  AgentCapability,
  ModelConfig,
  AgentMessage
} from '@stratix/primitives';

import { AgentVersionFactory, AgentCapabilities } from '@stratix/primitives';
```

## Type Definitions

### AgentId

```typescript
type AgentId = EntityId<'AIAgent'>;
```

Type-safe identifier for AI agents using phantom types.

### AgentVersion

```typescript
interface AgentVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly value: string; // "1.2.3"
}

// Factory
AgentVersionFactory.create('1.0.0'); // { major: 1, minor: 0, patch: 0, value: '1.0.0' }
```

Semantic versioning for agents.

### AgentCapability

```typescript
type AgentCapability = string;

// Built-in capabilities
const AgentCapabilities = {
  CUSTOMER_SUPPORT: 'customer_support',
  DATA_ANALYSIS: 'data_analysis',
  KNOWLEDGE_RETRIEVAL: 'knowledge_retrieval',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
  SQL_GENERATION: 'sql_generation',
  VISUALIZATION: 'visualization',
  CONTENT_CREATION: 'content_creation',
  CODE_GENERATION: 'code_generation',
  DECISION_SUPPORT: 'decision_support'
} as const;
```

Agent capabilities can be any string. Built-in constants provided for common use cases.

### ModelConfig

```typescript
interface ModelConfig {
  readonly provider: string;      // 'openai', 'anthropic', etc.
  readonly model: string;          // 'gpt-4', 'claude-3-sonnet', etc.
  readonly temperature: number;    // 0.0 - 1.0
  readonly maxTokens: number;      // Max output tokens
}
```

LLM model configuration.

### AgentMessage

```typescript
interface AgentMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: Date;
}
```

Message in agent conversation.

## Usage Examples

```typescript
// Agent with typed configuration
class MyAgent extends AIAgent<Input, Output> {
  readonly version = AgentVersionFactory.create('2.1.0');
  readonly capabilities: AgentCapability[] = [
    AgentCapabilities.CUSTOMER_SUPPORT,
    'custom_capability'
  ];
  readonly model: ModelConfig = {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4000
  };
}
```

## Related Components

- [AIAgent](./ai-agent.md) - Uses these types
- [AgentContext](./agent-context.md) - Uses AgentMessage

## See Also

- [Package README](../../../../packages/primitives/README.md)
