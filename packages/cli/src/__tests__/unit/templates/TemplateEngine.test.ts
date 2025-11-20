import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine } from '../../../templates/engine/TemplateEngine.js';
import { TemplateRegistry } from '../../../templates/engine/TemplateRegistry.js';
import { BaseTemplate } from '../../../core/Template.js';
import type { TemplateData } from '../../../core/types.js';

class TestTemplate extends BaseTemplate {
    name = 'test';

    render(data: TemplateData): string {
        return `Hello, ${data.name}!`;
    }
}

describe('TemplateEngine', () => {
    let registry: TemplateRegistry;
    let engine: TemplateEngine;

    beforeEach(() => {
        registry = new TemplateRegistry();
        engine = new TemplateEngine(registry);
    });

    it('should render template', () => {
        registry.register(new TestTemplate());

        const output = engine.render('test', { name: 'World' });
        expect(output).toBe('Hello, World!');
    });

    it('should compile template string', () => {
        const compiled = engine.compile('Hello, {{name}}!');
        const output = compiled({ name: 'World' });

        expect(output).toBe('Hello, World!');
    });

    it('should have pascalCase helper', () => {
        const compiled = engine.compile('{{pascalCase name}}');

        expect(compiled({ name: 'hello-world' })).toBe('HelloWorld');
        expect(compiled({ name: 'hello_world' })).toBe('HelloWorld');
    });

    it('should have camelCase helper', () => {
        const compiled = engine.compile('{{camelCase name}}');

        expect(compiled({ name: 'hello-world' })).toBe('helloWorld');
        expect(compiled({ name: 'HelloWorld' })).toBe('helloWorld');
    });

    it('should have kebabCase helper', () => {
        const compiled = engine.compile('{{kebabCase name}}');

        expect(compiled({ name: 'HelloWorld' })).toBe('hello-world');
        expect(compiled({ name: 'hello_world' })).toBe('hello-world');
    });

    it('should have snakeCase helper', () => {
        const compiled = engine.compile('{{snakeCase name}}');

        expect(compiled({ name: 'HelloWorld' })).toBe('hello_world');
        expect(compiled({ name: 'hello-world' })).toBe('hello_world');
    });
});
