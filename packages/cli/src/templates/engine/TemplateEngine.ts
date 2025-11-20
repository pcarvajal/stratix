import Handlebars from 'handlebars';
import { TemplateRegistry } from './TemplateRegistry.js';
import type { TemplateData } from '../../core/types.js';

/**
 * Template engine using Handlebars
 * 
 * @example
 * ```typescript
 * const engine = new TemplateEngine(registry);
 * const output = engine.render('entity', { name: 'User' });
 * ```
 */
export class TemplateEngine {
    private handlebars: typeof Handlebars;

    constructor(private registry: TemplateRegistry) {
        this.handlebars = Handlebars.create();
        this.registerHelpers();
    }

    /**
     * Render a template by name
     */
    render(templateName: string, data: TemplateData): string {
        const template = this.registry.get(templateName);

        // Validate if template has validation
        if (template.validate) {
            const validation = template.validate(data);
            if (!validation.valid) {
                throw new Error(
                    `Template validation failed: ${validation.errors?.join(', ')}`
                );
            }
        }

        return template.render(data);
    }

    /**
     * Compile a template string
     */
    compile(source: string): (data: TemplateData) => string {
        const compiled = this.handlebars.compile(source);
        return (data: TemplateData) => compiled(data);
    }

    /**
     * Register custom Handlebars helpers
     */
    private registerHelpers(): void {
        // String case helpers
        this.handlebars.registerHelper('pascalCase', (str: string) => {
            return str
                .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
                .replace(/^(.)/, (c) => c.toUpperCase());
        });

        this.handlebars.registerHelper('camelCase', (str: string) => {
            return str
                .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
                .replace(/^(.)/, (c) => c.toLowerCase());
        });

        this.handlebars.registerHelper('kebabCase', (str: string) => {
            return str
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .replace(/[\s_]+/g, '-')
                .toLowerCase();
        });

        this.handlebars.registerHelper('snakeCase', (str: string) => {
            return str
                .replace(/([a-z])([A-Z])/g, '$1_$2')
                .replace(/[\s-]+/g, '_')
                .toLowerCase();
        });

        this.handlebars.registerHelper('upperCase', (str: string) => {
            return str.toUpperCase();
        });

        this.handlebars.registerHelper('lowerCase', (str: string) => {
            return str.toLowerCase();
        });

        // Pluralization helper (simple)
        this.handlebars.registerHelper('plural', (str: string) => {
            if (str.endsWith('y')) {
                return str.slice(0, -1) + 'ies';
            }
            if (str.endsWith('s')) {
                return str + 'es';
            }
            return str + 's';
        });

        // Conditional helpers
        this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
        this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
        this.handlebars.registerHelper('lt', (a: any, b: any) => a < b);
        this.handlebars.registerHelper('gt', (a: any, b: any) => a > b);
        this.handlebars.registerHelper('lte', (a: any, b: any) => a <= b);
        this.handlebars.registerHelper('gte', (a: any, b: any) => a >= b);

        // Array helpers
        this.handlebars.registerHelper('join', (arr: any[], separator: string) => {
            return arr.join(separator);
        });

        this.handlebars.registerHelper('length', (arr: any[]) => {
            return arr.length;
        });
    }

    /**
     * Register a custom helper
     */
    registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
        this.handlebars.registerHelper(name, helper);
    }

    /**
     * Get the Handlebars instance (for advanced usage)
     */
    getHandlebars(): typeof Handlebars {
        return this.handlebars;
    }
}
