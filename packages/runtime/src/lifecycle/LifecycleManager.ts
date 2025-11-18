import type { Plugin, PluginContext, ContextModule, Container, Logger } from '@stratix/abstractions';
import { ServiceLifetime } from '@stratix/abstractions';
import { PluginRegistry } from '../registry/PluginRegistry.js';
import { ModuleRegistry } from '../module/ModuleRegistry.js';
import { DefaultModuleContext } from '../module/DefaultModuleContext.js';
import { PluginLifecycleError } from '../errors/RuntimeError.js';

/**
 * Lifecycle phases for plugins.
 */
export enum LifecyclePhase {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  STARTING = 'starting',
  STARTED = 'started',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
}

/**
 * Manages the lifecycle of plugins and modules.
 *
 * Handles initialization, startup, and shutdown in the correct order:
 * 1. Plugins (infrastructure)
 * 2. Modules (domain contexts)
 *
 * @example
 * ```typescript
 * const manager = new LifecycleManager(pluginRegistry, moduleRegistry);
 *
 * await manager.initializePlugins(pluginContext);
 * await manager.initializeModules(container, logger, configs);
 * await manager.startAll();
 * await manager.stopAll();
 * ```
 */
export class LifecycleManager {
  private phase = LifecyclePhase.UNINITIALIZED;
  private pluginPhases = new Map<string, LifecyclePhase>();
  private modulePhases = new Map<string, LifecyclePhase>();

  constructor(
    private readonly pluginRegistry: PluginRegistry,
    private readonly moduleRegistry: ModuleRegistry
  ) {}

  /**
   * Gets the current lifecycle phase.
   */
  get currentPhase(): LifecyclePhase {
    return this.phase;
  }

  /**
   * Gets the lifecycle phase of a specific plugin.
   *
   * @param pluginName - The plugin name
   * @returns The plugin's lifecycle phase
   */
  getPluginPhase(pluginName: string): LifecyclePhase {
    return this.pluginPhases.get(pluginName) || LifecyclePhase.UNINITIALIZED;
  }

  /**
   * Initializes all plugins in dependency order.
   *
   * @param context - The plugin context
   * @throws {PluginLifecycleError} If a plugin fails to initialize
   *
   * @example
   * ```typescript
   * await manager.initializePlugins(pluginContext);
   * ```
   */
  async initializePlugins(context: PluginContext): Promise<void> {
    if (this.phase !== LifecyclePhase.UNINITIALIZED) {
      return; // Already initialized
    }

    this.phase = LifecyclePhase.INITIALIZING;

    const plugins = this.pluginRegistry.getPluginsInOrder();

    for (const plugin of plugins) {
      await this.initializePlugin(plugin, context);
    }

    this.phase = LifecyclePhase.INITIALIZED;
  }

  /**
   * Initializes all modules in dependency order.
   * Modules are initialized after plugins since they depend on infrastructure.
   *
   * @param container - The DI container
   * @param logger - The logger
   * @param configs - Module configurations
   * @throws {PluginLifecycleError} If a module fails to initialize
   *
   * @example
   * ```typescript
   * await manager.initializeModules(container, logger, moduleConfigs);
   * ```
   */
  async initializeModules(
    container: Container,
    logger: Logger,
    configs: Map<string, unknown>
  ): Promise<void> {
    if (this.phase !== LifecyclePhase.INITIALIZED) {
      throw new Error('Plugins must be initialized before modules');
    }

    const modules = this.moduleRegistry.getModulesInOrder();

    for (const module of modules) {
      await this.initializeModule(module, container, logger, configs);
    }
  }

  /**
   * @deprecated Use initializePlugins instead
   */
  async initializeAll(context: PluginContext): Promise<void> {
    return this.initializePlugins(context);
  }

  /**
   * Starts all plugins and modules in dependency order.
   *
   * @throws {PluginLifecycleError} If a plugin or module fails to start
   *
   * @example
   * ```typescript
   * await manager.startAll();
   * ```
   */
  async startAll(): Promise<void> {
    if (this.phase !== LifecyclePhase.INITIALIZED) {
      throw new Error('Plugins must be initialized before starting');
    }

    this.phase = LifecyclePhase.STARTING;

    // Start plugins first
    const plugins = this.pluginRegistry.getPluginsInOrder();
    for (const plugin of plugins) {
      await this.startPlugin(plugin);
    }

    // Start modules after plugins
    const modules = this.moduleRegistry.getModulesInOrder();
    for (const module of modules) {
      await this.startModule(module);
    }

    this.phase = LifecyclePhase.STARTED;
  }

  /**
   * Stops all modules and plugins in reverse dependency order.
   *
   * @throws {PluginLifecycleError} If a plugin or module fails to stop
   *
   * @example
   * ```typescript
   * await manager.stopAll();
   * ```
   */
  async stopAll(): Promise<void> {
    if (this.phase !== LifecyclePhase.STARTED) {
      // Allow stopping from any phase for graceful shutdown
    }

    this.phase = LifecyclePhase.STOPPING;

    // Stop modules first (reverse order)
    const modules = this.moduleRegistry.getModulesInReverseOrder();
    for (const module of modules) {
      await this.stopModule(module);
    }

    // Stop plugins after modules (reverse order)
    const plugins = this.pluginRegistry.getPluginsInReverseOrder();
    for (const plugin of plugins) {
      await this.stopPlugin(plugin);
    }

    this.phase = LifecyclePhase.STOPPED;
  }

  /**
   * Initializes a single plugin.
   *
   * @param plugin - The plugin to initialize
   * @param context - The plugin context
   * @private
   */
  private async initializePlugin(plugin: Plugin, context: PluginContext): Promise<void> {
    const name = plugin.metadata.name;

    try {
      this.pluginPhases.set(name, LifecyclePhase.INITIALIZING);

      if (plugin.initialize) {
        // Set current plugin name for config access
        if (
          'setCurrentPluginName' in context &&
          typeof context.setCurrentPluginName === 'function'
        ) {
          (context as { setCurrentPluginName: (name: string) => void }).setCurrentPluginName(name);
        }
        await plugin.initialize(context);
      }

      this.pluginPhases.set(name, LifecyclePhase.INITIALIZED);
    } catch (error) {
      this.pluginPhases.set(name, LifecyclePhase.UNINITIALIZED);
      throw new PluginLifecycleError(name, 'initialize', error as Error);
    }
  }

  /**
   * Starts a single plugin.
   *
   * @param plugin - The plugin to start
   * @private
   */
  private async startPlugin(plugin: Plugin): Promise<void> {
    const name = plugin.metadata.name;

    try {
      this.pluginPhases.set(name, LifecyclePhase.STARTING);

      if (plugin.start) {
        await plugin.start();
      }

      this.pluginPhases.set(name, LifecyclePhase.STARTED);
    } catch (error) {
      this.pluginPhases.set(name, LifecyclePhase.INITIALIZED);
      throw new PluginLifecycleError(name, 'start', error as Error);
    }
  }

  /**
   * Stops a single plugin.
   *
   * @param plugin - The plugin to stop
   * @private
   */
  private async stopPlugin(plugin: Plugin): Promise<void> {
    const name = plugin.metadata.name;

    try {
      this.pluginPhases.set(name, LifecyclePhase.STOPPING);

      if (plugin.stop) {
        await plugin.stop();
      }

      this.pluginPhases.set(name, LifecyclePhase.STOPPED);
    } catch (error) {
      // Continue stopping other plugins even if one fails
      console.error(`Failed to stop plugin '${name}':`, error);
      this.pluginPhases.set(name, LifecyclePhase.STOPPED);
    }
  }

  /**
   * Initializes a single module.
   *
   * @param module - The module to initialize
   * @param container - The DI container
   * @param logger - The logger
   * @param configs - Module configurations
   * @private
   */
  private async initializeModule(
    module: ContextModule,
    container: Container,
    logger: Logger,
    configs: Map<string, unknown>
  ): Promise<void> {
    const name = module.metadata.name;

    try {
      this.modulePhases.set(name, LifecyclePhase.INITIALIZING);

      // Register repositories first
      const repositories = module.getRepositories?.() || [];
      for (const repo of repositories) {
        container.register(repo.token, () => repo.instance, {
          lifetime: repo.singleton !== false ? ServiceLifetime.SINGLETON : ServiceLifetime.TRANSIENT,
        });
      }

      // Get CQRS buses from container
      const commandBus = container.resolve<{
        register: (commandType: new (...args: unknown[]) => unknown, handler: unknown) => void;
      }>('commandBus');

      const queryBus = container.resolve<{
        register: (queryType: new (...args: unknown[]) => unknown, handler: unknown) => void;
      }>('queryBus');

      const eventBus = container.resolve<{
        subscribe: (eventType: new (...args: unknown[]) => unknown, handler: unknown) => void;
      }>('eventBus');

      // Register commands
      const commands = module.getCommands?.() || [];
      for (const cmd of commands) {
        commandBus.register(cmd.commandType, cmd.handler);
      }

      // Register queries
      const queries = module.getQueries?.() || [];
      for (const query of queries) {
        queryBus.register(query.queryType, query.handler);
      }

      // Subscribe event handlers
      const eventHandlers = module.getEventHandlers?.() || [];
      for (const handler of eventHandlers) {
        eventBus.subscribe(handler.eventType, handler.handler);
      }

      // Call module initialize if present
      if (module.initialize) {
        const moduleContext = new DefaultModuleContext(container, logger, configs, name);
        await module.initialize(moduleContext);
      }

      this.modulePhases.set(name, LifecyclePhase.INITIALIZED);
    } catch (error) {
      this.modulePhases.set(name, LifecyclePhase.UNINITIALIZED);
      throw new PluginLifecycleError(name, 'initialize', error as Error);
    }
  }

  /**
   * Starts a single module.
   *
   * @param module - The module to start
   * @private
   */
  private async startModule(module: ContextModule): Promise<void> {
    const name = module.metadata.name;

    try {
      this.modulePhases.set(name, LifecyclePhase.STARTING);

      if (module.start) {
        await module.start();
      }

      this.modulePhases.set(name, LifecyclePhase.STARTED);
    } catch (error) {
      this.modulePhases.set(name, LifecyclePhase.INITIALIZED);
      throw new PluginLifecycleError(name, 'start', error as Error);
    }
  }

  /**
   * Stops a single module.
   *
   * @param module - The module to stop
   * @private
   */
  private async stopModule(module: ContextModule): Promise<void> {
    const name = module.metadata.name;

    try {
      this.modulePhases.set(name, LifecyclePhase.STOPPING);

      if (module.stop) {
        await module.stop();
      }

      this.modulePhases.set(name, LifecyclePhase.STOPPED);
    } catch (error) {
      // Continue stopping other modules even if one fails
      console.error(`Failed to stop module '${name}':`, error);
      this.modulePhases.set(name, LifecyclePhase.STOPPED);
    }
  }
}
