import type { Template } from '../../core/Template.js';

/**
 * Template registry
 * 
 * Manages template registration and retrieval
 */
export class TemplateRegistry {
    private templates = new Map<string, Template>();

    /**
     * Register a template
     */
    register(template: Template): void {
        if (this.templates.has(template.name)) {
            throw new Error(`Template "${template.name}" is already registered`);
        }
        this.templates.set(template.name, template);
    }

    /**
     * Register multiple templates
     */
    registerAll(templates: Template[]): void {
        for (const template of templates) {
            this.register(template);
        }
    }

    /**
     * Get a template by name
     */
    get(name: string): Template {
        const template = this.templates.get(name);
        if (!template) {
            throw new Error(`Template "${name}" not found`);
        }
        return template;
    }

    /**
     * Check if template exists
     */
    has(name: string): boolean {
        return this.templates.has(name);
    }

    /**
     * Get all template names
     */
    getNames(): string[] {
        return Array.from(this.templates.keys());
    }

    /**
     * Clear all templates
     */
    clear(): void {
        this.templates.clear();
    }

    /**
     * Get number of registered templates
     */
    get size(): number {
        return this.templates.size;
    }
}
