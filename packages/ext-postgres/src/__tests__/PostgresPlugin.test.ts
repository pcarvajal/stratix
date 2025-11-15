import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PostgresPlugin } from '../PostgresPlugin.js';
import { HealthStatus } from '@stratix/abstractions';
import type { PluginContext } from '@stratix/abstractions';
import type { Pool } from 'pg';

// Mock pg module
vi.mock('pg', () => {
  const mockPool = {
    connect: vi.fn(),
    query: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
    totalCount: 10,
    idleCount: 5,
    waitingCount: 0,
  };

  return {
    Pool: vi.fn(() => mockPool),
  };
});

describe('PostgresPlugin', () => {
  let plugin: PostgresPlugin;
  let mockContext: PluginContext;
  let mockContainer: any;

  beforeEach(() => {
    plugin = new PostgresPlugin();

    mockContainer = {
      register: vi.fn(),
      resolve: vi.fn(),
    };

    mockContext = {
      container: mockContainer,
      getConfig: vi.fn(),
      logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(plugin.metadata.name).toBe('postgres');
      expect(plugin.metadata.version).toBe('0.1.0');
      expect(plugin.metadata.description).toContain('PostgreSQL');
      expect(plugin.metadata.dependencies).toEqual([]);
    });
  });

  describe('initialize', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
        poolSize: 20,
        timeout: 5000,
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);

      expect(mockContext.getConfig).toHaveBeenCalled();
      expect(mockContainer.register).toHaveBeenCalledTimes(3);
      expect(mockContainer.register).toHaveBeenCalledWith(
        'postgres:connection',
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockContainer.register).toHaveBeenCalledWith(
        'postgres:pool',
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockContainer.register).toHaveBeenCalledWith(
        'postgres:createUnitOfWork',
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should throw error if connectionString is missing', async () => {
      mockContext.getConfig = vi.fn().mockReturnValue({});

      await expect(plugin.initialize(mockContext)).rejects.toThrow(
        'PostgreSQL connection string is required'
      );
    });

    it('should use default values for optional config', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await expect(plugin.initialize(mockContext)).resolves.not.toThrow();
    });

    it('should configure SSL when enabled', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
        ssl: true,
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await expect(plugin.initialize(mockContext)).resolves.not.toThrow();
    });
  });

  describe('start', () => {
    it('should start successfully after initialization', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      // Mock successful connection
      const { Pool } = await import('pg');
      const mockPool = new Pool() as any;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      await plugin.initialize(mockContext);
      await plugin.start();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if not initialized', async () => {
      await expect(plugin.start()).rejects.toThrow('not initialized');
    });

    it('should throw error on connection failure', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      // Mock connection failure
      const { Pool } = await import('pg');
      const mockPool = new Pool() as any;
      mockPool.connect.mockRejectedValue(new Error('Connection failed'));

      await plugin.initialize(mockContext);

      await expect(plugin.start()).rejects.toThrow('Failed to connect to PostgreSQL');
    });
  });

  describe('stop', () => {
    it('should stop successfully after start', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      // Mock successful connection
      const { Pool } = await import('pg');
      const mockPool = new Pool() as any;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      mockPool.end.mockResolvedValue(undefined);

      await plugin.initialize(mockContext);
      await plugin.start();
      await plugin.stop();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should not throw if connection is null', async () => {
      await expect(plugin.stop()).resolves.not.toThrow();
    });

    it('should handle disconnect errors gracefully', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      // Mock successful connection but failed disconnect
      const { Pool } = await import('pg');
      const mockPool = new Pool() as any;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      mockPool.end.mockRejectedValue(new Error('Disconnect failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await plugin.initialize(mockContext);
      await plugin.start();
      await plugin.stop();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error disconnecting from PostgreSQL')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('healthCheck', () => {
    it('should return DOWN if not initialized', async () => {
      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.message).toBe('Not initialized');
    });

    it('should return DOWN if not connected', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);

      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.message).toBe('Not connected');
    });

    it('should return UP if connected and responsive', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      // Mock successful connection
      const { Pool } = await import('pg');
      const mockPool = new Pool() as any;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      mockPool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      await plugin.initialize(mockContext);
      await plugin.start();

      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.UP);
      expect(result.message).toBe('Connected and responsive');
      expect(result.details).toEqual({
        totalConnections: 10,
        idleConnections: 5,
        waitingConnections: 0,
      });
    });

    it('should return DOWN if health check query fails', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      // Mock successful connection but failed health check query
      const { Pool } = await import('pg');
      const mockPool = new Pool() as any;
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);
      mockPool.query.mockRejectedValue(new Error('Query failed'));

      await plugin.initialize(mockContext);
      await plugin.start();

      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.message).toBe('Query failed');
    });
  });

  describe('getConnection', () => {
    it('should return connection after initialization', async () => {
      const config = {
        connectionString: 'postgres://user:pass@localhost:5432/testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);

      const connection = plugin.getConnection();
      expect(connection).toBeDefined();
    });

    it('should throw error if not initialized', () => {
      expect(() => plugin.getConnection()).toThrow('Connection not initialized');
    });
  });
});
