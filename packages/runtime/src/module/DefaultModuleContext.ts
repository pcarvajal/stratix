import type { Container, Logger, ModuleContext } from '@stratix/abstractions';

/**
 * Default implementation of ModuleContext.
 */
export class DefaultModuleContext implements ModuleContext {
  constructor(
    private readonly _container: Container,
    private readonly _logger: Logger,
    private readonly configs: Map<string, unknown>,
    private readonly moduleName: string
  ) {}

  get container(): Container {
    return this._container;
  }

  get logger(): Logger {
    return this._logger;
  }

  getConfig<T = unknown>(): T | undefined {
    return this.configs.get(this.moduleName) as T | undefined;
  }
}
