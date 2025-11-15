import { describe, it, expect } from 'vitest';
import type { Plugin, PluginMetadata } from '@stratix/abstractions';
import { PluginRegistry } from '../registry/PluginRegistry.js';
import {
  DuplicatePluginError,
  CircularDependencyError,
  MissingDependencyError,
} from '../errors/RuntimeError.js';

describe('PluginRegistry', () => {
  const createPlugin = (name: string, dependencies: string[] = []): Plugin => ({
    metadata: {
      name,
      version: '1.0.0',
      dependencies,
    } as PluginMetadata,
  });

  describe('register', () => {
    it('should register a plugin without dependencies', () => {
      const registry = new PluginRegistry();
      const plugin = createPlugin('logger');

      registry.register(plugin);

      expect(registry.has('logger')).toBe(true);
      expect(registry.get('logger')).toBe(plugin);
    });

    it('should register multiple plugins', () => {
      const registry = new PluginRegistry();
      const logger = createPlugin('logger');
      const database = createPlugin('database', ['logger']);

      registry.register(logger);
      registry.register(database);

      expect(registry.size).toBe(2);
      expect(registry.has('logger')).toBe(true);
      expect(registry.has('database')).toBe(true);
    });

    it('should throw DuplicatePluginError for duplicate plugin', () => {
      const registry = new PluginRegistry();
      const plugin1 = createPlugin('logger');
      const plugin2 = createPlugin('logger');

      registry.register(plugin1);

      expect(() => registry.register(plugin2)).toThrow('already registered');
      expect(() => registry.register(plugin2)).toThrow(/logger/);
    });

    it('should allow plugins with dependencies not yet registered', () => {
      const registry = new PluginRegistry();
      const api = createPlugin('api', ['database', 'logger']);

      expect(() => registry.register(api)).not.toThrow();
    });
  });

  describe('get', () => {
    it('should return plugin if exists', () => {
      const registry = new PluginRegistry();
      const plugin = createPlugin('logger');

      registry.register(plugin);

      expect(registry.get('logger')).toBe(plugin);
    });

    it('should return undefined if plugin does not exist', () => {
      const registry = new PluginRegistry();

      expect(registry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true if plugin exists', () => {
      const registry = new PluginRegistry();
      const plugin = createPlugin('logger');

      registry.register(plugin);

      expect(registry.has('logger')).toBe(true);
    });

    it('should return false if plugin does not exist', () => {
      const registry = new PluginRegistry();

      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return empty array for empty registry', () => {
      const registry = new PluginRegistry();

      expect(registry.getAll()).toEqual([]);
    });

    it('should return all registered plugins', () => {
      const registry = new PluginRegistry();
      const logger = createPlugin('logger');
      const database = createPlugin('database');

      registry.register(logger);
      registry.register(database);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(logger);
      expect(all).toContain(database);
    });
  });

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      const registry = new PluginRegistry();

      expect(registry.size).toBe(0);
    });

    it('should return correct count', () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('logger'));
      registry.register(createPlugin('database'));

      expect(registry.size).toBe(2);
    });
  });

  describe('getPluginsInOrder', () => {
    it('should return empty array for empty registry', () => {
      const registry = new PluginRegistry();

      expect(registry.getPluginsInOrder()).toEqual([]);
    });

    it('should return plugins in dependency order', () => {
      const registry = new PluginRegistry();
      const logger = createPlugin('logger');
      const database = createPlugin('database', ['logger']);
      const api = createPlugin('api', ['database']);

      registry.register(api);
      registry.register(logger);
      registry.register(database);

      const ordered = registry.getPluginsInOrder();
      expect(ordered).toEqual([logger, database, api]);
    });

    it('should handle complex dependency graph', () => {
      const registry = new PluginRegistry();
      const logger = createPlugin('logger');
      const config = createPlugin('config');
      const database = createPlugin('database', ['logger', 'config']);
      const cache = createPlugin('cache', ['logger']);
      const api = createPlugin('api', ['database', 'cache']);

      registry.register(api);
      registry.register(cache);
      registry.register(database);
      registry.register(config);
      registry.register(logger);

      const ordered = registry.getPluginsInOrder();

      // Verify dependencies are satisfied
      expect(ordered.indexOf(logger)).toBeLessThan(ordered.indexOf(database));
      expect(ordered.indexOf(config)).toBeLessThan(ordered.indexOf(database));
      expect(ordered.indexOf(logger)).toBeLessThan(ordered.indexOf(cache));
      expect(ordered.indexOf(database)).toBeLessThan(ordered.indexOf(api));
      expect(ordered.indexOf(cache)).toBeLessThan(ordered.indexOf(api));
    });

    it('should throw CircularDependencyError for circular dependencies', () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('a', ['b']));
      registry.register(createPlugin('b', ['a']));

      expect(() => registry.getPluginsInOrder()).toThrow('Circular dependency detected');
    });

    it('should throw MissingDependencyError for missing dependencies', () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('database', ['logger']));

      expect(() => registry.getPluginsInOrder()).toThrow('depends on');
      expect(() => registry.getPluginsInOrder()).toThrow(/logger/);
    });
  });

  describe('getPluginsInReverseOrder', () => {
    it('should return empty array for empty registry', () => {
      const registry = new PluginRegistry();

      expect(registry.getPluginsInReverseOrder()).toEqual([]);
    });

    it('should return plugins in reverse dependency order', () => {
      const registry = new PluginRegistry();
      const logger = createPlugin('logger');
      const database = createPlugin('database', ['logger']);
      const api = createPlugin('api', ['database']);

      registry.register(logger);
      registry.register(database);
      registry.register(api);

      const ordered = registry.getPluginsInReverseOrder();
      expect(ordered).toEqual([api, database, logger]);
    });

    it('should throw same errors as getPluginsInOrder', () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('a', ['b']));
      registry.register(createPlugin('b', ['a']));

      expect(() => registry.getPluginsInReverseOrder()).toThrow('Circular dependency detected');
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical plugin setup', () => {
      const registry = new PluginRegistry();

      // Register in random order
      registry.register(createPlugin('api', ['database', 'logger']));
      registry.register(createPlugin('logger'));
      registry.register(createPlugin('database', ['logger']));
      registry.register(createPlugin('metrics', ['logger']));

      expect(registry.size).toBe(4);

      const ordered = registry.getPluginsInOrder();
      const orderedNames = ordered.map((p) => p.metadata.name);

      // Logger must be first (no dependencies)
      expect(orderedNames[0]).toBe('logger');

      // Verify dependency constraints
      expect(orderedNames.indexOf('logger')).toBeLessThan(orderedNames.indexOf('database'));
      expect(orderedNames.indexOf('logger')).toBeLessThan(orderedNames.indexOf('metrics'));
      expect(orderedNames.indexOf('logger')).toBeLessThan(orderedNames.indexOf('api'));
      expect(orderedNames.indexOf('database')).toBeLessThan(orderedNames.indexOf('api'));
    });

    it('should handle plugins without dependencies', () => {
      const registry = new PluginRegistry();

      registry.register(createPlugin('logger'));
      registry.register(createPlugin('config'));
      registry.register(createPlugin('metrics'));

      const ordered = registry.getPluginsInOrder();
      expect(ordered).toHaveLength(3);
    });
  });
});
