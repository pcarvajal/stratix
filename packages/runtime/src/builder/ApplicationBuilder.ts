import type { Container, Logger, Plugin, ContextModule } from '@stratix/core';
import { PluginRegistry } from '../registry/PluginRegistry.js';
import { ModuleRegistry } from '../module/ModuleRegistry.js';
import { LifecycleManager } from '../lifecycle/LifecycleManager.js';
import { DefaultPluginContext } from './DefaultPluginContext.js';
import { Application } from './Application.js';

/**
 * Application builder options.
 */
export interface ApplicationBuilderOptions {
  /**
   * The dependency injection container.
   * Must be provided before building.
   */
  container?: Container;

  /**
   * The logger instance.
   * Must be provided before building.
   */
  logger?: Logger;

  /**
   * Plugin configurations.
   */
  pluginConfigs?: Map<string, unknown>;
}

/**
 * Builder for creating Stratix applications.
 *
 * Provides a fluent API for configuring and building applications.
 *
 * @example
 * ```typescript
 * const app = await ApplicationBuilder.create()
 *   .useContainer(container)
 *   .useLogger(logger)
 *   .usePlugin(new PostgresPlugin())
 *   .usePlugin(new RabbitMQPlugin())
 *   .useContext(new OrdersContextModule())
 *   .useContext(new ProductsContextModule())
 *   .build();
 *
 * await app.start();
 * ```
 */
export class ApplicationBuilder {
  private container?: Container;
  private logger?: Logger;
  private pluginRegistry = new PluginRegistry();
  private moduleRegistry = new ModuleRegistry();
  private pluginConfigs = new Map<string, unknown>();
  private moduleConfigs = new Map<string, unknown>();

  private constructor() {}

  /**
   * Creates a new ApplicationBuilder.
   *
   * @returns A new ApplicationBuilder instance
   */
  static create(): ApplicationBuilder {
    return new ApplicationBuilder();
  }

  /**
   * Sets the dependency injection container.
   *
   * @param container - The container to use
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.useContainer(new AwilixContainer());
   * ```
   */
  useContainer(container: Container): this {
    this.container = container;
    return this;
  }

  /**
   * Sets the logger.
   *
   * @param logger - The logger to use
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.useLogger(new ConsoleLogger());
   * ```
   */
  useLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  /**
   * Registers a plugin.
   *
   * @param plugin - The plugin to register
   * @param config - Optional configuration for the plugin
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.usePlugin(new DatabasePlugin(), {
   *   host: 'localhost',
   *   port: 5432
   * });
   * ```
   */
  usePlugin(plugin: Plugin, config?: unknown): this {
    this.pluginRegistry.register(plugin);

    if (config) {
      this.pluginConfigs.set(plugin.metadata.name, config);
    }

    return this;
  }

  /**
   * Registers multiple plugins.
   *
   * @param plugins - The plugins to register
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.usePlugins([
   *   new LoggerPlugin(),
   *   new DatabasePlugin(),
   *   new ApiPlugin()
   * ]);
   * ```
   */
  usePlugins(plugins: Plugin[]): this {
    for (const plugin of plugins) {
      this.pluginRegistry.register(plugin);
    }
    return this;
  }

  /**
   * Registers a domain module.
   *
   * Context modules are domain/business logic modules that encapsulate
   * a complete domain (domain layer, application layer, infrastructure).
   *
   * @param contextModule - The context module to register
   * @param config - Optional configuration for the module
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.useContext(new OrdersContextModule());
   * builder.useContext(new ProductsContextModule());
   * ```
   */
  useContext(contextModule: ContextModule, config?: unknown): this {
    this.moduleRegistry.register(contextModule);

    if (config) {
      this.moduleConfigs.set(contextModule.metadata.name, config);
    }

    return this;
  }

  /**
   * Registers multiple domain modules.
   *
   * @param contextModules - The context modules to register
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.useContexts([
   *   new OrdersContextModule(),
   *   new ProductsContextModule(),
   *   new InventoryContextModule()
   * ]);
   * ```
   */
  useContexts(contextModules: ContextModule[]): this {
    for (const contextModule of contextModules) {
      this.moduleRegistry.register(contextModule);
    }
    return this;
  }

  /**
   * Sets configuration for a plugin.
   *
   * @param pluginName - The plugin name
   * @param config - The configuration
   * @returns This builder for chaining
   *
   * @example
   * ```typescript
   * builder.configurePlugin('database', {
   *   host: 'localhost',
   *   port: 5432
   * });
   * ```
   */
  configurePlugin(pluginName: string, config: unknown): this {
    this.pluginConfigs.set(pluginName, config);
    return this;
  }

  /**
   * Builds and initializes the application.
   *
   * Initializes all plugins in dependency order.
   *
   * @returns The initialized application
   * @throws {Error} If container or logger is not set
   * @throws {PluginLifecycleError} If a plugin fails to initialize
   *
   * @example
   * ```typescript
   * const app = await builder.build();
   * ```
   */
  async build(): Promise<Application> {
    if (!this.container) {
      throw new Error('Container must be set before building');
    }

    if (!this.logger) {
      throw new Error('Logger must be set before building');
    }

    const lifecycleManager = new LifecycleManager(this.pluginRegistry, this.moduleRegistry);
    const pluginContext = new DefaultPluginContext(this.container, this.logger, this.pluginConfigs);

    // Initialize plugins first
    await lifecycleManager.initializePlugins(pluginContext);

    // Initialize modules after plugins (if any)
    if (this.moduleRegistry.size > 0) {
      await lifecycleManager.initializeModules(this.container, this.logger, this.moduleConfigs);
    }

    return new Application(this.container, this.pluginRegistry, this.moduleRegistry, lifecycleManager);
  }

  /**
   * Gets the number of registered plugins.
   */
  get pluginCount(): number {
    return this.pluginRegistry.size;
  }

  /**
   * Gets the number of registered modules.
   */
  get moduleCount(): number {
    return this.moduleRegistry.size;
  }
}
