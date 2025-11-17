# PluginRegistry

Registry for managing plugins and their dependencies.

## Overview

`PluginRegistry` maintains the plugin dependency graph and provides plugins in correct initialization order. It ensures plugins are registered uniquely and validates their dependencies.

## Class Definition

```typescript
class PluginRegistry {
  register(plugin: Plugin): void;
  get(name: string): Plugin | undefined;
  has(name: string): boolean;
  getPluginNames(): string[];
  getAll(): Plugin[];
  getPluginsInOrder(): Plugin[];
  getPluginsInReverseOrder(): Plugin[];
  get size(): number;
  clear(): void;
}
```

## Methods

### register()

```typescript
register(plugin: Plugin): void
```

Registers a plugin in the registry.

**Parameters:**
- `plugin` - The plugin to register

**Throws:**
- `DuplicatePluginError` - If a plugin with the same name already exists

**Example:**
```typescript
const registry = new PluginRegistry();

registry.register(new DatabasePlugin());
registry.register(new ApiPlugin());
registry.register(new CachePlugin());
```

### get()

```typescript
get(name: string): Plugin | undefined
```

Gets a plugin by name.

**Parameters:**
- `name` - The plugin name

**Returns:** The plugin if found, `undefined` otherwise

**Example:**
```typescript
const plugin = registry.get('database');
if (plugin) {
  console.log(`Found plugin: ${plugin.metadata.name}`);
}
```

### has()

```typescript
has(name: string): boolean
```

Checks if a plugin is registered.

**Parameters:**
- `name` - The plugin name

**Returns:** `true` if the plugin exists, `false` otherwise

**Example:**
```typescript
if (registry.has('database')) {
  console.log('Database plugin is registered');
}
```

### getPluginNames()

```typescript
getPluginNames(): string[]
```

Gets all registered plugin names.

**Returns:** Array of plugin names

**Example:**
```typescript
const names = registry.getPluginNames();
console.log('Registered plugins:', names);
// Output: ['logger', 'database', 'api']
```

### getAll()

```typescript
getAll(): Plugin[]
```

Gets all registered plugins.

**Returns:** Array of plugins (order not guaranteed)

**Example:**
```typescript
const plugins = registry.getAll();
console.log(`Total plugins: ${plugins.length}`);
```

### getPluginsInOrder()

```typescript
getPluginsInOrder(): Plugin[]
```

Gets plugins in topological order (dependency order).

Plugins are returned in the order they should be initialized based on their dependencies.

**Returns:** Array of plugins in dependency order

**Throws:**
- `CircularDependencyError` - If circular dependencies exist
- `MissingDependencyError` - If a dependency is not found

**Example:**
```typescript
const plugins = registry.getPluginsInOrder();
for (const plugin of plugins) {
  await plugin.initialize(context);
}
```

### getPluginsInReverseOrder()

```typescript
getPluginsInReverseOrder(): Plugin[]
```

Gets plugins in reverse topological order.

Useful for shutdown to stop plugins in reverse initialization order.

**Returns:** Array of plugins in reverse dependency order

**Example:**
```typescript
const plugins = registry.getPluginsInReverseOrder();
for (const plugin of plugins) {
  await plugin.stop();
}
```

### size

```typescript
get size(): number
```

Gets the number of registered plugins.

**Returns:** The plugin count

**Example:**
```typescript
console.log(`${registry.size} plugins registered`);
```

### clear()

```typescript
clear(): void
```

Removes all plugins from the registry.

**Example:**
```typescript
registry.clear();
console.log(`Plugins after clear: ${registry.size}`); // 0
```

## Usage Examples

### Basic Registration

```typescript
import { PluginRegistry } from '@stratix/runtime';

const registry = new PluginRegistry();

// Register plugins
registry.register(loggerPlugin);
registry.register(databasePlugin);
registry.register(apiPlugin);

console.log(`Registered ${registry.size} plugins`);
```

### Dependency Order

```typescript
// Define plugins with dependencies
class LoggerPlugin implements Plugin {
  metadata = {
    name: 'logger',
    version: '1.0.0',
  };
}

class DatabasePlugin implements Plugin {
  metadata = {
    name: 'database',
    version: '1.0.0',
    dependencies: ['logger'],
  };
}

class ApiPlugin implements Plugin {
  metadata = {
    name: 'api',
    version: '1.0.0',
    dependencies: ['logger', 'database'],
  };
}

// Register in any order
registry.register(new ApiPlugin());
registry.register(new DatabasePlugin());
registry.register(new LoggerPlugin());

// Get in correct order
const plugins = registry.getPluginsInOrder();
// Result: [LoggerPlugin, DatabasePlugin, ApiPlugin]
```

### Plugin Lookup

```typescript
// Check if plugin exists
if (registry.has('database')) {
  const plugin = registry.get('database');
  console.log(`Database plugin version: ${plugin.metadata.version}`);
}

// Get all plugin names
const names = registry.getPluginNames();
console.log('Available plugins:', names.join(', '));
```

### Initialization and Shutdown

```typescript
const context = createPluginContext();

// Initialize in dependency order
const plugins = registry.getPluginsInOrder();
for (const plugin of plugins) {
  console.log(`Initializing ${plugin.metadata.name}`);
  await plugin.initialize(context);
}

// Start all plugins
for (const plugin of plugins) {
  console.log(`Starting ${plugin.metadata.name}`);
  await plugin.start();
}

// Shutdown in reverse order
const reversePlugins = registry.getPluginsInReverseOrder();
for (const plugin of reversePlugins) {
  console.log(`Stopping ${plugin.metadata.name}`);
  await plugin.stop();
}
```

### Error Handling

```typescript
try {
  registry.register(new ApiPlugin());
  registry.register(new DatabasePlugin());
  
  const plugins = registry.getPluginsInOrder();
} catch (error) {
  if (error instanceof DuplicatePluginError) {
    console.error('Plugin already registered');
  } else if (error instanceof CircularDependencyError) {
    console.error('Circular dependencies detected');
  } else if (error instanceof MissingDependencyError) {
    console.error('Missing required dependency');
  }
}
```

## Advanced Usage

### Optional Dependencies

Plugins can declare optional dependencies that don't cause errors if missing:

```typescript
class CachePlugin implements Plugin {
  metadata = {
    name: 'cache',
    version: '1.0.0',
    dependencies: ['logger'],           // Required
    optionalDependencies: ['redis'],    // Optional
  };
}

registry.register(new LoggerPlugin());
registry.register(new CachePlugin());
// No error even though 'redis' is not registered

const plugins = registry.getPluginsInOrder();
// Result: [LoggerPlugin, CachePlugin]
```

### Plugin Inspection

```typescript
const plugins = registry.getAll();

for (const plugin of plugins) {
  console.log(`Plugin: ${plugin.metadata.name}`);
  console.log(`  Version: ${plugin.metadata.version}`);
  console.log(`  Dependencies: ${plugin.metadata.dependencies?.join(', ') || 'none'}`);
}
```

### Dynamic Plugin Management

```typescript
class PluginManager {
  private registry = new PluginRegistry();

  async loadPlugin(plugin: Plugin): Promise<void> {
    // Check if already loaded
    if (this.registry.has(plugin.metadata.name)) {
      throw new Error(`Plugin ${plugin.metadata.name} already loaded`);
    }

    // Register plugin
    this.registry.register(plugin);

    // Initialize immediately if app is running
    if (this.isRunning) {
      await plugin.initialize(this.context);
      await plugin.start();
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.registry.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    // Stop plugin
    await plugin.stop();

    // Remove from registry
    // Note: PluginRegistry doesn't have remove(), 
    // would need to implement or use clear() and re-register
  }
}
```

## Dependency Graph

The registry uses `DependencyGraph` internally to:

1. Detect circular dependencies
2. Validate all dependencies exist
3. Calculate topological sort order

```typescript
// Example dependency graph:
// logger (no deps)
// database (deps: logger)
// cache (deps: logger)
// api (deps: logger, database, cache)

registry.register(loggerPlugin);
registry.register(databasePlugin);
registry.register(cachePlugin);
registry.register(apiPlugin);

const order = registry.getPluginsInOrder();
// Possible result: [logger, database, cache, api]
// or: [logger, cache, database, api]
// Both are valid as database and cache don't depend on each other
```

## Best Practices

### 1. Register Plugins Early

Register all plugins before getting them in order:

```typescript
// Good
registry.register(pluginA);
registry.register(pluginB);
registry.register(pluginC);
const plugins = registry.getPluginsInOrder();

// Avoid (partial registration)
registry.register(pluginA);
const partial = registry.getPluginsInOrder(); // Incomplete
registry.register(pluginB);
```

### 2. Use Unique Plugin Names

Ensure each plugin has a unique name:

```typescript
class PostgresPlugin implements Plugin {
  metadata = { name: 'postgres', version: '1.0.0' };
}

class MongoDBPlugin implements Plugin {
  metadata = { name: 'mongodb', version: '1.0.0' };
}

// Not: both named 'database'
```

### 3. Validate Dependencies

Check that required dependencies are registered:

```typescript
const requiredPlugins = ['logger', 'database'];

for (const name of requiredPlugins) {
  if (!registry.has(name)) {
    throw new Error(`Required plugin '${name}' not registered`);
  }
}
```

### 4. Use Reverse Order for Shutdown

Always shutdown in reverse initialization order:

```typescript
// Initialization
const plugins = registry.getPluginsInOrder();
for (const plugin of plugins) {
  await plugin.start();
}

// Shutdown
const reversePlugins = registry.getPluginsInReverseOrder();
for (const plugin of reversePlugins) {
  await plugin.stop();
}
```

## Type Safety

The registry maintains type safety through TypeScript:

```typescript
const plugin: Plugin = registry.get('database')!;

// Plugin has all Plugin methods
await plugin.initialize(context);
await plugin.start();
await plugin.stop();
await plugin.healthCheck();
```

## Performance Considerations

- `getPluginsInOrder()` performs topological sort each time it's called
- Cache the result if calling multiple times:

```typescript
// Cache the sorted plugins
const orderedPlugins = registry.getPluginsInOrder();

// Use cached result
for (const plugin of orderedPlugins) {
  await plugin.initialize(context);
}

for (const plugin of orderedPlugins) {
  await plugin.start();
}
```

## See Also

- [DependencyGraph](./dependency-graph.md)
- [LifecycleManager](./lifecycle-manager.md)
- [RuntimeError](./runtime-error.md)
- [Plugin System](../../abstractions/plugin.md)
- [ApplicationBuilder](./application-builder.md)
