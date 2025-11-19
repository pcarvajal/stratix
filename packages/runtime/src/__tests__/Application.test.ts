import { describe, it, expect, vi } from 'vitest';
import type {
  Container,
  Logger,
  Plugin,
  PluginMetadata,
  HealthCheckResult,
} from '@stratix/core';
import { HealthStatus } from '@stratix/core';
import { ApplicationBuilder } from '../builder/ApplicationBuilder.js';
import { LifecyclePhase } from '../lifecycle/LifecycleManager.js';

describe('Application', () => {
  const createMockContainer = (): Container => ({
    register: vi.fn(),
    resolve: vi.fn(<T>(token: string | symbol): T => {
      if (token === 'test-service') return { test: true } as T;
      throw new Error(`Service ${String(token)} not found`);
    }) as unknown as <T>(token: string | symbol) => T,
    has: vi.fn(),
    createScope: vi.fn(),
    dispose: vi.fn(),
  });

  const createMockLogger = (): Logger => ({
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  });

  const createPlugin = (
    name: string,
    dependencies: string[] = [],
    hooks: {
      initialize?: () => Promise<void>;
      start?: () => Promise<void>;
      stop?: () => Promise<void>;
      healthCheck?: () => Promise<HealthCheckResult>;
    } = {}
  ): Plugin => ({
    metadata: { name, version: '1.0.0', dependencies } as PluginMetadata,
    ...hooks,
  });

  describe('start', () => {
    it('should start all plugins', async () => {
      const started: string[] = [];

      const logger = createPlugin('logger', [], {
        start: async () => {
          started.push('logger');
        },
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .build();

      await app.start();

      expect(started).toEqual(['logger']);
      expect(app.getLifecyclePhase()).toBe(LifecyclePhase.STARTED);
    });

    it('should start plugins in dependency order', async () => {
      const order: string[] = [];

      const logger = createPlugin('logger', [], {
        start: async () => {
          order.push('logger');
        },
      });

      const database = createPlugin('database', ['logger'], {
        start: async () => {
          order.push('database');
        },
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(database)
        .build();

      await app.start();

      expect(order).toEqual(['logger', 'database']);
    });

    it('should handle plugins without start method', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      await expect(app.start()).resolves.not.toThrow();
    });
  });

  describe('stop', () => {
    it('should stop all plugins', async () => {
      const stopped: string[] = [];

      const logger = createPlugin('logger', [], {
        stop: async () => {
          stopped.push('logger');
        },
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .build();

      await app.start();
      await app.stop();

      expect(stopped).toEqual(['logger']);
      expect(app.getLifecyclePhase()).toBe(LifecyclePhase.STOPPED);
    });

    it('should stop plugins in reverse dependency order', async () => {
      const order: string[] = [];

      const logger = createPlugin('logger', [], {
        stop: async () => {
          order.push('logger');
        },
      });

      const database = createPlugin('database', ['logger'], {
        stop: async () => {
          order.push('database');
        },
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(database)
        .build();

      await app.start();
      await app.stop();

      expect(order).toEqual(['database', 'logger']);
    });

    it('should handle plugins without stop method', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      await app.start();
      await expect(app.stop()).resolves.not.toThrow();
    });
  });

  describe('resolve', () => {
    it('should resolve services from container', async () => {
      const container = createMockContainer();

      const app = await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      const service = app.resolve<{ test: boolean }>('test-service');

      expect(service).toEqual({ test: true });
      expect(container.resolve).toHaveBeenCalledWith('test-service');
    });
  });

  describe('getContainer', () => {
    it('should return the container', async () => {
      const container = createMockContainer();

      const app = await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      expect(app.getContainer()).toBe(container);
    });
  });

  describe('getPlugins', () => {
    it('should return all registered plugins', async () => {
      const logger = createPlugin('logger');
      const database = createPlugin('database');

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(database)
        .build();

      const plugins = app.getPlugins();

      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(logger);
      expect(plugins).toContain(database);
    });

    it('should return empty array if no plugins', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .build();

      expect(app.getPlugins()).toEqual([]);
    });
  });

  describe('getPlugin', () => {
    it('should return plugin by name', async () => {
      const logger = createPlugin('logger');

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .build();

      expect(app.getPlugin('logger')).toBe(logger);
    });

    it('should return undefined for non-existent plugin', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .build();

      expect(app.getPlugin('nonexistent')).toBeUndefined();
    });
  });

  describe('getLifecyclePhase', () => {
    it('should return INITIALIZED after build', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      expect(app.getLifecyclePhase()).toBe(LifecyclePhase.INITIALIZED);
    });

    it('should return STARTED after start', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      await app.start();

      expect(app.getLifecyclePhase()).toBe(LifecyclePhase.STARTED);
    });

    it('should return STOPPED after stop', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      await app.start();
      await app.stop();

      expect(app.getLifecyclePhase()).toBe(LifecyclePhase.STOPPED);
    });
  });

  describe('healthCheck', () => {
    it('should return up status when all plugins are healthy', async () => {
      const logger = createPlugin('logger', [], {
        healthCheck: async () => ({ status: HealthStatus.UP, message: 'Logger healthy' }),
      });

      const database = createPlugin('database', [], {
        healthCheck: async () => ({ status: HealthStatus.UP, message: 'Database connected' }),
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(database)
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.status).toBe(HealthStatus.UP);
      expect(result.details).toHaveProperty('logger');
      expect(result.details).toHaveProperty('database');
    });

    it('should return down status when any plugin is down', async () => {
      const logger = createPlugin('logger', [], {
        healthCheck: async () => ({ status: HealthStatus.UP, message: 'Logger healthy' }),
      });

      const database = createPlugin('database', [], {
        healthCheck: async () => ({ status: HealthStatus.DOWN, message: 'Database disconnected' }),
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(database)
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
    });

    it('should return degraded status when any plugin is degraded', async () => {
      const logger = createPlugin('logger', [], {
        healthCheck: async () => ({ status: HealthStatus.UP, message: 'Logger healthy' }),
      });

      const cache = createPlugin('cache', [], {
        healthCheck: async () => ({ status: HealthStatus.DEGRADED, message: 'Cache slow' }),
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(cache)
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.status).toBe(HealthStatus.DEGRADED);
    });

    it('should prioritize down over degraded', async () => {
      const cache = createPlugin('cache', [], {
        healthCheck: async () => ({ status: HealthStatus.DEGRADED, message: 'Cache slow' }),
      });

      const database = createPlugin('database', [], {
        healthCheck: async () => ({ status: HealthStatus.DOWN, message: 'Database disconnected' }),
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(cache)
        .usePlugin(database)
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
    });

    it('should skip plugins without healthCheck method', async () => {
      const logger = createPlugin('logger');
      const database = createPlugin('database', [], {
        healthCheck: async () => ({ status: HealthStatus.UP, message: 'Database connected' }),
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(logger)
        .usePlugin(database)
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.details).not.toHaveProperty('logger');
      expect(result.details).toHaveProperty('database');
    });

    it('should handle healthCheck errors gracefully', async () => {
      const database = createPlugin('database', [], {
        healthCheck: async () => {
          throw new Error('Health check failed');
        },
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(database)
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.status).toBe(HealthStatus.DOWN);
      expect(result.details).toHaveProperty('database');
      const databaseHealth = result.details!.database as HealthCheckResult;
      expect(databaseHealth.status).toBe(HealthStatus.DOWN);
      expect(databaseHealth.message).toContain('Health check failed');
    });

    it('should return up when no plugins have healthCheck', async () => {
      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(createPlugin('logger'))
        .build();

      await app.start();

      const result = await app.healthCheck();

      expect(result.status).toBe(HealthStatus.UP);
      expect(result.details).toEqual({});
    });
  });

  describe('complete lifecycle integration', () => {
    it('should handle full application lifecycle', async () => {
      const events: string[] = [];

      const logger = createPlugin('logger', [], {
        initialize: async () => {
          events.push('logger:init');
        },
        start: async () => {
          events.push('logger:start');
        },
        stop: async () => {
          events.push('logger:stop');
        },
        healthCheck: async () => {
          events.push('logger:health');
          return { status: HealthStatus.UP, message: 'OK' };
        },
      });

      const database = createPlugin('database', ['logger'], {
        initialize: async () => {
          events.push('database:init');
        },
        start: async () => {
          events.push('database:start');
        },
        stop: async () => {
          events.push('database:stop');
        },
        healthCheck: async () => {
          events.push('database:health');
          return { status: HealthStatus.UP, message: 'OK' };
        },
      });

      const app = await ApplicationBuilder.create()
        .useContainer(createMockContainer())
        .useLogger(createMockLogger())
        .usePlugin(database)
        .usePlugin(logger)
        .build();

      expect(events).toEqual(['logger:init', 'database:init']);

      await app.start();
      expect(events).toEqual(['logger:init', 'database:init', 'logger:start', 'database:start']);

      await app.healthCheck();

      // Health checks are done, but order is based on plugin registration order
      expect(events).toContain('logger:health');
      expect(events).toContain('database:health');
      expect(events.slice(0, 4)).toEqual([
        'logger:init',
        'database:init',
        'logger:start',
        'database:start',
      ]);

      await app.stop();

      // Verify all events occurred
      expect(events).toContain('logger:init');
      expect(events).toContain('database:init');
      expect(events).toContain('logger:start');
      expect(events).toContain('database:start');
      expect(events).toContain('logger:health');
      expect(events).toContain('database:health');
      expect(events).toContain('database:stop');
      expect(events).toContain('logger:stop');

      // Verify correct ordering of critical events
      expect(events.indexOf('logger:init')).toBeLessThan(events.indexOf('database:init'));
      expect(events.indexOf('database:init')).toBeLessThan(events.indexOf('logger:start'));
      expect(events.indexOf('database:stop')).toBeLessThan(events.indexOf('logger:stop'));
    });
  });
});
