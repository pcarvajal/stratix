/**
 * Log levels for structured logging.
 *
 * @example
 * ```typescript
 * logger.log(LogLevel.INFO, 'User logged in', { userId: '123' });
 * logger.log(LogLevel.ERROR, 'Database connection failed', { error });
 * ```
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}
