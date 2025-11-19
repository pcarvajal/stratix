import type { AgentMemory } from '@stratix/core';

/**
 * Simple in-memory implementation of AgentMemory.
 * Suitable for development and testing. For production, use a persistent implementation.
 */
export class InMemoryAgentMemory implements AgentMemory {
  private shortTermMemory = new Map<string, unknown>();
  private longTermMemory = new Map<string, unknown>();

  store(key: string, value: unknown, type: 'short' | 'long'): Promise<void> {
    if (type === 'short') {
      this.shortTermMemory.set(key, value);
    } else {
      this.longTermMemory.set(key, value);
    }
    return Promise.resolve();
  }

  retrieve(key: string): Promise<unknown> {
    const shortTerm = this.shortTermMemory.get(key);
    if (shortTerm !== undefined) {
      return Promise.resolve(shortTerm);
    }

    const longTerm = this.longTermMemory.get(key);
    return Promise.resolve(longTerm ?? null);
  }

  search(query: string, limit: number): Promise<unknown[]> {
    // Simple keyword search (for production, use vector embeddings)
    const results: unknown[] = [];
    const allValues = [
      ...Array.from(this.shortTermMemory.values()),
      ...Array.from(this.longTermMemory.values()),
    ];

    for (const value of allValues) {
      if (results.length >= limit) break;

      const valueStr = JSON.stringify(value).toLowerCase();
      const queryLower = query.toLowerCase();

      if (valueStr.includes(queryLower)) {
        results.push(value);
      }
    }

    return Promise.resolve(results);
  }

  clear(type: 'short' | 'long' | 'all'): Promise<void> {
    if (type === 'short' || type === 'all') {
      this.shortTermMemory.clear();
    }
    if (type === 'long' || type === 'all') {
      this.longTermMemory.clear();
    }
    return Promise.resolve();
  }
}
