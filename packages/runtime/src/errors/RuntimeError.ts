/**
 * Base error class for runtime-related errors.
 */
export class RuntimeError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'RuntimeError';
    Object.setPrototypeOf(this, RuntimeError.prototype);
  }
}

/**
 * Error thrown when a circular dependency is detected in plugins.
 */
export class CircularDependencyError extends RuntimeError {
  constructor(cycle: string[]) {
    super('CIRCULAR_DEPENDENCY', `Circular dependency detected: ${cycle.join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}

/**
 * Error thrown when a plugin dependency is not found.
 */
export class MissingDependencyError extends RuntimeError {
  constructor(pluginName: string, dependencyName: string) {
    super(
      'MISSING_DEPENDENCY',
      `Plugin '${pluginName}' depends on '${dependencyName}' which is not registered`
    );
    this.name = 'MissingDependencyError';
  }
}

/**
 * Error thrown when a plugin with the same name is registered twice.
 */
export class DuplicatePluginError extends RuntimeError {
  constructor(pluginName: string) {
    super('DUPLICATE_PLUGIN', `Plugin '${pluginName}' is already registered`);
    this.name = 'DuplicatePluginError';
  }
}

/**
 * Error thrown when plugin lifecycle fails.
 */
export class PluginLifecycleError extends RuntimeError {
  constructor(pluginName: string, phase: string, cause: Error) {
    super(
      'PLUGIN_LIFECYCLE_ERROR',
      `Plugin '${pluginName}' failed during ${phase}: ${cause.message}`
    );
    this.name = 'PluginLifecycleError';
    this.cause = cause;
  }
}
