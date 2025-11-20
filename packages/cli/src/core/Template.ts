import { z } from 'zod';
import type { ValidationResult, TemplateData } from './types.js';

/**
 * Template interface
 * 
 * Templates can be implemented using any template engine (Handlebars, EJS, etc.)
 */
export interface Template {
    /**
     * Template name/identifier
     */
    readonly name: string;

    /**
     * Template file path (optional, for file-based templates)
     */
    readonly path?: string;

    /**
     * Zod schema for template data validation (optional)
     */
    readonly schema?: z.ZodSchema;

    /**
     * Render the template with given data
     */
    render(data: TemplateData): string;

    /**
     * Validate template data (optional)
     */
    validate?(data: TemplateData): ValidationResult;
}

/**
 * Abstract base class for templates
 */
export abstract class BaseTemplate implements Template {
    abstract readonly name: string;
    abstract readonly path?: string;
    readonly schema?: z.ZodSchema;

    abstract render(data: TemplateData): string;

    validate(data: TemplateData): ValidationResult {
        if (!this.schema) {
            return { valid: true };
        }

        try {
            this.schema.parse(data);
            return { valid: true };
        } catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    valid: false,
                    errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
                };
            }
            return {
                valid: false,
                errors: ['Unknown validation error']
            };
        }
    }
}
