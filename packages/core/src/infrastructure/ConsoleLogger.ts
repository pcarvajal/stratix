import type { Logger } from '@stratix/core';
import { LogLevel } from '@stratix/core';

/**
 * ANSI color codes for terminal output.
 */
const Colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',

  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',
  FgGray: '\x1b[90m',
} as const;

/**
 * Options for configuring the ConsoleLogger.
 */
export interface ConsoleLoggerOptions {
  /**
   * Minimum log level to display.
   * Logs below this level will be ignored.
   * @default LogLevel.INFO
   */
  level?: LogLevel;

  /**
   * Whether to enable colored output.
   * @default true
   */
  colors?: boolean;

  /**
   * Whether to include timestamps in log output.
   * @default true
   */
  timestamps?: boolean;

  /**
   * Custom prefix to add to all log messages.
   */
  prefix?: string;
}

/**
 * Console-based logger implementation.
 *
 * Provides colored, formatted console output with configurable log levels.
 *
 * @example
 * ```typescript
 * const logger = new ConsoleLogger({
 *   level: LogLevel.DEBUG,
 *   colors: true,
 *   timestamps: true,
 *   prefix: '[MyApp]'
 * });
 *
 * logger.info('Application started');
 * logger.error('Something went wrong', { error: new Error('Boom!') });
 * ```
 */
export class ConsoleLogger implements Logger {
  private readonly level: LogLevel;
  private readonly useColors: boolean;
  private readonly useTimestamps: boolean;
  private readonly prefix: string;

  // Map log levels to numeric values for comparison
  private readonly levelPriority: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.FATAL]: 4,
  };

  constructor(options: ConsoleLoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.useColors = options.colors ?? true;
    this.useTimestamps = options.timestamps ?? true;
    this.prefix = options.prefix ?? '';
  }

  /**
   * Logs a message at the specified level.
   *
   * @param level - The log level
   * @param message - The message to log
   * @param context - Optional context object
   */
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);
    const output = context
      ? `${formattedMessage} ${this.formatContext(context)}`
      : formattedMessage;

    this.writeToConsole(level, output);
  }

  /**
   * Logs a debug message.
   *
   * @param message - The message to log
   * @param context - Optional context object
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs an info message.
   *
   * @param message - The message to log
   * @param context - Optional context object
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message.
   *
   * @param message - The message to log
   * @param context - Optional context object
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logs an error message.
   *
   * @param message - The message to log
   * @param context - Optional context object
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Logs a fatal error message.
   *
   * @param message - The message to log
   * @param context - Optional context object
   */
  fatal(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context);
  }

  /**
   * Checks if a message at the given level should be logged.
   *
   * @param level - The log level to check
   * @returns True if the message should be logged
   * @private
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.level];
  }

  /**
   * Formats a log message with timestamp, level, and prefix.
   *
   * @param level - The log level
   * @param message - The message to format
   * @returns The formatted message
   * @private
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

    if (this.useTimestamps) {
      const timestamp = this.formatTimestamp();
      parts.push(this.useColors ? `${Colors.FgGray}${timestamp}${Colors.Reset}` : timestamp);
    }

    const levelLabel = this.formatLevel(level);
    parts.push(levelLabel);

    if (this.prefix) {
      parts.push(this.useColors ? `${Colors.FgCyan}${this.prefix}${Colors.Reset}` : this.prefix);
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Formats a timestamp for the current time.
   *
   * @returns The formatted timestamp
   * @private
   */
  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Formats a log level with optional colors.
   *
   * @param level - The log level to format
   * @returns The formatted level string
   * @private
   */
  private formatLevel(level: LogLevel): string {
    const label = `[${level.toUpperCase()}]`;

    if (!this.useColors) {
      return label;
    }

    switch (level) {
      case LogLevel.DEBUG:
        return `${Colors.FgBlue}${label}${Colors.Reset}`;
      case LogLevel.INFO:
        return `${Colors.FgGreen}${label}${Colors.Reset}`;
      case LogLevel.WARN:
        return `${Colors.FgYellow}${label}${Colors.Reset}`;
      case LogLevel.ERROR:
        return `${Colors.FgRed}${label}${Colors.Reset}`;
      case LogLevel.FATAL:
        return `${Colors.Bright}${Colors.FgRed}${label}${Colors.Reset}`;
      default:
        return label;
    }
  }

  /**
   * Formats a context object for display.
   *
   * @param context - The context object
   * @returns The formatted context string
   * @private
   */
  private formatContext(context: Record<string, unknown>): string {
    try {
      const contextStr = JSON.stringify(context, null, 2);
      return this.useColors ? `${Colors.FgGray}${contextStr}${Colors.Reset}` : contextStr;
    } catch {
      return '[Circular]';
    }
  }

  /**
   * Writes output to the appropriate console method.
   *
   * @param level - The log level
   * @param output - The formatted output string
   * @private
   */
  private writeToConsole(level: LogLevel, output: string): void {
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(output);
        break;
      case LogLevel.WARN:
        console.warn(output);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output);
        break;
    }
  }
}
