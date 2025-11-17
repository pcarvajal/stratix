---
id: dependency-graph
title: DependencyGraph
sidebar_label: DependencyGraph
---

# DependencyGraph

> **Package:** `@stratix/runtime`
> **Layer:** Layer 3 - Runtime
> **Since:** v0.1.0

## Overview

Topological sort for plugin dependencies. Ensures plugins initialize in correct order and detects circular dependencies.

## Type Signature

```typescript
class DependencyGraph {
  addNode(name: string, dependencies: string[]): void;
  has(name: string): boolean;
  getNodeNames(): string[];
  topologicalSort(): string[];
}
```

## Usage

```typescript
const graph = new DependencyGraph();

// Add nodes with dependencies
graph.addNode('logger', []);
graph.addNode('database', ['logger']);
graph.addNode('cache', ['logger']);
graph.addNode('api', ['database', 'cache']);

// Get initialization order
const order = graph.topologicalSort();
// ['logger', 'database', 'cache', 'api']

// Circular dependency throws error
graph.addNode('a', ['b']);
graph.addNode('b', ['c']);
graph.addNode('c', ['a']); // Circular!
graph.topologicalSort(); // Throws CircularDependencyError
```

## Error Detection

```typescript
try {
  const order = graph.topologicalSort();
} catch (error) {
  if (error instanceof CircularDependencyError) {
    console.error('Circular dependency:', error.cycle);
    // ['a', 'b', 'c', 'a']
  } else if (error instanceof MissingDependencyError) {
    console.error('Missing:', error.missing);
  }
}
```

## See Also

- [PluginRegistry](./plugin-registry.md)
- [Package README](../../../packages/runtime/README.md)
