import { describe, it, expect, vi } from 'vitest';
import type { Container, Logger, Plugin, PluginMetadata } from '@stratix/abstractions';
import { ApplicationBuilder } from '../builder/ApplicationBuilder.js';

describe('ApplicationBuilder', () => {
  const createMockContainer = (): Container => ({
    register: vi.fn(),
    resolve: vi.fn(),
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

  const createPlugin = (name: string, dependencies: string[] = []): Plugin => ({
    metadata: {
      name,
      version: '1.0.0',
      dependencies,
    } as PluginMetadata,
  });

  describe('create', () => {
    it('should create a new ApplicationBuilder instance', () => {
      const builder = ApplicationBuilder.create();

      expect(builder).toBeInstanceOf(ApplicationBuilder);
    });
  });

  describe('useContainer', () => {
    it('should set the container', () => {
      const builder = ApplicationBuilder.create();
      const container = createMockContainer();

      const result = builder.useContainer(container);

      expect(result).toBe(builder); // Fluent API
    });

    it('should allow method chaining', () => {
      const builder = ApplicationBuilder.create();
      const container = createMockContainer();
      const logger = createMockLogger();

      const result = builder.useContainer(container).useLogger(logger);

      expect(result).toBe(builder);
    });
  });

  describe('useLogger', () => {
    it('should set the logger', () => {
      const builder = ApplicationBuilder.create();
      const logger = createMockLogger();

      const result = builder.useLogger(logger);

      expect(result).toBe(builder); // Fluent API
    });
  });

  describe('usePlugin', () => {
    it('should register a plugin', () => {
      const builder = ApplicationBuilder.create();
      const plugin = createPlugin('logger');

      const result = builder.usePlugin(plugin);

      expect(result).toBe(builder); // Fluent API
      expect(builder.pluginCount).toBe(1);
    });

    it('should register plugin with config', () => {
      const builder = ApplicationBuilder.create();
      const plugin = createPlugin('database');
      const config = { host: 'localhost', port: 5432 };

      builder.usePlugin(plugin, config);

      expect(builder.pluginCount).toBe(1);
    });

    it('should allow registering multiple plugins', () => {
      const builder = ApplicationBuilder.create();
      const logger = createPlugin('logger');
      const database = createPlugin('database');

      builder.usePlugin(logger).usePlugin(database);

      expect(builder.pluginCount).toBe(2);
    });
  });

  describe('usePlugins', () => {
    it('should register multiple plugins', () => {
      const builder = ApplicationBuilder.create();
      const plugins = [createPlugin('logger'), createPlugin('database'), createPlugin('api')];

      const result = builder.usePlugins(plugins);

      expect(result).toBe(builder); // Fluent API
      expect(builder.pluginCount).toBe(3);
    });

    it('should handle empty array', () => {
      const builder = ApplicationBuilder.create();

      builder.usePlugins([]);

      expect(builder.pluginCount).toBe(0);
    });
  });

  describe('configurePlugin', () => {
    it('should set plugin configuration', () => {
      const builder = ApplicationBuilder.create();
      const config = { host: 'localhost' };

      const result = builder.configurePlugin('database', config);

      expect(result).toBe(builder); // Fluent API
    });

    it('should allow configuring plugin before registration', () => {
      const builder = ApplicationBuilder.create();
      const plugin = createPlugin('database');

      builder.configurePlugin('database', { host: 'localhost' }).usePlugin(plugin);

      expect(builder.pluginCount).toBe(1);
    });

    it('should allow configuring plugin after registration', () => {
      const builder = ApplicationBuilder.create();
      const plugin = createPlugin('database');

      builder.usePlugin(plugin).configurePlugin('database', { host: 'localhost' });

      expect(builder.pluginCount).toBe(1);
    });
  });

  describe('build', () => {
    it('should build and initialize application', async () => {
      const container = createMockContainer();
      const logger = createMockLogger();
      const plugin = createPlugin('logger', []);

      const app = await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(logger)
        .usePlugin(plugin)
        .build();

      expect(app).toBeDefined();
      expect(app.getPlugins()).toHaveLength(1);
    });

    it('should throw error if container is not set', async () => {
      const logger = createMockLogger();

      await expect(ApplicationBuilder.create().useLogger(logger).build()).rejects.toThrow(
        'Container must be set before building'
      );
    });

    it('should throw error if logger is not set', async () => {
      const container = createMockContainer();

      await expect(ApplicationBuilder.create().useContainer(container).build()).rejects.toThrow(
        'Logger must be set before building'
      );
    });

    it('should initialize plugins during build', async () => {
      const container = createMockContainer();
      const logger = createMockLogger();
      let initialized = false;

      const plugin: Plugin = {
        metadata: { name: 'logger', version: '1.0.0' } as PluginMetadata,
        initialize: async () => {
          initialized = true;
        },
      };

      await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(logger)
        .usePlugin(plugin)
        .build();

      expect(initialized).toBe(true);
    });

    it('should initialize plugins in dependency order', async () => {
      const container = createMockContainer();
      const logger = createMockLogger();
      const order: string[] = [];

      const loggerPlugin: Plugin = {
        metadata: { name: 'logger', version: '1.0.0' } as PluginMetadata,
        initialize: async () => {
          order.push('logger');
        },
      };

      const databasePlugin: Plugin = {
        metadata: {
          name: 'database',
          version: '1.0.0',
          dependencies: ['logger'],
        } as PluginMetadata,
        initialize: async () => {
          order.push('database');
        },
      };

      await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(logger)
        .usePlugin(databasePlugin)
        .usePlugin(loggerPlugin)
        .build();

      expect(order).toEqual(['logger', 'database']);
    });

    it('should pass configuration to plugins', async () => {
      const container = createMockContainer();
      const logger = createMockLogger();
      const config = { host: 'localhost', port: 5432 };
      let receivedConfig: unknown;

      const plugin: Plugin = {
        metadata: { name: 'database', version: '1.0.0' } as PluginMetadata,
        initialize: async (context) => {
          receivedConfig = context.getConfig();
        },
      };

      await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(logger)
        .usePlugin(plugin, config)
        .build();

      expect(receivedConfig).toEqual(config);
    });

    it('should handle plugins without initialize method', async () => {
      const container = createMockContainer();
      const logger = createMockLogger();
      const plugin = createPlugin('logger');

      const app = await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(logger)
        .usePlugin(plugin)
        .build();

      expect(app).toBeDefined();
    });
  });

  describe('pluginCount', () => {
    it('should return 0 for new builder', () => {
      const builder = ApplicationBuilder.create();

      expect(builder.pluginCount).toBe(0);
    });

    it('should return correct count after registering plugins', () => {
      const builder = ApplicationBuilder.create();

      builder.usePlugin(createPlugin('logger')).usePlugin(createPlugin('database'));

      expect(builder.pluginCount).toBe(2);
    });
  });

  describe('fluent API integration', () => {
    it('should support full fluent chain', async () => {
      const container = createMockContainer();
      const logger = createMockLogger();

      const app = await ApplicationBuilder.create()
        .useContainer(container)
        .useLogger(logger)
        .usePlugin(createPlugin('logger'))
        .usePlugin(createPlugin('database', ['logger']), { host: 'localhost' })
        .configurePlugin('logger', { level: 'debug' })
        .usePlugins([createPlugin('cache'), createPlugin('metrics')])
        .build();

      expect(app).toBeDefined();
      expect(app.getPlugins()).toHaveLength(4);
    });
  });
});
