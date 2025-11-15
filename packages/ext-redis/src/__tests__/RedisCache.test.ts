import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisCache } from '../RedisCache.js';

// Create mock RedisConnection with all required methods
const mockConnection = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  keys: vi.fn(),
  delPattern: vi.fn(),
  flushDb: vi.fn(),
  getClient: vi.fn(),
  connected: vi.fn(() => true),
  connect: vi.fn(),
  disconnect: vi.fn(),
  ping: vi.fn(),
};

describe('RedisCache', () => {
  let cache: RedisCache;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.get.mockResolvedValue(null);
    mockConnection.set.mockResolvedValue(undefined);
    mockConnection.del.mockResolvedValue(1);
    mockConnection.exists.mockResolvedValue(false);
    mockConnection.keys.mockResolvedValue([]);
    mockConnection.delPattern.mockResolvedValue(0);
    mockConnection.flushDb.mockResolvedValue(undefined);

    cache = new RedisCache(mockConnection as any, { prefix: 'test:', ttl: 3600 });
  });

  describe('get', () => {
    it('should get a value', async () => {
      mockConnection.get.mockResolvedValueOnce(JSON.stringify({ data: 'value' }));

      const result = await cache.get('key');

      expect(result).toEqual({ data: 'value' });
      expect(mockConnection.get).toHaveBeenCalledWith('test:key');
    });

    it('should return null if key not found', async () => {
      mockConnection.get.mockResolvedValueOnce(null);

      const result = await cache.get('key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set a value with TTL', async () => {
      await cache.set('key', { data: 'value' }, 300);

      expect(mockConnection.set).toHaveBeenCalledWith(
        'test:key',
        JSON.stringify({ data: 'value' }),
        300
      );
    });

    it('should set a value without TTL', async () => {
      await cache.set('key', { data: 'value' });

      expect(mockConnection.set).toHaveBeenCalledWith(
        'test:key',
        JSON.stringify({ data: 'value' }),
        3600
      );
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      mockConnection.del.mockResolvedValueOnce(1);

      const result = await cache.del('key');

      expect(result).toBe(true);
      expect(mockConnection.del).toHaveBeenCalledWith('test:key');
    });
  });

  describe('has', () => {
    it('should return true if key exists', async () => {
      mockConnection.exists.mockResolvedValueOnce(true);

      const result = await cache.has('key');

      expect(result).toBe(true);
      expect(mockConnection.exists).toHaveBeenCalledWith('test:key');
    });

    it('should return false if key does not exist', async () => {
      mockConnection.exists.mockResolvedValueOnce(false);

      const result = await cache.has('key');

      expect(result).toBe(false);
      expect(mockConnection.exists).toHaveBeenCalledWith('test:key');
    });
  });

  describe('clear', () => {
    it('should clear all keys with prefix', async () => {
      mockConnection.delPattern.mockResolvedValueOnce(2);

      const result = await cache.clear();

      expect(result).toBe(2);
      expect(mockConnection.delPattern).toHaveBeenCalledWith('test:*');
    });
  });
});
