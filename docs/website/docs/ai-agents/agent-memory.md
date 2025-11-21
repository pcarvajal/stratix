---
sidebar_position: 5
title: Agent Memory
description: Conversation history and context management
---

# Agent Memory

Manage conversation history and context for AI agents.

## Memory Store Interface

```typescript
interface AgentMemory {
  addMessage(agentId: string, message: AgentMessage): Promise<void>;
  getMessages(agentId: string, limit?: number): Promise<AgentMessage[]>;
  clearMessages(agentId: string): Promise<void>;
}
```

## In-Memory Storage

```typescript
import { InMemoryAgentMemory } from '@stratix/runtime';

const memory = new InMemoryAgentMemory();

// Add message
await memory.addMessage('agent-123', {
  role: 'user',
  content: 'Hello!',
  timestamp: new Date()
});

// Get messages
const messages = await memory.getMessages('agent-123');

// Clear
await memory.clearMessages('agent-123');
```

## Agent with Memory

```typescript
export class ConversationalAgent extends AIAgent<string, string> {
  constructor(
    private llmProvider: LLMProvider,
    private memory: AgentMemory
  ) {
    super(EntityId.create<'AIAgent'>(), new Date(), new Date());
  }

  protected async execute(input: string): Promise<AgentResult<string>> {
    // Load conversation history
    const history = await this.memory.getMessages(this.id.toString());

    // Call LLM with history
    const response = await this.llmProvider.chat({
      model: 'gpt-4o',
      messages: [
        ...history,
        { role: 'user', content: input, timestamp: new Date() }
      ]
    });

    // Save to memory
    await this.memory.addMessage(this.id.toString(), {
      role: 'user',
      content: input,
      timestamp: new Date()
    });

    await this.memory.addMessage(this.id.toString(), {
      role: 'assistant',
      content: response.content,
      timestamp: new Date()
    });

    return AgentResult.success(response.content, response.usage);
  }
}
```

## Persistent Memory

```typescript
export class PostgresAgentMemory implements AgentMemory {
  constructor(private db: Database) {}

  async addMessage(agentId: string, message: AgentMessage): Promise<void> {
    await this.db('agent_messages').insert({
      agent_id: agentId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp
    });
  }

  async getMessages(agentId: string, limit = 100): Promise<AgentMessage[]> {
    const rows = await this.db('agent_messages')
      .where({ agent_id: agentId })
      .orderBy('timestamp', 'desc')
      .limit(limit);

    return rows.reverse();
  }

  async clearMessages(agentId: string): Promise<void> {
    await this.db('agent_messages')
      .where({ agent_id: agentId })
      .delete();
  }
}
```

## Best Practices

### 1. Limit Context Window

```typescript
const messages = await memory.getMessages(agentId, 20); // Last 20 messages
```

### 2. Clear Old Conversations

```typescript
// Clear after session ends
await memory.clearMessages(agentId);
```

### 3. Handle Token Limits

```typescript
let messages = await memory.getMessages(agentId);

// Truncate if too many tokens
while (this.countTokens(messages) > 4000) {
  messages = messages.slice(1); // Remove oldest
}
```

## Next Steps

- **[Agent Orchestration](./agent-orchestration)** - Multi-agent workflows
- **[Agent Testing](./agent-testing)** - Testing strategies
