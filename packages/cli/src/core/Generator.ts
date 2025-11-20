import type { GeneratorContext, GeneratorResult } from './types.js';

/**
 * Base class for all generators
 * 
 * @example
 * ```typescript
 * class EntityGenerator extends Generator {
 *   name = 'entity';
 *   
 *   async generate(context: GeneratorContext): Promise<GeneratorResult> {
 *     return {
 *       files: [
 *         {
 *           path: 'src/domain/entities/User.ts',
 *           content: '...',
 *           action: 'create'
 *         }
 *       ]
 *     };
 *   }
 * }
 * ```
 */
export abstract class Generator {
    /**
     * Generator name
     */
    abstract readonly name: string;

    /**
     * Generator description
     */
    abstract readonly description?: string;

    /**
     * Generate files
     */
    abstract generate(context: GeneratorContext): Promise<GeneratorResult>;

    /**
     * Hook called before generation
     */
    protected async beforeGenerate?(context: GeneratorContext): Promise<void>;

    /**
     * Hook called after generation
     */
    protected async afterGenerate?(
        context: GeneratorContext,
        result: GeneratorResult
    ): Promise<void>;

    /**
     * Rollback changes (if supported)
     */
    async rollback?(context: GeneratorContext): Promise<void>;

    /**
     * Run the generator with lifecycle hooks
     */
    async run(context: GeneratorContext): Promise<GeneratorResult> {
        // Before hook
        await this.beforeGenerate?.(context);

        // Generate
        const result = await this.generate(context);

        // After hook
        await this.afterGenerate?.(context, result);

        return result;
    }
}
