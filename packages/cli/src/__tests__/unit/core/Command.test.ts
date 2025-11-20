import { describe, it, expect, beforeEach } from 'vitest';
import { Command } from '../../../core/Command.js';

class TestCommand extends Command {
    name = 'test';
    description = 'Test command';

    async execute(args: any): Promise<void> {
        // Test implementation
    }
}

describe('Command', () => {
    let command: TestCommand;

    beforeEach(() => {
        command = new TestCommand();
    });

    it('should have name and description', () => {
        expect(command.name).toBe('test');
        expect(command.description).toBe('Test command');
    });

    it('should run with lifecycle hooks', async () => {
        const executed: string[] = [];

        class HookedCommand extends Command {
            name = 'hooked';
            description = 'Hooked command';

            protected async beforeExecute(args: any): Promise<void> {
                executed.push('before');
            }

            async execute(args: any): Promise<void> {
                executed.push('execute');
            }

            protected async afterExecute(args: any, result: any): Promise<void> {
                executed.push('after');
            }
        }

        const hookedCommand = new HookedCommand();
        await hookedCommand.run({});

        expect(executed).toEqual(['before', 'execute', 'after']);
    });

    it('should validate before execution', async () => {
        class ValidatedCommand extends Command {
            name = 'validated';
            description = 'Validated command';

            protected async validate(args: any) {
                if (!args.required) {
                    return {
                        valid: false,
                        errors: ['required field is missing']
                    };
                }
                return { valid: true };
            }

            async execute(args: any): Promise<void> {
                // Implementation
            }
        }

        const validatedCommand = new ValidatedCommand();

        await expect(validatedCommand.run({})).rejects.toThrow('required field is missing');
        await expect(validatedCommand.run({ required: true })).resolves.not.toThrow();
    });
});
