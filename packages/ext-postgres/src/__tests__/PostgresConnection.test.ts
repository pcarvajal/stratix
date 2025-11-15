import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { PostgresConnection } from '../PostgresConnection.js';
import type { PoolConfig, Pool } from 'pg';

// Create mocks
const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

const mockPool = {
  connect: vi.fn(),
  query: vi.fn(),
  end: vi.fn(),
  on: vi.fn(),
  totalCount: 10,
  idleCount: 5,
  waitingCount: 0,
};

// Mock pg module
vi.mock('pg', () => ({
  Pool: vi.fn(() => mockPool),
}));

describe('PostgresConnection', () => {
  let connection: PostgresConnection;
  let config: PoolConfig;

  beforeEach(() => {
    config = {
      connectionString: 'postgres://user:pass@localhost:5432/testdb',
      max: 10,
    };

    // Reset mocks
    vi.clearAllMocks();
    mockClient.query.mockResolvedValue({ rows: [{ now: new Date() }] });
    mockClient.release.mockReturnValue(undefined);
    mockPool.connect.mockResolvedValue(mockClient);
    mockPool.query.mockResolvedValue({ rows: [] });
    mockPool.end.mockResolvedValue(undefined);

    connection = new PostgresConnection(config);
  });

  describe('constructor', () => {
    it('should create a new connection instance', () => {
      expect(connection).toBeInstanceOf(PostgresConnection);
    });

    it('should setup error handler on pool', () => {
      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await connection.connect();

      expect(connection.connected()).toBe(true);
    });

    it('should not connect twice', async () => {
      await connection.connect();
      await connection.connect();

      // Should only connect once
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
    });

    it('should throw error on connection failure', async () => {
      mockPool.connect.mockRejectedValueOnce(new Error('Connection failed'));

      const failingConnection = new PostgresConnection(config);

      await expect(failingConnection.connect()).rejects.toThrow('Failed to connect to PostgreSQL');
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await connection.connect();
      await connection.disconnect();

      expect(connection.connected()).toBe(false);
    });

    it('should not disconnect if not connected', async () => {
      await connection.disconnect();

      expect(mockPool.end).not.toHaveBeenCalled();
    });
  });

  describe('query', () => {
    it('should execute a query without parameters', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });

      const result = await connection.query('SELECT * FROM users');

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users', undefined);
      expect(result.rows).toEqual([{ id: 1 }]);
    });

    it('should execute a query with parameters', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'John' }], rowCount: 1 });

      const result = await connection.query('SELECT * FROM users WHERE id = $1', [1]);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(result.rows).toEqual([{ id: 1, name: 'John' }]);
    });

    it('should handle query errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Query error'));

      await expect(connection.query('INVALID SQL')).rejects.toThrow('Query error');
    });
  });

  describe('getClient', () => {
    it('should get a client from the pool', async () => {
      const client = await connection.getClient();

      expect(client).toBeDefined();
      expect(client.query).toBeDefined();
      expect(client.release).toBeDefined();
    });
  });

  describe('getPool', () => {
    it('should return the underlying pool', () => {
      const pool = connection.getPool();

      expect(pool).toBeDefined();
      expect(pool.connect).toBeDefined();
      expect(pool.query).toBeDefined();
    });
  });

  describe('createUnitOfWork', () => {
    it('should create a new UnitOfWork instance', () => {
      const uow = connection.createUnitOfWork();

      expect(uow).toBeDefined();
      expect(typeof uow.begin).toBe('function');
      expect(typeof uow.commit).toBe('function');
      expect(typeof uow.rollback).toBe('function');
    });
  });

  describe('connected', () => {
    it('should return false initially', () => {
      expect(connection.connected()).toBe(false);
    });

    it('should return true after connection', async () => {
      await connection.connect();

      expect(connection.connected()).toBe(true);
    });

    it('should return false after disconnection', async () => {
      await connection.connect();
      await connection.disconnect();

      expect(connection.connected()).toBe(false);
    });
  });

  describe('getPoolStats', () => {
    it('should return pool statistics', () => {
      const stats = connection.getPoolStats();

      expect(stats).toEqual({
        totalCount: 10,
        idleCount: 5,
        waitingCount: 0,
      });
    });
  });
});
