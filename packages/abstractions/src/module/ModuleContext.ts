import type { Container } from '../container/Container.js';
import type { Logger } from '../infrastructure/Logger.js';

/**
 * Context provided to modules during initialization.
 *
 * Modules can:
 * - Access the DI container to resolve dependencies
 * - Access the logger for logging
 * - Access configuration specific to the module
 */
export interface ModuleContext {
  /**
   * The dependency injection container.
   */
  readonly container: Container;

  /**
   * The logger instance.
   */
  readonly logger: Logger;

  /**
   * Gets configuration for this module.
   *
   * @returns The module configuration, or undefined if not set
   *
   * @example
   * ```typescript
   * const config = context.getConfig<ProductsConfig>();
   * ```
   */
  getConfig<T = unknown>(): T | undefined;
}
