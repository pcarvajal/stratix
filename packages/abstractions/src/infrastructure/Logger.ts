import { LogLevel } from './LogLevel.js';

/**
 * Logger interface for structured logging.
 *
 * @example
 * ```typescript
 * logger.info('User logged in', { userId: '123', timestamp: new Date() });
 * logger.error('Failed to process order', { orderId: '456', error });
 * logger.debug('Processing request', { method: 'POST', path: '/api/users' });
 * ```
 */
export interface Logger {
  /**
   * Logs a message at a specific level with optional context.
   *
   * @param level - The log level
   * @param message - The log message
   * @param context - Optional context object
   *
   * @example
   * ```typescript
   * logger.log(LogLevel.INFO, 'User created', { userId: '123' });
   * ```
   */
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a debug message.
   *
   * @param message - The log message
   * @param context - Optional context object
   *
   * @example
   * ```typescript
   * logger.debug('Processing request', { method: 'POST' });
   * ```
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an info message.
   *
   * @param message - The log message
   * @param context - Optional context object
   *
   * @example
   * ```typescript
   * logger.info('User logged in', { userId: '123' });
   * ```
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a warning message.
   *
   * @param message - The log message
   * @param context - Optional context object
   *
   * @example
   * ```typescript
   * logger.warn('Rate limit approaching', { current: 95, limit: 100 });
   * ```
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an error message.
   *
   * @param message - The log message
   * @param context - Optional context object (should include error)
   *
   * @example
   * ```typescript
   * logger.error('Database connection failed', { error, retryCount: 3 });
   * ```
   */
  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a fatal error message.
   *
   * @param message - The log message
   * @param context - Optional context object (should include error)
   *
   * @example
   * ```typescript
   * logger.fatal('Application crashed', { error, stack: error.stack });
   * ```
   */
  fatal(message: string, context?: Record<string, unknown>): void;
}
