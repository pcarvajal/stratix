/**
 * Metadata describing a context module.
 *
 * @example
 * ```typescript
 * {
 *   name: 'products-context',
 *   version: '1.0.0',
 *   description: 'Products Bounded Context',
 *   requiredPlugins: ['postgres', 'rabbitmq'],
 *   requiredModules: ['inventory-context']
 * }
 * ```
 */
export interface ModuleMetadata {
  /**
   * Unique name of the module.
   * Convention: '{context}-context' (e.g., 'products-context')
   */
  name: string;

  /**
   * Version of the module.
   */
  version: string;

  /**
   * Description of what the module does.
   */
  description?: string;

  /**
   * Names of plugins that this module requires.
   * Plugins must be initialized before this module.
   *
   * @example ['postgres', 'redis', 'rabbitmq']
   */
  requiredPlugins?: string[];

  /**
   * Names of other modules that this module depends on.
   * Modules must be initialized before this module.
   *
   * @example ['inventory-context', 'products-context']
   */
  requiredModules?: string[];
}
