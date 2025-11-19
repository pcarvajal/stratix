import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisPlugin } from '../RedisPlugin.js';
import { HealthStatus } from '@stratix/core';
import type { PluginContext } from '@stratix/core';

// Create mocks
const mockClient = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  quit: vi.fn(),
  ping: vi.fn(),
  on: vi.fn(),
  isOpen: false,
  isReady: false,
};

// Mock redis module
vi.mock('redis', () => ({
  createClient: vi.fn(() => mockClient),
}));

describe('RedisPlugin', () => {
  let plugin: RedisPlugin;
  let mockContext: PluginContext;
  let mockContainer: any;

  beforeEach(() => {
    plugin = new RedisPlugin();

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
    mockClient.connect.mockResolvedValue(undefined);
    mockClient.disconnect.mockResolvedValue(undefined);
    mockClient.quit.mockResolvedValue(undefined);
    mockClient.ping.mockResolvedValue('PONG');
    mockClient.isOpen = false;
    mockClient.isReady = false;
  });

  describe('metadata', () => {
    it('should have correct metadata', () => {
      expect(plugin.metadata.name).toBe('redis');
      expect(plugin.metadata.version).toBe('0.1.0');
      expect(plugin.metadata.description).toContain('Redis');
      expect(plugin.metadata.dependencies).toEqual([]);
    });
  });

  describe('initialize', () => {
    it('should initialize with valid configuration', async () => {
      const config = {
        url: 'redis://localhost:6379',
        cache: {
          prefix: 'test:',
          ttl: 3600,
        },
      };

      mockContext.getConfig = vi.fn().mockReturnValue(config);

      await plugin.initialize(mockContext);

      expect(mockContext.getConfig).toHaveBeenCalled();
      expect(mockContainer.register).toHaveBeenCalledTimes(3);
    });

    it('should throw error if url is missing', async () => {
      mockContext.getConfig = vi.fn().mockReturnValue({});

      await expect(plugin.initialize(mockContext)).rejects.toThrow('Redis URL is required');
    });
  });

  describe('start', () => {
    it('should start successfully', async () => {
      const config = { url: 'redis://localhost:6379' };
      mockContext.getConfig = vi.fn().mockReturnValue(config);
      mockClient.isReady = true;

      await plugin.initialize(mockContext);
      await plugin.start();

      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should throw if not initialized', async () => {
      await expect(plugin.start()).rejects.toThrow('not initialized');
    });
  });

  describe('stop', () => {
    it('should stop successfully', async () => {
      const config = { url: 'redis://localhost:6379' };
      mockContext.getConfig = vi.fn().mockReturnValue(config);
      mockClient.isReady = true;

      await plugin.initialize(mockContext);
      await plugin.start();
      await plugin.stop();

      expect(mockClient.quit).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return DOWN if not initialized', async () => {
      const result = await plugin.healthCheck();
      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.message).toBe('Not initialized');
    });

    it('should return UP if connected', async () => {
      const config = { url: 'redis://localhost:6379' };
      mockContext.getConfig = vi.fn().mockReturnValue(config);
      mockClient.isReady = true;
      mockClient.isOpen = true;

      await plugin.initialize(mockContext);
      await plugin.start();

      const result = await plugin.healthCheck();
      expect(result.status).toBe(HealthStatus.UP);
    });
  });
});
