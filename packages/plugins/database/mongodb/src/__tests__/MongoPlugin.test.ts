import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MongoPlugin } from '../MongoPlugin.js';
import { HealthStatus } from '@stratix/core';
import type { PluginContext } from '@stratix/core';

// Create mocks
const mockAdmin = {
  ping: vi.fn(),
};

const mockAdminDb = {
  admin: vi.fn(() => mockAdmin),
};

const mockDb = {
  command: vi.fn(),
  collection: vi.fn(),
};

const mockClient = {
  connect: vi.fn(),
  db: vi.fn((dbName: string) => {
    if (dbName === 'admin') {
      return mockAdminDb;
    }
    return mockDb;
  }),
  close: vi.fn(),
};

// Mock mongodb module
vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => mockClient),
}));

describe('MongoPlugin', () => {
  let plugin: MongoPlugin;
  let mockContext: PluginContext;
  let mockContainer: any;

  beforeEach(() => {
    plugin = new MongoPlugin();

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
    mockClient.connect.mockResolvedValue(mockClient);
    mockClient.close.mockResolvedValue(undefined);
    mockDb.command.mockResolvedValue({ ok: 1 });
    mockAdmin.ping.mockResolvedValue({ ok: 1 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(plugin.metadata.name).toBe('mongo');
      expect(plugin.metadata.version).toBe('0.1.0');
      expect(plugin.metadata.description).toContain('MongoDB');
      expect(plugin.metadata.dependencies).toEqual([]);
    });
  });

  describe('initialize', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);

      expect(mockContext.getConfig).toHaveBeenCalled();
      expect(mockContainer.register).toHaveBeenCalledTimes(3);
      expect(mockContainer.register).toHaveBeenCalledWith(
        'mongo:connection',
        expect.any(Function)
      );
      expect(mockContainer.register).toHaveBeenCalledWith(
        'mongo:client',
        expect.any(Function)
      );
      expect(mockContainer.register).toHaveBeenCalledWith(
        'mongo:createUnitOfWork',
        expect.any(Function)
      );
    });

    it('should throw error if connectionString is missing', async () => {
      mockContext.getConfig = vi.fn().mockReturnValue({ database: 'testdb' });

      await expect(plugin.initialize(mockContext)).rejects.toThrow(
        'MongoDB connection string is required'
      );
    });

    it('should throw error if database name is missing', async () => {
      mockContext.getConfig = vi.fn().mockReturnValue({
        connectionString: 'mongodb://localhost:27017',
      });

      await expect(plugin.initialize(mockContext)).rejects.toThrow(
        'MongoDB database name is required'
      );
    });

    it('should use default values for optional config', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await expect(plugin.initialize(mockContext)).resolves.not.toThrow();
    });
  });

  describe('start', () => {
    it('should start successfully after initialization', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);
      await plugin.start();

      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should throw error if not initialized', async () => {
      await expect(plugin.start()).rejects.toThrow('not initialized');
    });

    it('should throw error on connection failure', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);
      mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));

      await plugin.initialize(mockContext);

      await expect(plugin.start()).rejects.toThrow('Failed to connect to MongoDB');
    });
  });

  describe('stop', () => {
    it('should stop successfully after start', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);
      await plugin.start();
      await plugin.stop();

      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should not throw if connection is null', async () => {
      await expect(plugin.stop()).resolves.not.toThrow();
    });

    it('should handle disconnect errors gracefully', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);
      mockClient.close.mockRejectedValueOnce(new Error('Disconnect failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await plugin.initialize(mockContext);
      await plugin.start();
      await plugin.stop();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error disconnecting from MongoDB')
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
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);

      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.message).toBe('Not connected');
    });

    it('should return UP if connected and responsive', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);
      await plugin.start();

      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.UP);
      expect(result.message).toBe('Connected and responsive');
    });

    it('should return DOWN if health check fails', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);
      mockAdmin.ping.mockRejectedValueOnce(new Error('Ping failed'));

      await plugin.initialize(mockContext);
      await plugin.start();

      const result = await plugin.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.message).toBe('Ping failed');
    });
  });

  describe('getConnection', () => {
    it('should return connection after initialization', async () => {
      const config = {
        connectionString: 'mongodb://localhost:27017',
        database: 'testdb',
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
