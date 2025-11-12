import { PluginMetadata } from './PluginMetadata.js';
import { PluginContext } from './PluginContext.js';
import { HealthCheckResult } from '../infrastructure/HealthCheck.js';

/**
 * Plugin interface for extending Stratix applications.
 *
 * Plugins follow a lifecycle: initialize → start → stop
 *
 * @example
 * ```typescript
 * class DatabasePlugin implements Plugin {
 *   readonly metadata: PluginMetadata = {
 *     name: 'database',
 *     version: '1.0.0',
 *     description: 'PostgreSQL database plugin',
 *     dependencies: ['logger']
 *   };
 *
 *   private database?: Database;
 *
 *   async initialize(context: PluginContext): Promise<void> {
 *     const config = context.getConfig<DatabaseConfig>();
 *     this.database = new Database(config);
 *
 *     context.container.register('database', () => this.database, {
 *       lifetime: ServiceLifetime.SINGLETON
 *     });
 *   }
 *
 *   async start(): Promise<void> {
 *     await this.database?.connect();
 *   }
 *
 *   async stop(): Promise<void> {
 *     await this.database?.disconnect();
 *   }
 *
 *   async healthCheck(): Promise<HealthCheckResult> {
 *     return await this.database?.ping();
 *   }
 * }
 * ```
 */
export interface Plugin {
  /**
   * Plugin metadata (name, version, dependencies).
   */
  readonly metadata: PluginMetadata;

  /**
   * Initializes the plugin.
   *
   * Called during application startup, after all dependencies are initialized.
   * Register services in the container during this phase.
   *
   * @param context - The plugin context
   *
   * @example
   * ```typescript
   * async initialize(context: PluginContext): Promise<void> {
   *   const database = new Database(context.getConfig());
   *   context.container.register('database', () => database);
   * }
   * ```
   */
  initialize?(context: PluginContext): Promise<void>;

  /**
   * Starts the plugin.
   *
   * Called after all plugins are initialized, before the application starts.
   * Connect to external resources during this phase.
   *
   * @example
   * ```typescript
   * async start(): Promise<void> {
   *   await this.database.connect();
   *   console.log('Database connected');
   * }
   * ```
   */
  start?(): Promise<void>;

  /**
   * Stops the plugin.
   *
   * Called during application shutdown, in reverse dependency order.
   * Close connections and clean up resources during this phase.
   *
   * @example
   * ```typescript
   * async stop(): Promise<void> {
   *   await this.database.disconnect();
   *   console.log('Database disconnected');
   * }
   * ```
   */
  stop?(): Promise<void>;

  /**
   * Performs a health check for the plugin.
   *
   * @returns The health check result
   *
   * @example
   * ```typescript
   * async healthCheck(): Promise<HealthCheckResult> {
   *   try {
   *     await this.database.ping();
   *     return { status: HealthStatus.UP };
   *   } catch (error) {
   *     return { status: HealthStatus.DOWN, message: error.message };
   *   }
   * }
   * ```
   */
  healthCheck?(): Promise<HealthCheckResult>;
}
