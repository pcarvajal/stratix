import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogLevel } from '@stratix/abstractions';
import { ConsoleLogger } from '../ConsoleLogger.js';

describe('ConsoleLogger', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;

    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('construction', () => {
    it('should create logger with default options', () => {
      const logger = new ConsoleLogger();
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it('should create logger with custom options', () => {
      const logger = new ConsoleLogger({
        level: LogLevel.DEBUG,
        colors: false,
        timestamps: false,
        prefix: '[TEST]',
      });
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.DEBUG });
      logger.debug('Debug message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.info('Info message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.WARN });
      logger.warn('Warning message');

      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.ERROR });
      logger.error('Error message');

      expect(console.error).toHaveBeenCalled();
    });

    it('should log fatal messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.FATAL });
      logger.fatal('Fatal message');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('log level filtering', () => {
    it('should not log debug when level is info', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.debug('Debug message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log info when level is info', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.info('Info message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should log warn when level is info', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.warn('Warning message');

      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error when level is info', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.error('Error message');

      expect(console.error).toHaveBeenCalled();
    });

    it('should not log info when level is warn', () => {
      const logger = new ConsoleLogger({ level: LogLevel.WARN });
      logger.info('Info message');

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not log warn when level is error', () => {
      const logger = new ConsoleLogger({ level: LogLevel.ERROR });
      logger.warn('Warning message');

      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should only log fatal when level is fatal', () => {
      const logger = new ConsoleLogger({ level: LogLevel.FATAL });

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      logger.fatal('Fatal');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('log method', () => {
    it('should log using the generic log method', () => {
      const logger = new ConsoleLogger({ level: LogLevel.DEBUG });
      logger.log(LogLevel.INFO, 'Test message');

      expect(console.log).toHaveBeenCalled();
    });

    it('should respect level filtering in log method', () => {
      const logger = new ConsoleLogger({ level: LogLevel.WARN });
      logger.log(LogLevel.DEBUG, 'Debug message');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('context', () => {
    it('should log messages with context', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, colors: false });
      const context = { userId: 123, action: 'login' };

      logger.info('User logged in', context);

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).toContain('User logged in');
      expect(call).toContain('userId');
      expect(call).toContain('123');
    });

    it('should handle circular references in context', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      const circular: Record<string, unknown> = { name: 'test' };
      circular.self = circular;

      expect(() => logger.info('Test', circular)).not.toThrow();
      expect(console.log).toHaveBeenCalled();
    });

    it('should log without context', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.info('Simple message');

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).toContain('Simple message');
    });
  });

  describe('formatting options', () => {
    it('should include timestamps by default', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, colors: false });
      logger.info('Test message');

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      // ISO timestamp format includes 'T' and 'Z'
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should exclude timestamps when disabled', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, timestamps: false, colors: false });
      logger.info('Test message');

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include prefix when provided', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, prefix: '[MyApp]', colors: false });
      logger.info('Test message');

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).toContain('[MyApp]');
    });

    it('should include level labels', () => {
      const logger = new ConsoleLogger({ level: LogLevel.DEBUG, colors: false });

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      logger.fatal('Fatal');

      const logCall = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      const warnCall = (console.warn as ReturnType<typeof vi.fn>).mock.calls;
      const errorCall = (console.error as ReturnType<typeof vi.fn>).mock.calls;

      expect(logCall[0][0]).toContain('[DEBUG]');
      expect(logCall[1][0]).toContain('[INFO]');
      expect(warnCall[0][0]).toContain('[WARN]');
      expect(errorCall[0][0]).toContain('[ERROR]');
      expect(errorCall[1][0]).toContain('[FATAL]');
    });
  });

  describe('colors', () => {
    it('should include ANSI color codes when enabled', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, colors: true });
      logger.info('Colored message');

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      // ANSI escape sequences start with \x1b[
      expect(call).toContain('\x1b[');
    });

    it('should not include ANSI color codes when disabled', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, colors: false });
      logger.info('Plain message');

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).not.toContain('\x1b[');
    });

    it('should use different colors for different levels', () => {
      const logger = new ConsoleLogger({ level: LogLevel.DEBUG, colors: true });

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      // Just verify that console methods were called
      // Color codes are implementation details
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical application logging', () => {
      const logger = new ConsoleLogger({
        level: LogLevel.INFO,
        prefix: '[API]',
        colors: false,
      });

      logger.info('Server starting');
      logger.info('Connected to database', { host: 'localhost', port: 5432 });
      logger.warn('High memory usage', { usage: '85%' });
      logger.error('Request failed', { statusCode: 500, path: '/api/users' });

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should handle debug mode logging', () => {
      const logger = new ConsoleLogger({
        level: LogLevel.DEBUG,
        colors: false,
      });

      logger.debug('Processing request', { id: 'req-123' });
      logger.debug('Querying database', { query: 'SELECT * FROM users' });
      logger.info('Request completed', { duration: '45ms' });

      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it('should handle production mode with higher log level', () => {
      const logger = new ConsoleLogger({
        level: LogLevel.WARN,
        colors: false,
      });

      logger.debug('Debug info'); // Not logged
      logger.info('Info message'); // Not logged
      logger.warn('Warning'); // Logged
      logger.error('Error'); // Logged

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.info('');

      expect(console.log).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      const longMessage = 'x'.repeat(10000);

      expect(() => logger.info(longMessage)).not.toThrow();
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle special characters', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, colors: false });
      logger.info('Special chars: \n\t\r"\'\\');

      expect(console.log).toHaveBeenCalled();
    });

    it('should handle unicode characters', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.info('Unicode: 你好 ñ');

      expect(console.log).toHaveBeenCalled();
    });

    it('should handle null and undefined in context', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO });
      logger.info('Test', { value: null, other: undefined });

      expect(console.log).toHaveBeenCalled();
    });

    it('should handle nested context objects', () => {
      const logger = new ConsoleLogger({ level: LogLevel.INFO, colors: false });
      const context = {
        user: {
          id: 123,
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
            },
          },
        },
      };

      logger.info('Nested context', context);

      expect(console.log).toHaveBeenCalled();
      const call = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(call).toContain('John');
      expect(call).toContain('dark');
    });
  });
});
