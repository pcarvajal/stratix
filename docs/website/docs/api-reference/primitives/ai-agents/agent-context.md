---
id: agent-context
title: AgentContext
sidebar_label: AgentContext
---

# AgentContext

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Manages conversation state and message history for AI agents. AgentContext maintains a session with ordered messages (system, user, assistant) enabling multi-turn conversations and context-aware agent behavior.

**Key Features:**
- Session-based conversation management
- Message history with roles (system, user, assistant)
- Timestamp tracking for all messages
- Immutable message list
- Serialization support

## Import

```typescript
import { AgentContext } from '@stratix/primitives';
import type { AgentMessage } from '@stratix/primitives';
```

## Type Signature

```typescript
class AgentContext {
  constructor(sessionId: string, systemPrompt?: string);
  
  readonly sessionId: string;
  
  addMessage(message: AgentMessage): void;
  getMessages(): readonly AgentMessage[];
  getSystemPrompt(): string | undefined;
  clear(): void;
}

interface AgentMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: Date;
}
```

## Usage Examples

```typescript
// Create context
const context = new AgentContext('session-123', 'You are a helpful assistant');

// Add user message
context.addMessage({
  role: 'user',
  content: 'What is the weather?',
  timestamp: new Date()
});

// Add assistant response
context.addMessage({
  role: 'assistant',
  content: 'The weather is sunny',
  timestamp: new Date()
});

// Get all messages
const messages = context.getMessages();
console.log(messages.length); // 3 (system + user + assistant)

// Use with agent
agent.setContext(context);
const result = await agent.executeWithEvents(input);
```

## Related Components

- [AIAgent](./ai-agent.md) - Uses context for conversations
- [AgentMessage](./types.md) - Message structure

## See Also

- [Package README](../../../../packages/primitives/README.md)
