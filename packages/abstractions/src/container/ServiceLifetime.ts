/**
 * Defines the lifetime of a service in the container.
 *
 * @example
 * ```typescript
 * // Transient: New instance every time
 * container.register('service', () => new Service(), {
 *   lifetime: ServiceLifetime.TRANSIENT
 * });
 *
 * // Scoped: One instance per scope
 * container.register('service', () => new Service(), {
 *   lifetime: ServiceLifetime.SCOPED
 * });
 *
 * // Singleton: One instance for entire application
 * container.register('service', () => new Service(), {
 *   lifetime: ServiceLifetime.SINGLETON
 * });
 * ```
 */
export enum ServiceLifetime {
  /**
   * A new instance is created every time the service is resolved.
   */
  TRANSIENT = 'transient',

  /**
   * One instance per scope. The same instance is returned within a scope,
   * but different scopes get different instances.
   */
  SCOPED = 'scoped',

  /**
   * One instance for the entire application lifetime.
   * The same instance is always returned.
   */
  SINGLETON = 'singleton',
}
