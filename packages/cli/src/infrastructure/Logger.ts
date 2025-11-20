import chalk from 'chalk';

/**
 * Log level
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}

/**
 * Logger service
 * 
 * Provides consistent logging across the CLI
 */
export class Logger {
    private level: LogLevel = LogLevel.INFO;

    /**
     * Set log level
     */
    setLevel(level: LogLevel): void {
        this.level = level;
    }

    /**
     * Debug message
     */
    debug(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
        }
    }

    /**
     * Info message
     */
    info(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.log(chalk.blue(`[INFO] ${message}`), ...args);
        }
    }

    /**
     * Success message
     */
    success(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.log(chalk.green(`✓ ${message}`), ...args);
        }
    }

    /**
     * Warning message
     */
    warn(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(chalk.yellow(`[WARN] ${message}`), ...args);
        }
    }

    /**
     * Error message
     */
    error(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(chalk.red(`[ERROR] ${message}`), ...args);
        }
    }

    /**
     * Log without formatting
     */
    log(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.log(message, ...args);
        }
    }

    /**
     * Create a section header
     */
    section(title: string): void {
        if (this.level <= LogLevel.INFO) {
            console.log();
            console.log(chalk.bold.cyan(title));
            console.log(chalk.gray('─'.repeat(title.length)));
        }
    }

    /**
     * Create a blank line
     */
    newLine(): void {
        if (this.level <= LogLevel.INFO) {
            console.log();
        }
    }
}

/**
 * Singleton instance
 */
export const logger = new Logger();
