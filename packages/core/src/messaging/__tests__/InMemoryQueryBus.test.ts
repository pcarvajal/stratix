import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Query } from '@stratix/core';
import { InMemoryQueryBus } from '../InMemoryQueryBus.js';

// Test queries
class GetUserQuery implements Query {
  constructor(public readonly userId: string) {}
}

class ListUsersQuery implements Query {
  constructor(
    public readonly page: number,
    public readonly limit: number
  ) {}
}

class SearchUsersQuery implements Query {
  constructor(public readonly searchTerm: string) {}
}

// Test result types
interface User {
  id: string;
  email: string;
  name: string;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
}

describe('InMemoryQueryBus', () => {
  let queryBus: InMemoryQueryBus;

  beforeEach(() => {
    queryBus = new InMemoryQueryBus();
  });

  describe('register', () => {
    it('should register a query handler', () => {
      const handler = vi.fn(async () => ({ id: '123', email: 'john@example.com', name: 'John' }));

      queryBus.register(GetUserQuery, handler);

      expect(queryBus.hasHandler(GetUserQuery)).toBe(true);
    });

    it('should throw error when registering duplicate handler', () => {
      const handler1 = vi.fn(async () => ({ id: '1' }));
      const handler2 = vi.fn(async () => ({ id: '2' }));

      queryBus.register(GetUserQuery, handler1);

      expect(() => queryBus.register(GetUserQuery, handler2)).toThrow(
        'Handler already registered for query: GetUserQuery'
      );
    });

    it('should register multiple different query types', () => {
      const getUserHandler = vi.fn();
      const listUsersHandler = vi.fn();
      const searchUsersHandler = vi.fn();

      queryBus.register(GetUserQuery, getUserHandler);
      queryBus.register(ListUsersQuery, listUsersHandler);
      queryBus.register(SearchUsersQuery, searchUsersHandler);

      expect(queryBus.hasHandler(GetUserQuery)).toBe(true);
      expect(queryBus.hasHandler(ListUsersQuery)).toBe(true);
      expect(queryBus.hasHandler(SearchUsersQuery)).toBe(true);
    });
  });

  describe('dispatch', () => {
    it('should dispatch query to registered handler', async () => {
      const handler = vi.fn(async (query: GetUserQuery) => ({
        id: query.userId,
        email: 'john@example.com',
        name: 'John Doe',
      }));

      queryBus.register(GetUserQuery, handler);

      const query = new GetUserQuery('user-123');
      const result = await queryBus.execute<User>(query);

      expect(handler).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        id: 'user-123',
        email: 'john@example.com',
        name: 'John Doe',
      });
    });

    it('should throw error when no handler registered', async () => {
      const query = new GetUserQuery('user-123');

      await expect(queryBus.execute(query)).rejects.toThrow(
        'No handler registered for query: GetUserQuery'
      );
    });

    it('should handle async handlers', async () => {
      const handler = vi.fn(async (query: GetUserQuery) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { id: query.userId, email: 'john@example.com', name: 'John' };
      });

      queryBus.register(GetUserQuery, handler);

      const query = new GetUserQuery('user-123');
      const result = await queryBus.execute<User>(query);

      expect(result.id).toBe('user-123');
    });

    it('should propagate handler errors', async () => {
      const handler = vi.fn(async () => {
        throw new Error('User not found');
      });

      queryBus.register(GetUserQuery, handler);

      const query = new GetUserQuery('user-123');

      await expect(queryBus.execute(query)).rejects.toThrow('User not found');
    });

    it('should handle complex result types', async () => {
      const handler = vi.fn(async (query: ListUsersQuery) => ({
        items: [
          { id: '1', email: 'user1@example.com', name: 'User 1' },
          { id: '2', email: 'user2@example.com', name: 'User 2' },
        ],
        total: 2,
        page: query.page,
      }));

      queryBus.register(ListUsersQuery, handler);

      const query = new ListUsersQuery(1, 10);
      const result = await queryBus.execute<PaginatedResult<User>>(query);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should handle array results', async () => {
      const handler = vi.fn(async () => [
        { id: '1', email: 'user1@example.com', name: 'User 1' },
        { id: '2', email: 'user2@example.com', name: 'User 2' },
      ]);

      queryBus.register(SearchUsersQuery, handler);

      const query = new SearchUsersQuery('john');
      const result = await queryBus.execute<User[]>(query);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
    });

    it('should handle null results', async () => {
      const handler = vi.fn(async () => null);

      queryBus.register(GetUserQuery, handler);

      const query = new GetUserQuery('non-existent');
      const result = await queryBus.execute<User | null>(query);

      expect(result).toBeNull();
    });
  });

  describe('hasHandler', () => {
    it('should return true when handler is registered', () => {
      queryBus.register(GetUserQuery, vi.fn());

      expect(queryBus.hasHandler(GetUserQuery)).toBe(true);
    });

    it('should return false when handler is not registered', () => {
      expect(queryBus.hasHandler(GetUserQuery)).toBe(false);
    });
  });

  describe('unregister', () => {
    it('should unregister a query handler', () => {
      queryBus.register(GetUserQuery, vi.fn());

      const result = queryBus.unregister(GetUserQuery);

      expect(result).toBe(true);
      expect(queryBus.hasHandler(GetUserQuery)).toBe(false);
    });

    it('should return false when unregistering non-existent handler', () => {
      const result = queryBus.unregister(GetUserQuery);

      expect(result).toBe(false);
    });

    it('should allow re-registration after unregister', () => {
      const handler1 = vi.fn(async () => ({ id: '1' }));
      const handler2 = vi.fn(async () => ({ id: '2' }));

      queryBus.register(GetUserQuery, handler1);
      queryBus.unregister(GetUserQuery);
      queryBus.register(GetUserQuery, handler2);

      expect(queryBus.hasHandler(GetUserQuery)).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all registered handlers', () => {
      queryBus.register(GetUserQuery, vi.fn());
      queryBus.register(ListUsersQuery, vi.fn());
      queryBus.register(SearchUsersQuery, vi.fn());

      queryBus.clear();

      expect(queryBus.hasHandler(GetUserQuery)).toBe(false);
      expect(queryBus.hasHandler(ListUsersQuery)).toBe(false);
      expect(queryBus.hasHandler(SearchUsersQuery)).toBe(false);
    });

    it('should work on empty bus', () => {
      expect(() => queryBus.clear()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical CQRS read side', async () => {
      const users = new Map([
        ['user-1', { id: 'user-1', email: 'john@example.com', name: 'John' }],
        ['user-2', { id: 'user-2', email: 'jane@example.com', name: 'Jane' }],
      ]);

      // Get user handler
      queryBus.register(GetUserQuery, async (query) => {
        return users.get(query.userId) || null;
      });

      // List users handler
      queryBus.register(ListUsersQuery, async (query) => {
        const allUsers = Array.from(users.values());
        const start = (query.page - 1) * query.limit;
        const items = allUsers.slice(start, start + query.limit);

        return {
          items,
          total: allUsers.length,
          page: query.page,
        };
      });

      // Search users handler
      queryBus.register(SearchUsersQuery, async (query) => {
        return Array.from(users.values()).filter(
          (user) =>
            user.name.toLowerCase().includes(query.searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(query.searchTerm.toLowerCase())
        );
      });

      // Get specific user
      const user = await queryBus.execute<User | null>(new GetUserQuery('user-1'));
      expect(user?.name).toBe('John');

      // List users
      const page = await queryBus.execute<PaginatedResult<User>>(new ListUsersQuery(1, 10));
      expect(page.items).toHaveLength(2);
      expect(page.total).toBe(2);

      // Search users
      const results = await queryBus.execute<User[]>(new SearchUsersQuery('jane'));
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Jane');
    });

    it('should handle query with filtering', async () => {
      const users: User[] = [
        { id: '1', email: 'john@example.com', name: 'John' },
        { id: '2', email: 'jane@example.com', name: 'Jane' },
        { id: '3', email: 'bob@example.com', name: 'Bob' },
      ];

      queryBus.register(SearchUsersQuery, async (query) => {
        const term = query.searchTerm.toLowerCase();
        return users.filter(
          (user) =>
            user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
        );
      });

      const johnResults = await queryBus.execute<User[]>(new SearchUsersQuery('john'));
      expect(johnResults).toHaveLength(1);

      const exampleResults = await queryBus.execute<User[]>(new SearchUsersQuery('example'));
      expect(exampleResults).toHaveLength(3);
    });

    it('should handle query caching pattern', async () => {
      const cache = new Map<string, User>();
      const dbCalls: string[] = [];

      queryBus.register(GetUserQuery, async (query) => {
        const cacheKey = `user:${query.userId}`;

        if (cache.has(cacheKey)) {
          return cache.get(cacheKey)!;
        }

        dbCalls.push(query.userId);
        const user = { id: query.userId, email: 'user@example.com', name: 'User' };
        cache.set(cacheKey, user);

        return user;
      });

      await queryBus.execute(new GetUserQuery('user-1'));
      await queryBus.execute(new GetUserQuery('user-1'));
      await queryBus.execute(new GetUserQuery('user-2'));

      expect(dbCalls).toEqual(['user-1', 'user-2']);
    });
  });

  describe('edge cases', () => {
    it('should handle queries with no properties', async () => {
      class CountQuery implements Query {}

      const handler = vi.fn(async () => 42);
      queryBus.register(CountQuery, handler);

      const result = await queryBus.execute<number>(new CountQuery());
      expect(result).toBe(42);
    });

    it('should handle queries with complex data structures', async () => {
      class ComplexQuery implements Query {
        constructor(
          public readonly filters: {
            status: string[];
            dateRange: { start: Date; end: Date };
          }
        ) {}
      }

      const handler = vi.fn(async (query: ComplexQuery) => {
        return {
          matchingCount: query.filters.status.length * 10,
          dateRange: query.filters.dateRange,
        };
      });

      queryBus.register(ComplexQuery, handler);

      const query = new ComplexQuery({
        status: ['active', 'pending'],
        dateRange: { start: new Date(), end: new Date() },
      });

      const result = await queryBus.execute<{ matchingCount: number; dateRange: unknown }>(query);
      expect(result.matchingCount).toBe(20);
    });

    it('should maintain handler isolation', async () => {
      let counter1 = 0;
      let counter2 = 0;

      queryBus.register(GetUserQuery, async () => {
        counter1++;
        return { id: '1', email: 'user@example.com', name: 'User' };
      });

      queryBus.register(ListUsersQuery, async () => {
        counter2++;
        return { items: [], total: 0, page: 1 };
      });

      await queryBus.execute(new GetUserQuery('user-1'));
      await queryBus.execute(new GetUserQuery('user-2'));
      await queryBus.execute(new ListUsersQuery(1, 10));

      expect(counter1).toBe(2);
      expect(counter2).toBe(1);
    });
  });
});
