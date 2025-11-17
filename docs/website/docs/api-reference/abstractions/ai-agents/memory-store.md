---
id: memory-store
title: MemoryStore
sidebar_label: MemoryStore
---

# MemoryStore

> **Package:** `@stratix/abstractions`
> **Layer:** Layer 2 - Abstractions
> **Since:** v0.1.0

## Overview

Memory store interface for AI agents. Provides short-term (session) and long-term (persistent) memory storage with semantic search capabilities.

## Type Signature

```typescript
interface MemoryStore {
  store(key: string, value: unknown, type: 'short' | 'long'): Promise<void>;
  retrieve(key: string): Promise<unknown | null>;
  search(query: string, limit: number): Promise<unknown[]>;
  clear(type: 'short' | 'long' | 'all'): Promise<void>;
}
```

## Usage

```typescript
const memory: MemoryStore = new RedisMemoryStore();

// Store
await memory.store('user_pref', { theme: 'dark' }, 'long');

// Retrieve
const pref = await memory.retrieve('user_pref');

// Semantic search
const similar = await memory.search('user preferences', 5);
```

## See Also

- [AIAgent](../../layer-1-primitives/ai-agents/ai-agent.md)
