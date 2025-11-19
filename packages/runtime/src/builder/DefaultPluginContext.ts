import type { Container, Logger, PluginContext } from '@stratix/core';

/**
 * Default implementation of PluginContext.
 */
export class DefaultPluginContext implements PluginContext {
  private currentPluginName?: string;

  constructor(
    public readonly container: Container,
    public readonly logger: Logger,
    private readonly config: Map<string, unknown>
  ) {}

  /**
   * Sets the current plugin name (used internally by LifecycleManager).
   * @internal
   */
  setCurrentPluginName(name: string): void {
    this.currentPluginName = name;
  }

  getConfig<T = Record<string, unknown>>(): T {
    const pluginName = this.currentPluginName || 'unknown';
    return (this.config.get(pluginName) as T) || ({} as T);
  }

  getService<T>(name: string): T | undefined {
    try {
      return this.container.has(name) ? this.container.resolve<T>(name) : undefined;
    } catch {
      return undefined;
    }
  }
}
