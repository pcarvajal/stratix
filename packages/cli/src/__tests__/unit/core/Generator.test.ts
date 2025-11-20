import { describe, it, expect, beforeEach } from 'vitest';
import { Generator } from '../../../core/Generator.js';
import type { GeneratorContext, GeneratorResult } from '../../../core/types.js';

class TestGenerator extends Generator {
    name = 'test';

    async generate(context: GeneratorContext): Promise<GeneratorResult> {
        return {
            files: [
                {
                    path: '/test/file.ts',
                    content: 'test content',
                    action: 'create'
                }
            ]
        };
    }
}

describe('Generator', () => {
    let generator: TestGenerator;
    let context: GeneratorContext;

    beforeEach(() => {
        generator = new TestGenerator();
        context = {
            projectRoot: '/test',
            options: {}
        };
    });

    it('should have name', () => {
        expect(generator.name).toBe('test');
    });

    it('should generate files', async () => {
        const result = await generator.generate(context);

        expect(result.files).toHaveLength(1);
        expect(result.files[0].path).toBe('/test/file.ts');
        expect(result.files[0].content).toBe('test content');
        expect(result.files[0].action).toBe('create');
    });

    it('should run with lifecycle hooks', async () => {
        const executed: string[] = [];

        class HookedGenerator extends Generator {
            name = 'hooked';

            protected async beforeGenerate(context: GeneratorContext): Promise<void> {
                executed.push('before');
            }

            async generate(context: GeneratorContext): Promise<GeneratorResult> {
                executed.push('generate');
                return { files: [] };
            }

            protected async afterGenerate(context: GeneratorContext, result: GeneratorResult): Promise<void> {
                executed.push('after');
            }
        }

        const hookedGenerator = new HookedGenerator();
        await hookedGenerator.run(context);

        expect(executed).toEqual(['before', 'generate', 'after']);
    });
});
