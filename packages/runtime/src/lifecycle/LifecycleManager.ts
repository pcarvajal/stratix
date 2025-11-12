import type { Plugin, PluginContext } from '@stratix/abstractions';
import { PluginRegistry } from '../registry/PluginRegistry.js';
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
 * Manages the lifecycle of plugins.
 *
 * Handles initialization, startup, and shutdown of plugins in the correct order.
 *
 * @example
 * ```typescript
 * const manager = new LifecycleManager(registry);
 *
 * await manager.initializeAll(context);
 * await manager.startAll();
 * // ... application running
 * await manager.stopAll();
 * ```
 */
export class LifecycleManager {
  private phase = LifecyclePhase.UNINITIALIZED;
  private pluginPhases = new Map<string, LifecyclePhase>();

  constructor(private readonly registry: PluginRegistry) {}

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
   * await manager.initializeAll(context);
   * ```
   */
  async initializeAll(context: PluginContext): Promise<void> {
    if (this.phase !== LifecyclePhase.UNINITIALIZED) {
      return; // Already initialized
    }

    this.phase = LifecyclePhase.INITIALIZING;

    const plugins = this.registry.getPluginsInOrder();

    for (const plugin of plugins) {
      await this.initializePlugin(plugin, context);
    }

    this.phase = LifecyclePhase.INITIALIZED;
  }

  /**
   * Starts all plugins in dependency order.
   *
   * @throws {PluginLifecycleError} If a plugin fails to start
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

    const plugins = this.registry.getPluginsInOrder();

    for (const plugin of plugins) {
      await this.startPlugin(plugin);
    }

    this.phase = LifecyclePhase.STARTED;
  }

  /**
   * Stops all plugins in reverse dependency order.
   *
   * @throws {PluginLifecycleError} If a plugin fails to stop
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

    const plugins = this.registry.getPluginsInReverseOrder();

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
}
