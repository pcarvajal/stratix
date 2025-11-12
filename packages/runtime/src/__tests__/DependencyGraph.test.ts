import { describe, it, expect } from 'vitest';
import { DependencyGraph } from '../graph/DependencyGraph.js';
import { CircularDependencyError, MissingDependencyError } from '../errors/RuntimeError.js';

describe('DependencyGraph', () => {
  describe('addNode', () => {
    it('should add a node with no dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('logger', []);

      const sorted = graph.topologicalSort();
      expect(sorted).toEqual(['logger']);
    });

    it('should add multiple nodes with dependencies', () => {
      const graph = new DependencyGraph();
      graph.addNode('logger', []);
      graph.addNode('database', ['logger']);
      graph.addNode('api', ['database', 'logger']);

      const sorted = graph.topologicalSort();
      expect(sorted).toEqual(['logger', 'database', 'api']);
    });

    it('should allow adding nodes in any order', () => {
      const graph = new DependencyGraph();
      graph.addNode('api', ['database', 'logger']);
      graph.addNode('database', ['logger']);
      graph.addNode('logger', []);

      const sorted = graph.topologicalSort();
      expect(sorted).toEqual(['logger', 'database', 'api']);
    });
  });

  describe('topologicalSort', () => {
    it('should return empty array for empty graph', () => {
      const graph = new DependencyGraph();
      expect(graph.topologicalSort()).toEqual([]);
    });

    it('should sort simple dependency chain', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', []);
      graph.addNode('b', ['a']);
      graph.addNode('c', ['b']);

      expect(graph.topologicalSort()).toEqual(['a', 'b', 'c']);
    });

    it('should sort diamond dependency pattern', () => {
      const graph = new DependencyGraph();
      graph.addNode('base', []);
      graph.addNode('left', ['base']);
      graph.addNode('right', ['base']);
      graph.addNode('top', ['left', 'right']);

      const sorted = graph.topologicalSort();
      expect(sorted[0]).toBe('base');
      expect(sorted[3]).toBe('top');
      expect(sorted.slice(1, 3).sort()).toEqual(['left', 'right']);
    });

    it('should sort complex dependency graph', () => {
      const graph = new DependencyGraph();
      graph.addNode('logger', []);
      graph.addNode('config', []);
      graph.addNode('database', ['logger', 'config']);
      graph.addNode('cache', ['logger']);
      graph.addNode('api', ['database', 'cache']);
      graph.addNode('metrics', ['logger']);

      const sorted = graph.topologicalSort();

      // Verify order constraints
      expect(sorted.indexOf('logger')).toBeLessThan(sorted.indexOf('database'));
      expect(sorted.indexOf('config')).toBeLessThan(sorted.indexOf('database'));
      expect(sorted.indexOf('logger')).toBeLessThan(sorted.indexOf('cache'));
      expect(sorted.indexOf('database')).toBeLessThan(sorted.indexOf('api'));
      expect(sorted.indexOf('cache')).toBeLessThan(sorted.indexOf('api'));
    });

    it('should throw CircularDependencyError for simple cycle', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', ['b']);
      graph.addNode('b', ['a']);

      expect(() => graph.topologicalSort()).toThrow('Circular dependency detected');
    });

    it('should throw CircularDependencyError for complex cycle', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', ['b']);
      graph.addNode('b', ['c']);
      graph.addNode('c', ['d']);
      graph.addNode('d', ['b']); // Cycle: b -> c -> d -> b

      expect(() => graph.topologicalSort()).toThrow('Circular dependency detected');
    });

    it('should throw CircularDependencyError for self-dependency', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', ['a']);

      expect(() => graph.topologicalSort()).toThrow('Circular dependency detected');
    });

    it('should include cycle path in error message', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', ['b']);
      graph.addNode('b', ['c']);
      graph.addNode('c', ['a']);

      expect(() => graph.topologicalSort()).toThrow(/a -> b -> c -> a/);
    });

    it('should throw MissingDependencyError for missing dependency', () => {
      const graph = new DependencyGraph();
      graph.addNode('database', ['logger']);

      expect(() => graph.topologicalSort()).toThrow('depends on');
    });

    it('should include missing dependency in error message', () => {
      const graph = new DependencyGraph();
      graph.addNode('api', ['database', 'cache']);

      expect(() => graph.topologicalSort()).toThrow(/database|cache/);
    });
  });

  describe('reverseTopologicalSort', () => {
    it('should return empty array for empty graph', () => {
      const graph = new DependencyGraph();
      expect(graph.reverseTopologicalSort()).toEqual([]);
    });

    it('should return reverse order', () => {
      const graph = new DependencyGraph();
      graph.addNode('logger', []);
      graph.addNode('database', ['logger']);
      graph.addNode('api', ['database']);

      expect(graph.reverseTopologicalSort()).toEqual(['api', 'database', 'logger']);
    });

    it('should throw same errors as topologicalSort', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', ['b']);
      graph.addNode('b', ['a']);

      expect(() => graph.reverseTopologicalSort()).toThrow('Circular dependency detected');
    });
  });

  describe('edge cases', () => {
    it('should handle nodes with same name correctly', () => {
      const graph = new DependencyGraph();
      graph.addNode('logger', []);
      graph.addNode('logger', []); // Overwrite

      expect(graph.topologicalSort()).toEqual(['logger']);
    });

    it('should handle empty dependencies array', () => {
      const graph = new DependencyGraph();
      graph.addNode('a', []);
      graph.addNode('b', []);

      const sorted = graph.topologicalSort();
      expect(sorted.length).toBe(2);
      expect(sorted).toContain('a');
      expect(sorted).toContain('b');
    });

    it('should handle large graph efficiently', () => {
      const graph = new DependencyGraph();

      // Create chain of 100 nodes
      for (let i = 0; i < 100; i++) {
        const deps = i === 0 ? [] : [`node-${i - 1}`];
        graph.addNode(`node-${i}`, deps);
      }

      const sorted = graph.topologicalSort();
      expect(sorted.length).toBe(100);
      expect(sorted[0]).toBe('node-0');
      expect(sorted[99]).toBe('node-99');
    });
  });
});
