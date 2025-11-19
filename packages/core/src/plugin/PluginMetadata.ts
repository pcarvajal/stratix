/**
 * Metadata describing a plugin.
 *
 * @example
 * ```typescript
 * {
 *   name: 'postgres',
 *   version: '1.0.0',
 *   description: 'PostgreSQL database plugin',
 *   dependencies: ['logger'],
 *   optionalDependencies: ['opentelemetry']
 * }
 * ```
 */
export interface PluginMetadata {
  /**
   * Unique name of the plugin.
   */
  name: string;

  /**
   * Version of the plugin.
   */
  version: string;

  /**
   * Description of what the plugin does.
   */
  description?: string;

  /**
   * Names of plugins that this plugin depends on.
   * These plugins will be initialized before this one.
   */
  dependencies?: string[];

  /**
   * Names of plugins that this plugin can optionally use.
   * These plugins will be initialized before this one if they are present,
   * but the plugin will still work if they are not.
   */
  optionalDependencies?: string[];
}
