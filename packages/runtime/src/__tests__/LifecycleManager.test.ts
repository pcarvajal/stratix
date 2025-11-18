import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Plugin, PluginMetadata, PluginContext } from '@stratix/abstractions';
import { PluginRegistry } from '../registry/PluginRegistry.js';
import { ModuleRegistry } from '../module/ModuleRegistry.js';
import { LifecycleManager, LifecyclePhase } from '../lifecycle/LifecycleManager.js';
import { PluginLifecycleError } from '../errors/RuntimeError.js';

describe('LifecycleManager', () => {
  const createPlugin = (
    name: string,
    dependencies: string[] = [],
    hooks: {
      initialize?: (context: PluginContext) => Promise<void>;
      start?: () => Promise<void>;
      stop?: () => Promise<void>;
    } = {}
  ): Plugin => ({
    metadata: {
      name,
      version: '1.0.0',
      dependencies,
    } as PluginMetadata,
    ...hooks,
  });

  const createMockContext = (): PluginContext => ({
    container: {
      register: vi.fn(),
      resolve: vi.fn(),
      has: vi.fn(),
      createScope: vi.fn(),
      dispose: vi.fn(),
    },
    logger: {
      log: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    },
    getConfig: vi.fn(<T = Record<string, unknown>>(): T => ({}) as T) as unknown as <
      T = Record<string, unknown>,
    >() => T,
    getService: vi.fn(),
  });

  describe('initialization', () => {
    it('should start in UNINITIALIZED phase', () => {
      const registry = new PluginRegistry();
      const manager = new LifecycleManager(registry, new ModuleRegistry());

      expect(manager.currentPhase).toBe(LifecyclePhase.UNINITIALIZED);
    });
  });

  describe('initializeAll', () => {
    it('should initialize plugins in dependency order', async () => {
      const registry = new PluginRegistry();
      const order: string[] = [];

      const logger = createPlugin('logger', [], {
        initialize: async () => {
          order.push('logger');
        },
      });
      const database = createPlugin('database', ['logger'], {
        initialize: async () => {
          order.push('database');
        },
      });
      const api = createPlugin('api', ['database'], {
        initialize: async () => {
          order.push('api');
        },
      });

      registry.register(logger);
      registry.register(database);
      registry.register(api);

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      const context = createMockContext();

      await manager.initializeAll(context);

      expect(order).toEqual(['logger', 'database', 'api']);
      expect(manager.currentPhase).toBe(LifecyclePhase.INITIALIZED);
    });

    it('should skip plugins without initialize method', async () => {
      const registry = new PluginRegistry();
      const initialized: string[] = [];

      registry.register(
        createPlugin('logger', [], {
          initialize: async () => {
            initialized.push('logger');
          },
        })
      );
      registry.register(createPlugin('metrics')); // No initialize

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());

      expect(initialized).toEqual(['logger']);
      expect(manager.currentPhase).toBe(LifecyclePhase.INITIALIZED);
    });

    it('should pass context to initialize method', async () => {
      const registry = new PluginRegistry();
      const context = createMockContext();
      let receivedContext: PluginContext | undefined;

      registry.register(
        createPlugin('logger', [], {
          initialize: async (ctx) => {
            receivedContext = ctx;
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(context);

      expect(receivedContext).toBe(context);
    });

    it('should throw PluginLifecycleError on initialization failure', async () => {
      const registry = new PluginRegistry();
      registry.register(
        createPlugin('logger', [], {
          initialize: async () => {
            throw new Error('Connection failed');
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());

      await expect(manager.initializeAll(createMockContext())).rejects.toThrow('failed during');

      // Create new manager for additional checks since initialization only runs once
      const manager2 = new LifecycleManager(registry, new ModuleRegistry());
      await expect(manager2.initializeAll(createMockContext())).rejects.toThrow(/logger/);

      const manager3 = new LifecycleManager(registry, new ModuleRegistry());
      await expect(manager3.initializeAll(createMockContext())).rejects.toThrow(/initialize/);
    });

    it('should transition through INITIALIZING phase', async () => {
      const registry = new PluginRegistry();
      const phases: LifecyclePhase[] = [];

      registry.register(
        createPlugin('logger', [], {
          initialize: async () => {
            phases.push(manager.currentPhase);
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      phases.push(manager.currentPhase);

      await manager.initializeAll(createMockContext());
      phases.push(manager.currentPhase);

      expect(phases).toEqual([
        LifecyclePhase.UNINITIALIZED,
        LifecyclePhase.INITIALIZING,
        LifecyclePhase.INITIALIZED,
      ]);
    });

    it('should not re-initialize if already initialized', async () => {
      const registry = new PluginRegistry();
      let initCount = 0;

      registry.register(
        createPlugin('logger', [], {
          initialize: async () => {
            initCount++;
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.initializeAll(createMockContext());
      await manager.initializeAll(createMockContext());

      expect(initCount).toBe(1);
    });
  });

  describe('startAll', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should start plugins in dependency order', async () => {
      const registry = new PluginRegistry();
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

      registry.register(logger);
      registry.register(database);

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();

      expect(order).toEqual(['logger', 'database']);
      expect(manager.currentPhase).toBe(LifecyclePhase.STARTED);
    });

    it('should skip plugins without start method', async () => {
      const registry = new PluginRegistry();
      const started: string[] = [];

      registry.register(
        createPlugin('logger', [], {
          start: async () => {
            started.push('logger');
          },
        })
      );
      registry.register(createPlugin('metrics')); // No start

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();

      expect(started).toEqual(['logger']);
    });

    it('should throw PluginLifecycleError on start failure', async () => {
      const registry = new PluginRegistry();
      registry.register(
        createPlugin('database', [], {
          start: async () => {
            throw new Error('Connection timeout');
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());

      const error = manager.startAll();
      await expect(error).rejects.toThrow('failed during');
      await expect(error).rejects.toThrow(/database/);
      await expect(error).rejects.toThrow(/start/);
    });

    it('should require initialization before starting', async () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('logger'));

      const manager = new LifecycleManager(registry, new ModuleRegistry());

      await expect(manager.startAll()).rejects.toThrow(/initialized/);
    });
  });

  describe('stopAll', () => {
    it('should stop plugins in reverse dependency order', async () => {
      const registry = new PluginRegistry();
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

      registry.register(logger);
      registry.register(database);

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();
      await manager.stopAll();

      expect(order).toEqual(['database', 'logger']);
      expect(manager.currentPhase).toBe(LifecyclePhase.STOPPED);
    });

    it('should skip plugins without stop method', async () => {
      const registry = new PluginRegistry();
      const stopped: string[] = [];

      registry.register(
        createPlugin('logger', [], {
          stop: async () => {
            stopped.push('logger');
          },
        })
      );
      registry.register(createPlugin('metrics')); // No stop

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();
      await manager.stopAll();

      expect(stopped).toEqual(['logger']);
    });

    it('should continue stopping other plugins on failure', async () => {
      const registry = new PluginRegistry();
      const stopped: string[] = [];

      registry.register(
        createPlugin('logger', [], {
          stop: async () => {
            stopped.push('logger');
          },
        })
      );
      registry.register(
        createPlugin('database', ['logger'], {
          stop: async () => {
            throw new Error('Cleanup failed');
          },
        })
      );
      registry.register(
        createPlugin('api', ['database'], {
          stop: async () => {
            stopped.push('api');
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();

      // Should not throw, but should log error
      await manager.stopAll();

      expect(stopped).toContain('logger');
      expect(stopped).toContain('api');
    });

    it('should allow stopping without starting', async () => {
      const registry = new PluginRegistry();
      const stopped: string[] = [];

      registry.register(
        createPlugin('logger', [], {
          stop: async () => {
            stopped.push('logger');
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.stopAll();

      expect(stopped).toEqual(['logger']);
    });
  });

  describe('getPluginPhase', () => {
    it('should return UNINITIALIZED for uninitialized plugin', () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('logger'));

      const manager = new LifecycleManager(registry, new ModuleRegistry());

      expect(manager.getPluginPhase('logger')).toBe(LifecyclePhase.UNINITIALIZED);
    });

    it('should return INITIALIZED after initialization', async () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('logger'));

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());

      expect(manager.getPluginPhase('logger')).toBe(LifecyclePhase.INITIALIZED);
    });

    it('should return STARTED after starting', async () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('logger'));

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();

      expect(manager.getPluginPhase('logger')).toBe(LifecyclePhase.STARTED);
    });

    it('should return STOPPED after stopping', async () => {
      const registry = new PluginRegistry();
      registry.register(createPlugin('logger'));

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();
      await manager.stopAll();

      expect(manager.getPluginPhase('logger')).toBe(LifecyclePhase.STOPPED);
    });

    it('should return UNINITIALIZED for unknown plugin', () => {
      const registry = new PluginRegistry();
      const manager = new LifecycleManager(registry, new ModuleRegistry());

      expect(manager.getPluginPhase('nonexistent')).toBe(LifecyclePhase.UNINITIALIZED);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete lifecycle', async () => {
      const registry = new PluginRegistry();
      const events: string[] = [];

      registry.register(
        createPlugin('logger', [], {
          initialize: async () => {
            events.push('logger:init');
          },
          start: async () => {
            events.push('logger:start');
          },
          stop: async () => {
            events.push('logger:stop');
          },
        })
      );

      registry.register(
        createPlugin('database', ['logger'], {
          initialize: async () => {
            events.push('database:init');
          },
          start: async () => {
            events.push('database:start');
          },
          stop: async () => {
            events.push('database:stop');
          },
        })
      );

      const manager = new LifecycleManager(registry, new ModuleRegistry());
      await manager.initializeAll(createMockContext());
      await manager.startAll();
      await manager.stopAll();

      expect(events).toEqual([
        'logger:init',
        'database:init',
        'logger:start',
        'database:start',
        'database:stop',
        'logger:stop',
      ]);
    });

    it('should handle empty registry', async () => {
      const registry = new PluginRegistry();
      const manager = new LifecycleManager(registry, new ModuleRegistry());

      await manager.initializeAll(createMockContext());
      await manager.startAll();
      await manager.stopAll();

      expect(manager.currentPhase).toBe(LifecyclePhase.STOPPED);
    });
  });
});
