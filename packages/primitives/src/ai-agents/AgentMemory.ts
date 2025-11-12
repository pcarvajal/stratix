/**
 * Interface for agent memory management.
 *
 * Agents can store information in short-term memory (current session),
 * long-term memory (persistent), and semantic memory (vector embeddings for search).
 *
 * @example
 * ```typescript
 * class InMemoryAgentMemory implements AgentMemory {
 *   private shortTerm = new Map<string, unknown>();
 *   private longTerm = new Map<string, unknown>();
 *
 *   async store(key: string, value: unknown, type: 'short' | 'long'): Promise<void> {
 *     if (type === 'short') {
 *       this.shortTerm.set(key, value);
 *     } else {
 *       this.longTerm.set(key, value);
 *     }
 *   }
 *
 *   async retrieve(key: string): Promise<unknown> {
 *     return this.shortTerm.get(key) ?? this.longTerm.get(key);
 *   }
 * }
 * ```
 */
export interface AgentMemory {
  /**
   * Stores a value in agent memory
   *
   * @param key - The key to store the value under
   * @param value - The value to store
   * @param type - Type of memory: 'short' (session) or 'long' (persistent)
   */
  store(key: string, value: unknown, type: 'short' | 'long'): Promise<void>;

  /**
   * Retrieves a value from agent memory
   *
   * @param key - The key to retrieve
   * @returns The stored value, or null if not found
   */
  retrieve(key: string): Promise<unknown>;

  /**
   * Searches memory semantically (requires vector store implementation)
   *
   * @param query - The search query
   * @param limit - Maximum number of results
   * @returns Array of relevant stored values
   */
  search(query: string, limit: number): Promise<unknown[]>;

  /**
   * Clears memory of specified type
   *
   * @param type - Type of memory to clear: 'short', 'long', or 'all'
   */
  clear(type: 'short' | 'long' | 'all'): Promise<void>;
}

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
