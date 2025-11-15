import { ServiceLifetime } from './ServiceLifetime.js';

/**
 * Options for registering a service in the container.
 *
 * @example
 * ```typescript
 * container.register('logger', () => new ConsoleLogger(), {
 *   lifetime: ServiceLifetime.SINGLETON
 * });
 * ```
 */
export interface RegisterOptions {
  /**
   * The lifetime of the service.
   * Defaults to TRANSIENT if not specified.
   */
  lifetime?: ServiceLifetime;
}
