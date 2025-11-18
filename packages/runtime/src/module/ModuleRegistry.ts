import type { ContextModule } from '@stratix/abstractions';
import { DependencyGraph } from '../graph/DependencyGraph.js';
import { DuplicatePluginError } from '../errors/RuntimeError.js';

/**
 * Registry for managing context modules and their dependencies.
 *
 * Maintains the dependency graph and provides modules in initialization order.
 *
 * @example
 * ```typescript
 * const registry = new ModuleRegistry();
 *
 * registry.register(productsModule);
 * registry.register(ordersModule);
 * registry.register(inventoryModule);
 *
 * const modules = registry.getModulesInOrder();
 * // Modules in dependency order
 * ```
 */
export class ModuleRegistry {
  private modules = new Map<string, ContextModule>();
  private dependencyGraph = new DependencyGraph();

  /**
   * Registers a context module.
   *
   * @param module - The module to register
   * @throws {DuplicatePluginError} If a module with the same name is already registered
   *
   * @example
   * ```typescript
   * registry.register(new ProductsModule());
   * ```
   */
  register(module: ContextModule): void {
    const name = module.metadata.name;

    if (this.modules.has(name)) {
      throw new DuplicatePluginError(name);
    }

    this.modules.set(name, module);

    const dependencies = [
      ...(module.metadata.requiredPlugins || []),
      ...(module.metadata.requiredModules || []),
    ];

    this.dependencyGraph.addNode(name, dependencies);
  }

  /**
   * Gets a module by name.
   *
   * @param name - The module name
   * @returns The module if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const module = registry.get('products-context');
   * ```
   */
  get(name: string): ContextModule | undefined {
    return this.modules.get(name);
  }

  /**
   * Checks if a module is registered.
   *
   * @param name - The module name
   * @returns true if the module is registered
   */
  has(name: string): boolean {
    return this.modules.has(name);
  }

  /**
   * Gets all registered module names.
   *
   * @returns Array of module names
   */
  getModuleNames(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Gets all registered modules.
   *
   * @returns Array of modules (order not guaranteed)
   */
  getAll(): ContextModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Gets modules in topological order (dependency order).
   *
   * Modules are returned in the order they should be initialized.
   * Plugins are initialized before modules that depend on them.
   *
   * @returns Array of modules in dependency order
   * @throws {CircularDependencyError} If circular dependencies exist
   * @throws {MissingDependencyError} If a dependency is not found
   *
   * @example
   * ```typescript
   * const modules = registry.getModulesInOrder();
   * for (const module of modules) {
   *   await module.initialize(context);
   * }
   * ```
   */
  getModulesInOrder(): ContextModule[] {
    const sortedNames = this.dependencyGraph.topologicalSort();
    return sortedNames.map((name) => this.modules.get(name)!).filter(Boolean);
  }

  /**
   * Gets modules in reverse topological order.
   *
   * Useful for shutdown (shutdown in reverse initialization order).
   *
   * @returns Array of modules in reverse dependency order
   */
  getModulesInReverseOrder(): ContextModule[] {
    const sortedNames = this.dependencyGraph.reverseTopologicalSort();
    return sortedNames.map((name) => this.modules.get(name)!).filter(Boolean);
  }

  /**
   * Gets the number of registered modules.
   *
   * @returns The module count
   */
  get size(): number {
    return this.modules.size;
  }

  /**
   * Clears all modules from the registry.
   */
  clear(): void {
    this.modules.clear();
    this.dependencyGraph.clear();
  }
}
