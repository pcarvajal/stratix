import { describe, it, expect, beforeEach } from 'vitest';
import { Pipeline } from '../../../core/Pipeline.js';
import { Generator } from '../../../core/Generator.js';
import type { GeneratorContext, GeneratorResult } from '../../../core/types.js';

class TestGeneratorA extends Generator {
    name = 'a';

    async generate(context: GeneratorContext): Promise<GeneratorResult> {
        return {
            files: [
                { path: '/a.ts', content: 'a', action: 'create' }
            ]
        };
    }
}

class TestGeneratorB extends Generator {
    name = 'b';

    async generate(context: GeneratorContext): Promise<GeneratorResult> {
        return {
            files: [
                { path: '/b.ts', content: 'b', action: 'create' }
            ]
        };
    }
}

describe('Pipeline', () => {
    let pipeline: Pipeline;
    let context: GeneratorContext;

    beforeEach(() => {
        pipeline = new Pipeline();
        context = {
            projectRoot: '/test',
            options: {}
        };
    });

    it('should add steps', () => {
        pipeline.addStep({ name: 'a', generator: new TestGeneratorA() });

        expect(pipeline.length).toBe(1);
    });

    it('should execute all steps', async () => {
        pipeline
            .addStep({ name: 'a', generator: new TestGeneratorA() })
            .addStep({ name: 'b', generator: new TestGeneratorB() });

        const result = await pipeline.execute(context);

        expect(result.files).toHaveLength(2);
        expect(result.files[0].path).toBe('/a.ts');
        expect(result.files[1].path).toBe('/b.ts');
    });

    it('should call step hooks', async () => {
        const executed: string[] = [];

        pipeline.addStep({
            name: 'test',
            generator: new TestGeneratorA(),
            async beforeExecute() {
                executed.push('before');
            },
            async afterExecute() {
                executed.push('after');
            }
        });

        await pipeline.execute(context);

        expect(executed).toEqual(['before', 'after']);
    });

    it('should clear steps', () => {
        pipeline.addStep({ name: 'a', generator: new TestGeneratorA() });
        pipeline.clear();

        expect(pipeline.length).toBe(0);
    });
});
