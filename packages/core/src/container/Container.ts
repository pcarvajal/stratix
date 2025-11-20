import { Token } from './Token.js';
import { Factory } from './Factory.js';
import { RegisterOptions } from './RegisterOptions.js';

/**
 * Dependency injection container interface.
 *
 * Manages service registration, resolution, and lifecycle.
 *
 * @example
 * ```typescript
 * // Register services
 * container.register('logger', () => new ConsoleLogger(), {
 *   lifetime: ServiceLifetime.SINGLETON
 * });
 *
 * container.register('userService', (context) => {
 *   const logger = context.resolve<Logger>('logger');
 *   return new UserService(logger);
 * });
 *
 * // Resolve services
 * const userService = container.resolve<UserService>('userService');
 *
 * // Create scopes
 * const scope = container.createScope();
 * const scopedService = scope.resolve<ScopedService>('scopedService');
 * ```
 */
export interface Container {
  /**
   * Registers a service in the container.
   *
   * @template T - The type of service to register
   * @param token - The token identifying the service
   * @param factory - Factory function that creates the service
   * @param options - Registration options (lifetime, etc.)
   *
   * @example
   * ```typescript
   * container.register('database', () => new PostgresDatabase(), {
   *   lifetime: ServiceLifetime.SINGLETON
   * });
   * ```
   */
  register<T>(token: Token<T>, factory: Factory<T>, options?: RegisterOptions): void;

  /**
   * Resolves a service from the container.
   *
   * @template T - The type of service to resolve
   * @param token - The token identifying the service
   * @returns The resolved service instance
   * @throws Error if the service is not registered
   *
   * @example
   * ```typescript
   * const logger = container.resolve<Logger>('logger');
   * const userService = container.resolve(UserService);
   * ```
   */
  resolve<T>(token: Token<T>): T;

  /**
   * Checks if a service is registered in the container.
   *
   * @template T - The type of service to check
   * @param token - The token identifying the service
   * @returns true if the service is registered, false otherwise
   *
   * @example
   * ```typescript
   * if (container.has('logger')) {
   *   const logger = container.resolve<Logger>('logger');
   * }
   * ```
   */
  has<T>(token: Token<T>): boolean;

  /**
   * Creates a new scope for scoped services.
   *
   * Scoped services will have the same instance within a scope,
   * but different instances across different scopes.
   *
   * @returns A new container scope
   *
   * @example
   * ```typescript
   * const scope1 = container.createScope();
   * const scope2 = container.createScope();
   *
   * const service1 = scope1.resolve<ScopedService>('scopedService');
   * const service2 = scope2.resolve<ScopedService>('scopedService');
   * // service1 !== service2 (different scopes)
   * ```
   */
  createScope(): Container;

  /**
   * Disposes the container and all disposable services.
   *
   * Services implementing IDisposable will have their dispose() method called.
   *
   * @example
   * ```typescript
   * await container.dispose();
   * ```
   */
  dispose(): Promise<void>;

  // ========================================
  // CONVENIENCE API
  // ========================================

  /**
   * Registers a singleton value or factory.
   *
   * Singletons are created once and reused for all resolutions.
   *
   * @template T - The type of service to register
   * @param token - The token identifying the service
   * @param value - The value or factory function
   *
   * @example
   * ```typescript
   * // Register a value
   * container.singleton('config', { port: 3000 });
   *
   * // Register a factory
   * container.singleton('logger', () => new Logger());
   * ```
   */
  singleton<T>(token: Token<T>, value: T | (() => T)): void;

  /**
   * Registers a scoped factory.
   *
   * Scoped services are created once per scope and reused within that scope.
   *
   * @template T - The type of service to register
   * @param token - The token identifying the service
   * @param factory - Factory function that creates the service
   *
   * @example
   * ```typescript
   * container.scoped('requestContext', () => new RequestContext());
   * ```
   */
  scoped<T>(token: Token<T>, factory: () => T): void;

  /**
   * Registers a transient factory.
   *
   * Transient services are created every time they are resolved.
   *
   * @template T - The type of service to register
   * @param token - The token identifying the service
   * @param factory - Factory function that creates the service
   *
   * @example
   * ```typescript
   * container.transient('requestId', () => uuid());
   * ```
   */
  transient<T>(token: Token<T>, factory: () => T): void;

  /**
   * Registers a class as a singleton with auto-wiring.
   *
   * Dependencies are automatically resolved based on constructor parameter names.
   *
   * @template T - The type of service to register
   * @param classType - The class constructor
   * @param options - Registration options
   *
   * @example
   * ```typescript
   * // Auto-wiring based on parameter names
   * class UserService {
   *   constructor(
   *     private userRepository: UserRepository,
   *     private eventBus: EventBus
   *   ) {}
   * }
   *
   * container.registerClass(UserService);
   * // or with custom token
   * container.registerClass(UserService, { token: 'userService' });
   * ```
   */
  registerClass<T>(
    classType: new (...args: any[]) => T,
    options?: {
      token?: Token<T>;
      lifetime?: RegisterOptions['lifetime'];
    }
  ): void;

  /**
   * Registers multiple services at once.
   *
   * @param services - Object mapping tokens to values, factories, or classes
   *
   * @example
   * ```typescript
   * container.registerAll({
   *   config: appConfig,
   *   logger: () => new Logger(),
   *   database: () => new Database()
   * });
   * ```
   */
  registerAll(services: Record<string, any | (() => any)>): void;

  /**
   * Tries to resolve a service, returns undefined if not found.
   *
   * @template T - The type of service to resolve
   * @param token - The token identifying the service
   * @returns The resolved service instance or undefined
   *
   * @example
   * ```typescript
   * const logger = container.tryResolve<Logger>('logger');
   * if (logger) {
   *   logger.info('Service found');
   * }
   * ```
   */
  tryResolve<T>(token: Token<T>): T | undefined;
}

