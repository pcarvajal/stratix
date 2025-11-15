import { Container } from '../container/Container.js';
import { Logger } from '../infrastructure/Logger.js';

/**
 * Context provided to plugins during initialization.
 *
 * Allows plugins to register services and access the application container.
 *
 * @example
 * ```typescript
 * class DatabasePlugin implements Plugin {
 *   async initialize(context: PluginContext): Promise<void> {
 *     const config = context.getConfig<DatabaseConfig>();
 *     const database = new Database(config);
 *
 *     context.container.register('database', () => database, {
 *       lifetime: ServiceLifetime.SINGLETON
 *     });
 *   }
 * }
 * ```
 */
export interface PluginContext {
  /**
   * The dependency injection container.
   * Plugins can register services here.
   */
  container: Container;

  /**
   * Logger instance for the plugin.
   */
  logger: Logger;

  /**
   * Gets configuration for this plugin.
   *
   * @template T - The configuration type
   * @returns The plugin configuration
   *
   * @example
   * ```typescript
   * const config = context.getConfig<DatabaseConfig>();
   * console.log(config.host, config.port);
   * ```
   */
  getConfig<T = Record<string, unknown>>(): T;

  /**
   * Gets a service from the container if it exists.
   *
   * @template T - The service type
   * @param name - The service name
   * @returns The service instance if it exists, undefined otherwise
   *
   * @example
   * ```typescript
   * const metrics = context.getService<Metrics>('metrics');
   * if (metrics) {
   *   metrics.increment('database.connections');
   * }
   * ```
   */
  getService<T>(name: string): T | undefined;
}
