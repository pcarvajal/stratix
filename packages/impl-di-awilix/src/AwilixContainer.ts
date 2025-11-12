import type { Container, Token, Factory, RegisterOptions } from '@stratix/abstractions';
import { ServiceLifetime } from '@stratix/abstractions';
import * as awilix from 'awilix';

/**
 * Awilix-based dependency injection container implementation.
 *
 * Provides a full-featured DI container with support for:
 * - Singleton, scoped, and transient lifetimes
 * - Factory functions
 * - Scoped containers
 * - Automatic disposal
 *
 * @example
 * ```typescript
 * const container = new AwilixContainer();
 *
 * // Register a singleton service
 * container.register('logger', () => new ConsoleLogger(), {
 *   lifetime: ServiceLifetime.SINGLETON
 * });
 *
 * // Register a transient service
 * container.register('requestId', () => crypto.randomUUID(), {
 *   lifetime: ServiceLifetime.TRANSIENT
 * });
 *
 * // Resolve services
 * const logger = container.resolve<Logger>('logger');
 * ```
 */
export class AwilixContainer implements Container {
  private readonly container: awilix.AwilixContainer;
  private readonly tokenMap = new Map<Token<unknown>, string>();
  private tokenCounter = 0;

  constructor(awilixContainer?: awilix.AwilixContainer) {
    this.container = awilixContainer ?? awilix.createContainer();
  }

  /**
   * Registers a service in the container.
   *
   * @template T - The service type
   * @param token - The service token (string, symbol, or class)
   * @param factory - Factory function to create the service
   * @param options - Registration options (lifetime)
   *
   * @example
   * ```typescript
   * container.register('database', (c) => new Database(c.resolve('config')), {
   *   lifetime: ServiceLifetime.SINGLETON
   * });
   * ```
   */
  register<T>(token: Token<T>, factory: Factory<T>, options?: RegisterOptions): void {
    const name = this.getTokenName(token);
    const lifetime = this.mapLifetime(options?.lifetime ?? ServiceLifetime.SINGLETON);

    // Wrap the factory to provide our Container interface
    const awilixFactory = () => factory(this);

    this.container.register({
      [name]: awilix.asFunction(awilixFactory, { lifetime }),
    });
  }

  /**
   * Resolves a service from the container.
   *
   * @template T - The service type
   * @param token - The service token
   * @returns The resolved service instance
   * @throws {Error} If the service is not registered
   *
   * @example
   * ```typescript
   * const logger = container.resolve<Logger>('logger');
   * ```
   */
  resolve<T>(token: Token<T>): T {
    const name = this.getTokenName(token);

    if (!this.container.hasRegistration(name)) {
      throw new Error(`Service '${String(token)}' is not registered in the container`);
    }

    return this.container.resolve<T>(name);
  }

  /**
   * Checks if a service is registered in the container.
   *
   * @template T - The service type
   * @param token - The service token
   * @returns True if the service is registered
   *
   * @example
   * ```typescript
   * if (container.has('logger')) {
   *   const logger = container.resolve<Logger>('logger');
   * }
   * ```
   */
  has<T>(token: Token<T>): boolean {
    const name = this.getTokenName(token);
    return this.container.hasRegistration(name);
  }

  /**
   * Creates a new scoped container.
   *
   * Services with SCOPED lifetime will be resolved per scope.
   *
   * @returns A new scoped container
   *
   * @example
   * ```typescript
   * const scope = container.createScope();
   * const requestId = scope.resolve<string>('requestId');
   * await scope.dispose();
   * ```
   */
  createScope(): Container {
    const scopedAwilixContainer = this.container.createScope();
    const scopedContainer = new AwilixContainer(scopedAwilixContainer);

    // Copy token mappings to the new scope
    this.tokenMap.forEach((value, key) => {
      scopedContainer.tokenMap.set(key, value);
    });
    scopedContainer.tokenCounter = this.tokenCounter;

    return scopedContainer;
  }

  /**
   * Disposes the container and all disposable services.
   *
   * Services that implement a dispose() method will be disposed automatically.
   *
   * @example
   * ```typescript
   * await container.dispose();
   * ```
   */
  async dispose(): Promise<void> {
    await this.container.dispose();
  }

  /**
   * Gets the internal Awilix container.
   *
   * Useful for advanced scenarios that require direct Awilix access.
   *
   * @returns The underlying Awilix container
   * @internal
   */
  getAwilixContainer(): awilix.AwilixContainer {
    return this.container;
  }

  /**
   * Converts a Token to a string name for Awilix.
   *
   * @param token - The token to convert
   * @returns A string name for Awilix
   * @private
   */
  private getTokenName<T>(token: Token<T>): string {
    // If it's already a string, use it directly
    if (typeof token === 'string') {
      return token;
    }

    // Check if we've seen this token before
    if (this.tokenMap.has(token)) {
      return this.tokenMap.get(token)!;
    }

    // Generate a unique name for symbols and classes
    let name: string;
    if (typeof token === 'symbol') {
      // Always use a unique counter for symbols to avoid collisions
      const desc = token.description || 'anonymous';
      name = `__symbol_${desc}_${this.tokenCounter++}`;
    } else {
      // It's a class constructor
      name = token.name || `__class_${this.tokenCounter++}`;
    }

    this.tokenMap.set(token, name);
    return name;
  }

  /**
   * Maps our ServiceLifetime enum to Awilix lifetime values.
   *
   * @param lifetime - Our ServiceLifetime enum value
   * @returns Awilix lifetime string
   * @private
   */
  private mapLifetime(lifetime: ServiceLifetime): awilix.LifetimeType {
    switch (lifetime) {
      case ServiceLifetime.SINGLETON:
        return awilix.Lifetime.SINGLETON;
      case ServiceLifetime.SCOPED:
        return awilix.Lifetime.SCOPED;
      case ServiceLifetime.TRANSIENT:
        return awilix.Lifetime.TRANSIENT;
      default:
        return awilix.Lifetime.SINGLETON;
    }
  }
}
