import { CircularDependencyError, MissingDependencyError } from '../errors/RuntimeError.js';

/**
 * Node in the dependency graph.
 */
interface GraphNode {
  name: string;
  dependencies: string[];
}

/**
 * Dependency graph for topological sorting of plugins.
 *
 * Ensures plugins are initialized in the correct order based on their dependencies.
 *
 * @example
 * ```typescript
 * const graph = new DependencyGraph();
 * graph.addNode('logger', []);
 * graph.addNode('database', ['logger']);
 * graph.addNode('api', ['database', 'logger']);
 *
 * const sorted = graph.topologicalSort();
 * // ['logger', 'database', 'api']
 * ```
 */
export class DependencyGraph {
  private nodes = new Map<string, GraphNode>();

  /**
   * Adds a node to the graph.
   *
   * @param name - The node name
   * @param dependencies - Names of nodes this node depends on
   *
   * @example
   * ```typescript
   * graph.addNode('database', ['logger']);
   * ```
   */
  addNode(name: string, dependencies: string[]): void {
    this.nodes.set(name, { name, dependencies });
  }

  /**
   * Checks if a node exists in the graph.
   *
   * @param name - The node name
   * @returns true if the node exists
   */
  has(name: string): boolean {
    return this.nodes.has(name);
  }

  /**
   * Gets all node names.
   *
   * @returns Array of node names
   */
  getNodeNames(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Performs topological sort on the graph.
   *
   * Returns nodes in dependency order (dependencies first).
   * Throws if circular dependencies are detected.
   *
   * @returns Array of node names in topological order
   * @throws {CircularDependencyError} If circular dependencies exist
   * @throws {MissingDependencyError} If a dependency is not found
   *
   * @example
   * ```typescript
   * const sorted = graph.topologicalSort();
   * // Plugins can be initialized in this order
   * ```
   */
  topologicalSort(): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const path: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        // Circular dependency detected
        const cycleStart = path.indexOf(name);
        const cycle = [...path.slice(cycleStart), name];
        throw new CircularDependencyError(cycle);
      }

      const node = this.nodes.get(name);
      if (!node) {
        throw new Error(`Node '${name}' not found in graph`);
      }

      visiting.add(name);
      path.push(name);

      // Visit dependencies first
      for (const dep of node.dependencies) {
        if (!this.nodes.has(dep)) {
          throw new MissingDependencyError(name, dep);
        }
        visit(dep);
      }

      visiting.delete(name);
      path.pop();
      visited.add(name);
      result.push(name);
    };

    // Visit all nodes
    for (const name of this.nodes.keys()) {
      visit(name);
    }

    return result;
  }

  /**
   * Gets the reverse topological order.
   *
   * Useful for shutdown (shutdown in reverse initialization order).
   *
   * @returns Array of node names in reverse topological order
   */
  reverseTopologicalSort(): string[] {
    return this.topologicalSort().reverse();
  }

  /**
   * Clears all nodes from the graph.
   */
  clear(): void {
    this.nodes.clear();
  }
}
