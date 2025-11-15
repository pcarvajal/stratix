/**
 * Token type used to identify services in the container.
 *
 * Tokens can be:
 * - Strings: 'UserService', 'database'
 * - Symbols: Symbol.for('UserService')
 * - Class constructors: UserService
 *
 * @template T - The type of the service this token represents
 *
 * @example
 * ```typescript
 * // String token
 * const token: Token<Database> = 'database';
 *
 * // Symbol token
 * const token: Token<Logger> = Symbol.for('Logger');
 *
 * // Class token
 * const token: Token<UserService> = UserService;
 * ```
 */
export type Token<T = unknown> = string | symbol | (abstract new (...args: never[]) => T);
