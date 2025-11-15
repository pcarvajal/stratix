import type { Plugin } from '@stratix/abstractions';
import { DependencyGraph } from '../graph/DependencyGraph.js';
import { DuplicatePluginError } from '../errors/RuntimeError.js';

/**
 * Registry for managing plugins and their dependencies.
 *
 * Maintains the dependency graph and provides plugins in initialization order.
 *
 * @example
 * ```typescript
 * const registry = new PluginRegistry();
 *
 * registry.register(loggerPlugin);
 * registry.register(databasePlugin);
 * registry.register(apiPlugin);
 *
 * const plugins = registry.getPluginsInOrder();
 * // Plugins in dependency order
 * ```
 */
export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private dependencyGraph = new DependencyGraph();

  /**
   * Registers a plugin.
   *
   * @param plugin - The plugin to register
   * @throws {DuplicatePluginError} If a plugin with the same name is already registered
   *
   * @example
   * ```typescript
   * registry.register(new DatabasePlugin());
   * ```
   */
  register(plugin: Plugin): void {
    const name = plugin.metadata.name;

    if (this.plugins.has(name)) {
      throw new DuplicatePluginError(name);
    }

    this.plugins.set(name, plugin);

    // Add to dependency graph
    const dependencies = [
      ...(plugin.metadata.dependencies || []),
      ...(plugin.metadata.optionalDependencies || []).filter((dep) => this.plugins.has(dep)),
    ];

    this.dependencyGraph.addNode(name, dependencies);
  }

  /**
   * Gets a plugin by name.
   *
   * @param name - The plugin name
   * @returns The plugin if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const plugin = registry.get('database');
   * ```
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Checks if a plugin is registered.
   *
   * @param name - The plugin name
   * @returns true if the plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Gets all registered plugin names.
   *
   * @returns Array of plugin names
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Gets all registered plugins.
   *
   * @returns Array of plugins (order not guaranteed)
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Gets plugins in topological order (dependency order).
   *
   * Plugins are returned in the order they should be initialized.
   *
   * @returns Array of plugins in dependency order
   * @throws {CircularDependencyError} If circular dependencies exist
   * @throws {MissingDependencyError} If a dependency is not found
   *
   * @example
   * ```typescript
   * const plugins = registry.getPluginsInOrder();
   * for (const plugin of plugins) {
   *   await plugin.initialize(context);
   * }
   * ```
   */
  getPluginsInOrder(): Plugin[] {
    const sortedNames = this.dependencyGraph.topologicalSort();
    return sortedNames.map((name) => this.plugins.get(name)!);
  }

  /**
   * Gets plugins in reverse topological order.
   *
   * Useful for shutdown (shutdown in reverse initialization order).
   *
   * @returns Array of plugins in reverse dependency order
   */
  getPluginsInReverseOrder(): Plugin[] {
    const sortedNames = this.dependencyGraph.reverseTopologicalSort();
    return sortedNames.map((name) => this.plugins.get(name)!);
  }

  /**
   * Gets the number of registered plugins.
   *
   * @returns The plugin count
   */
  get size(): number {
    return this.plugins.size;
  }

  /**
   * Clears all plugins from the registry.
   */
  clear(): void {
    this.plugins.clear();
    this.dependencyGraph.clear();
  }
}
