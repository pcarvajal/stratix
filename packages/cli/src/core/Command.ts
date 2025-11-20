import type { ValidationResult } from './types.js';

/**
 * Base class for all CLI commands
 * 
 * @example
 * ```typescript
 * class NewCommand extends Command {
 *   name = 'new';
 *   description = 'Create a new project';
 *   
 *   async execute(args: any): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export abstract class Command {
    /**
     * Command name
     */
    abstract readonly name: string;

    /**
     * Command description
     */
    abstract readonly description: string;

    /**
     * Command aliases
     */
    readonly aliases?: string[];

    /**
     * Execute the command
     */
    abstract execute(args: any): Promise<void>;

    /**
   * Validate command arguments
   * Override to add custom validation
   */
    protected async validate(_args: any): Promise<ValidationResult> {
        return { valid: true };
    }

    /**
     * Hook called before execution
     */
    protected async beforeExecute?(args: any): Promise<void>;

    /**
     * Hook called after execution
     */
    protected async afterExecute?(args: any, result: any): Promise<void>;

    /**
     * Run the command with lifecycle hooks
     */
    async run(args: any): Promise<void> {
        // Validate
        const validation = await this.validate(args);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
        }

        // Before hook
        await this.beforeExecute?.(args);

        // Execute
        const result = await this.execute(args);

        // After hook
        await this.afterExecute?.(args, result);
    }
}
