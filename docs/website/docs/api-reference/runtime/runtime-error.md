# Runtime Errors

Error classes for runtime-related failures in the Stratix plugin system.

## Overview

The runtime package provides specialized error classes for different failure scenarios during plugin lifecycle and dependency management.

## Error Hierarchy

```
Error
  └── RuntimeError (base class)
      ├── CircularDependencyError
      ├── MissingDependencyError
      ├── DuplicatePluginError
      └── PluginLifecycleError
```

## RuntimeError

Base error class for all runtime-related errors.

```typescript
class RuntimeError extends Error {
  constructor(
    public readonly code: string,
    message: string
  );
}
```

### Properties

- `code` - Error code identifier
- `message` - Error message
- `name` - Error name (always 'RuntimeError')

### Example

```typescript
throw new RuntimeError('CUSTOM_ERROR', 'Something went wrong');
```

## CircularDependencyError

Thrown when a circular dependency is detected in the plugin dependency graph.

```typescript
class CircularDependencyError extends RuntimeError
```

### Constructor

```typescript
constructor(cycle: string[])
```

**Parameters:**
- `cycle` - Array of plugin names forming the circular dependency

### Properties

- `code` - Always `'CIRCULAR_DEPENDENCY'`
- `name` - Always `'CircularDependencyError'`

### Example

```typescript
// Detected: A -> B -> C -> A
throw new CircularDependencyError(['A', 'B', 'C', 'A']);
// Message: "Circular dependency detected: A -> B -> C -> A"
```

### When It Occurs

```typescript
const app = await ApplicationBuilder.create()
  .usePlugin(pluginA) // depends on: [pluginB]
  .usePlugin(pluginB) // depends on: [pluginC]
  .usePlugin(pluginC) // depends on: [pluginA] ❌ circular!
  .build(); // Throws CircularDependencyError
```

## MissingDependencyError

Thrown when a plugin declares a dependency on a plugin that is not registered.

```typescript
class MissingDependencyError extends RuntimeError
```

### Constructor

```typescript
constructor(pluginName: string, dependencyName: string)
```

**Parameters:**
- `pluginName` - Name of the plugin missing its dependency
- `dependencyName` - Name of the missing dependency

### Properties

- `code` - Always `'MISSING_DEPENDENCY'`
- `name` - Always `'MissingDependencyError'`

### Example

```typescript
throw new MissingDependencyError('api-plugin', 'database-plugin');
// Message: "Plugin 'api-plugin' depends on 'database-plugin' which is not registered"
```

### When It Occurs

```typescript
class ApiPlugin implements Plugin {
  metadata = {
    name: 'api',
    dependencies: ['database'], // database plugin not registered
  };
}

const app = await ApplicationBuilder.create()
  .usePlugin(new ApiPlugin())
  .build(); // Throws MissingDependencyError
```

## DuplicatePluginError

Thrown when attempting to register a plugin with a name that already exists.

```typescript
class DuplicatePluginError extends RuntimeError
```

### Constructor

```typescript
constructor(pluginName: string)
```

**Parameters:**
- `pluginName` - Name of the duplicate plugin

### Properties

- `code` - Always `'DUPLICATE_PLUGIN'`
- `name` - Always `'DuplicatePluginError'`

### Example

```typescript
throw new DuplicatePluginError('database');
// Message: "Plugin 'database' is already registered"
```

### When It Occurs

```typescript
const plugin1 = new DatabasePlugin(); // name: 'database'
const plugin2 = new DatabasePlugin(); // name: 'database'

const app = await ApplicationBuilder.create()
  .usePlugin(plugin1)
  .usePlugin(plugin2) // Throws DuplicatePluginError
  .build();
```

## PluginLifecycleError

Thrown when a plugin fails during a lifecycle phase (initialize, start, stop).

```typescript
class PluginLifecycleError extends RuntimeError
```

### Constructor

```typescript
constructor(pluginName: string, phase: string, cause: Error)
```

**Parameters:**
- `pluginName` - Name of the plugin that failed
- `phase` - Lifecycle phase where failure occurred ('initialize', 'start', 'stop')
- `cause` - The original error that caused the failure

### Properties

- `code` - Always `'PLUGIN_LIFECYCLE_ERROR'`
- `name` - Always `'PluginLifecycleError'`
- `cause` - The original error

### Example

```typescript
const originalError = new Error('Connection timeout');
throw new PluginLifecycleError('database', 'start', originalError);
// Message: "Plugin 'database' failed during start: Connection timeout"
```

### When It Occurs

```typescript
class DatabasePlugin implements Plugin {
  async start(): Promise<void> {
    throw new Error('Connection failed'); // Original error
  }
}

const app = await ApplicationBuilder.create()
  .usePlugin(new DatabasePlugin())
  .build();

await app.start(); // Throws PluginLifecycleError
```

## Error Handling

### Catching Specific Errors

```typescript
try {
  const app = await ApplicationBuilder.create()
    .usePlugin(new ApiPlugin())
    .usePlugin(new DatabasePlugin())
    .build();
  
  await app.start();
} catch (error) {
  if (error instanceof CircularDependencyError) {
    console.error('Fix circular dependencies in plugins');
  } else if (error instanceof MissingDependencyError) {
    console.error('Register missing plugin:', error.message);
  } else if (error instanceof DuplicatePluginError) {
    console.error('Plugin already registered:', error.message);
  } else if (error instanceof PluginLifecycleError) {
    console.error('Plugin failed to start:', error.cause);
  }
}
```

### Error Codes

All runtime errors have a `code` property for programmatic handling:

```typescript
try {
  await app.build();
} catch (error) {
  if (error instanceof RuntimeError) {
    switch (error.code) {
      case 'CIRCULAR_DEPENDENCY':
        // Handle circular dependency
        break;
      case 'MISSING_DEPENDENCY':
        // Handle missing dependency
        break;
      case 'DUPLICATE_PLUGIN':
        // Handle duplicate plugin
        break;
      case 'PLUGIN_LIFECYCLE_ERROR':
        // Handle lifecycle error
        break;
    }
  }
}
```

### Accessing Original Error

`PluginLifecycleError` preserves the original error:

```typescript
try {
  await app.start();
} catch (error) {
  if (error instanceof PluginLifecycleError) {
    console.error('Plugin:', error.message);
    console.error('Original error:', error.cause);
    console.error('Stack trace:', error.cause?.stack);
  }
}
```

## Common Scenarios

### Circular Dependency Resolution

```typescript
// Before (circular):
// A -> B -> C -> A

// After (fixed):
// A -> B
// C (no dependencies)

const app = await ApplicationBuilder.create()
  .usePlugin(pluginB)  // No dependencies
  .usePlugin(pluginA)  // Depends on: [pluginB]
  .usePlugin(pluginC)  // No dependencies
  .build(); // Success
```

### Missing Dependency Resolution

```typescript
// Before (missing dependency):
const app = await ApplicationBuilder.create()
  .usePlugin(new ApiPlugin()) // depends on: ['database']
  .build(); // Throws MissingDependencyError

// After (dependency added):
const app = await ApplicationBuilder.create()
  .usePlugin(new DatabasePlugin()) // name: 'database'
  .usePlugin(new ApiPlugin())      // depends on: ['database']
  .build(); // Success
```

### Duplicate Plugin Resolution

```typescript
// Before (duplicate):
const app = await ApplicationBuilder.create()
  .usePlugin(new DatabasePlugin()) // name: 'database'
  .usePlugin(new DatabasePlugin()) // name: 'database'
  .build(); // Throws DuplicatePluginError

// After (unique names):
const app = await ApplicationBuilder.create()
  .usePlugin(new PostgresPlugin())  // name: 'postgres'
  .usePlugin(new MongoDBPlugin())   // name: 'mongodb'
  .build(); // Success
```

### Lifecycle Error Recovery

```typescript
class RobustPlugin implements Plugin {
  async start(): Promise<void> {
    try {
      await this.connect();
    } catch (error) {
      // Log error but don't throw
      this.logger.error('Connection failed, will retry', error);
      // Implement retry logic
      await this.retryConnect();
    }
  }
}
```

## Best Practices

### 1. Validate Dependencies Early

```typescript
class MyPlugin implements Plugin {
  metadata = {
    name: 'my-plugin',
    dependencies: ['logger', 'database'],
  };

  async initialize(context: PluginContext): Promise<void> {
    // Validate dependencies exist
    const logger = context.getService<Logger>('logger');
    const database = context.getService<Database>('database');
    
    if (!logger || !database) {
      throw new Error('Required dependencies not available');
    }
  }
}
```

### 2. Provide Helpful Error Messages

```typescript
class ApiPlugin implements Plugin {
  async start(): Promise<void> {
    try {
      await this.startServer();
    } catch (error) {
      throw new Error(
        `Failed to start API server on port ${this.port}: ${error.message}`
      );
    }
  }
}
```

### 3. Use Optional Dependencies

```typescript
class CachePlugin implements Plugin {
  metadata = {
    name: 'cache',
    optionalDependencies: ['redis'], // Won't throw if missing
  };

  async initialize(context: PluginContext): Promise<void> {
    const redis = context.getService<Redis>('redis');
    if (redis) {
      this.useRedis(redis);
    } else {
      this.useInMemory();
    }
  }
}
```

## See Also

- [ApplicationBuilder](./application-builder.md)
- [LifecycleManager](./lifecycle-manager.md)
- [DependencyGraph](./dependency-graph.md)
- [PluginRegistry](./plugin-registry.md)
- [Plugin System](../../abstractions/plugin.md)
