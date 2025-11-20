import type { Generator } from './Generator.js';
import type { GeneratorContext, GeneratorResult, GeneratedFile } from './types.js';

/**
 * Pipeline step
 */
export interface PipelineStep {
    name: string;
    generator: Generator;

    beforeExecute?(context: GeneratorContext): Promise<void>;
    afterExecute?(context: GeneratorContext, result: GeneratorResult): Promise<void>;
}

/**
 * Generator pipeline for composing multiple generators
 * 
 * @example
 * ```typescript
 * const pipeline = new Pipeline()
 *   .addStep({ name: 'entity', generator: new EntityGenerator() })
 *   .addStep({ name: 'repository', generator: new RepositoryGenerator() });
 * 
 * const result = await pipeline.execute(context);
 * ```
 */
export class Pipeline {
    private steps: PipelineStep[] = [];
    private executedSteps: PipelineStep[] = [];

    /**
     * Add a step to the pipeline
     */
    addStep(step: PipelineStep): this {
        this.steps.push(step);
        return this;
    }

    /**
     * Add multiple steps
     */
    addSteps(steps: PipelineStep[]): this {
        this.steps.push(...steps);
        return this;
    }

    /**
     * Execute the pipeline
     */
    async execute(context: GeneratorContext): Promise<GeneratorResult> {
        const allFiles: GeneratedFile[] = [];
        this.executedSteps = [];

        try {
            for (const step of this.steps) {
                // Before hook
                await step.beforeExecute?.(context);

                // Execute generator
                const result = await step.generator.run(context);
                allFiles.push(...result.files);

                // After hook
                await step.afterExecute?.(context, result);

                // Track executed step for rollback
                this.executedSteps.push(step);
            }

            return {
                files: allFiles,
                summary: `Pipeline executed ${this.steps.length} step(s)`
            };
        } catch (error) {
            // Rollback on error
            await this.rollback(context);
            throw error;
        }
    }

    /**
     * Rollback all executed steps in reverse order
     */
    async rollback(context: GeneratorContext): Promise<void> {
        for (const step of this.executedSteps.reverse()) {
            try {
                await step.generator.rollback?.(context);
            } catch (error) {
                console.error(`Failed to rollback step ${step.name}:`, error);
            }
        }
        this.executedSteps = [];
    }

    /**
     * Clear all steps
     */
    clear(): this {
        this.steps = [];
        this.executedSteps = [];
        return this;
    }

    /**
     * Get number of steps
     */
    get length(): number {
        return this.steps.length;
    }
}
