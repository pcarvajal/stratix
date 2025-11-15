import { Token } from './Token.js';

/**
 * Context provided to factory functions during service resolution.
 *
 * Allows factories to resolve their dependencies from the container.
 *
 * @example
 * ```typescript
 * container.register('userService', (context) => {
 *   const repository = context.resolve<UserRepository>('userRepository');
 *   const logger = context.resolve<Logger>('logger');
 *   return new UserService(repository, logger);
 * });
 * ```
 */
export interface ResolutionContext {
  /**
   * Resolves a service from the container by its token.
   *
   * @template T - The type of the service to resolve
   * @param token - The token identifying the service
   * @returns The resolved service instance
   * @throws Error if the service is not registered
   *
   * @example
   * ```typescript
   * const logger = context.resolve<Logger>('logger');
   * const userRepo = context.resolve(UserRepository);
   * ```
   */
  resolve<T>(token: Token<T>): T;
}
