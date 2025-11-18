import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAgentMemory } from '../InMemoryAgentMemory.js';

describe('InMemoryAgentMemory', () => {
  let memory: InMemoryAgentMemory;

  beforeEach(() => {
    memory = new InMemoryAgentMemory();
  });

  describe('store and retrieve', () => {
    it('should store and retrieve short-term memory', async () => {
      await memory.store('user_name', 'Alice', 'short');

      const value = await memory.retrieve('user_name');
      expect(value).toBe('Alice');
    });

    it('should store and retrieve long-term memory', async () => {
      await memory.store('preference', 'dark_mode', 'long');

      const value = await memory.retrieve('preference');
      expect(value).toBe('dark_mode');
    });

    it('should store different value types', async () => {
      await memory.store('string', 'hello', 'short');
      await memory.store('number', 42, 'short');
      await memory.store('boolean', true, 'short');
      await memory.store('object', { name: 'Alice' }, 'short');
      await memory.store('array', [1, 2, 3], 'short');

      expect(await memory.retrieve('string')).toBe('hello');
      expect(await memory.retrieve('number')).toBe(42);
      expect(await memory.retrieve('boolean')).toBe(true);
      expect(await memory.retrieve('object')).toEqual({ name: 'Alice' });
      expect(await memory.retrieve('array')).toEqual([1, 2, 3]);
    });

    it('should overwrite existing value', async () => {
      await memory.store('counter', 1, 'short');
      expect(await memory.retrieve('counter')).toBe(1);

      await memory.store('counter', 2, 'short');
      expect(await memory.retrieve('counter')).toBe(2);
    });

    it('should return null for non-existent key', async () => {
      const value = await memory.retrieve('non_existent');
      expect(value).toBeNull();
    });

    it('should prioritize short-term over long-term when both exist', async () => {
      await memory.store('key', 'long_value', 'long');
      await memory.store('key', 'short_value', 'short');

      // Short-term should be returned first
      expect(await memory.retrieve('key')).toBe('short_value');
    });

    it('should retrieve long-term when no short-term exists', async () => {
      await memory.store('key', 'long_value', 'long');

      expect(await memory.retrieve('key')).toBe('long_value');
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await memory.store('user_name', 'Alice Johnson', 'long');
      await memory.store('user_email', 'alice@example.com', 'long');
      await memory.store('user_age', 30, 'long');
      await memory.store('product_name', 'Laptop', 'long');
      await memory.store('product_price', 999, 'long');
    });

    it('should search and return matching entries by key', async () => {
      // Search should match values containing the query
      const results = await memory.search('Alice', 5);

      expect(results.length).toBeGreaterThan(0);
      expect(results).toContain('Alice Johnson');
    });

    it('should limit results by maxResults parameter', async () => {
      await memory.store('item1', 'test value', 'long');
      await memory.store('item2', 'test value', 'long');
      await memory.store('item3', 'test value', 'long');

      const results = await memory.search('test', 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array when no matches', async () => {
      const results = await memory.search('nonexistent', 5);

      expect(results).toEqual([]);
    });

    it('should search case-insensitively', async () => {
      const results1 = await memory.search('alice', 5);
      const results2 = await memory.search('ALICE', 5);

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
    });

    it('should search in both short-term and long-term memory', async () => {
      await memory.store('session_data', 'session token data', 'short');
      await memory.store('refresh_data', 'refresh token data', 'long');

      const results = await memory.search('token', 10);

      // Should find matches containing "token" in the values
      expect(results.length).toBeGreaterThanOrEqual(1);
      // Verify we got the right data
      expect(results.some((r) => JSON.stringify(r).includes('token'))).toBe(true);
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      await memory.store('short_key', 'short_value', 'short');
      await memory.store('long_key', 'long_value', 'long');
    });

    it('should clear short-term memory', async () => {
      await memory.clear('short');

      expect(await memory.retrieve('short_key')).toBeNull();
      expect(await memory.retrieve('long_key')).toBe('long_value');
    });

    it('should clear long-term memory', async () => {
      await memory.clear('long');

      expect(await memory.retrieve('short_key')).toBe('short_value');
      expect(await memory.retrieve('long_key')).toBeNull();
    });

    it('should clear all memory', async () => {
      await memory.clear('all');

      expect(await memory.retrieve('short_key')).toBeNull();
      expect(await memory.retrieve('long_key')).toBeNull();
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle conversation context', async () => {
      const conversationId = 'conv-123';

      // Store conversation turns
      await memory.store(
        `${conversationId}:turn:1`,
        {
          user: 'Hello',
          assistant: 'Hi there!',
        },
        'short'
      );

      await memory.store(
        `${conversationId}:turn:2`,
        {
          user: 'How are you?',
          assistant: 'I am doing well, thank you!',
        },
        'short'
      );

      // Retrieve turns
      const turn1 = await memory.retrieve(`${conversationId}:turn:1`);
      const turn2 = await memory.retrieve(`${conversationId}:turn:2`);

      expect(turn1).toEqual({ user: 'Hello', assistant: 'Hi there!' });
      expect(turn2).toEqual({ user: 'How are you?', assistant: 'I am doing well, thank you!' });
    });

    it('should handle user preferences', async () => {
      const userId = 'user-456';

      // Store long-term preferences
      await memory.store(`${userId}:preference:theme`, 'dark', 'long');
      await memory.store(`${userId}:preference:language`, 'en', 'long');
      await memory.store(`${userId}:preference:notifications`, true, 'long');

      // Retrieve preferences
      const theme = await memory.retrieve(`${userId}:preference:theme`);
      const language = await memory.retrieve(`${userId}:preference:language`);
      const notifications = await memory.retrieve(`${userId}:preference:notifications`);

      expect(theme).toBe('dark');
      expect(language).toBe('en');
      expect(notifications).toBe(true);
    });

    it('should handle session state', async () => {
      const sessionId = 'session-789';

      // Store session state
      await memory.store(`${sessionId}:state`, 'authenticated', 'short');
      await memory.store(`${sessionId}:started_at`, new Date().toISOString(), 'short');
      await memory.store(`${sessionId}:user_id`, 'user-123', 'short');

      // Verify session data exists
      expect(await memory.retrieve(`${sessionId}:state`)).toBe('authenticated');

      // End session - clear all session data
      await memory.clear('short');

      expect(await memory.retrieve(`${sessionId}:state`)).toBeNull();
    });

    it('should handle cached data with fallback pattern', async () => {
      const cacheKey = 'api:users:123';

      // Check cache first
      let userData = await memory.retrieve(cacheKey);

      if (!userData) {
        // Cache miss - fetch and store
        userData = { id: '123', name: 'Alice', email: 'alice@example.com' };
        await memory.store(cacheKey, userData, 'short');
      }

      expect(userData).toEqual({ id: '123', name: 'Alice', email: 'alice@example.com' });

      // Second access should hit cache
      const cachedData = await memory.retrieve(cacheKey);
      expect(cachedData).toEqual(userData);
    });

    it('should handle complex nested data structures', async () => {
      const complexData = {
        user: {
          id: 'user-123',
          profile: {
            name: 'Alice',
            age: 30,
            addresses: [
              { type: 'home', street: '123 Main St' },
              { type: 'work', street: '456 Office Blvd' },
            ],
          },
          settings: {
            notifications: { email: true, sms: false },
            privacy: { publicProfile: true },
          },
        },
        metadata: {
          createdAt: new Date().toISOString(),
          version: 1,
        },
      };

      await memory.store('user_data', complexData, 'long');

      const retrieved = await memory.retrieve('user_data');
      expect(retrieved).toEqual(complexData);
    });
  });
});
