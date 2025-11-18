import type { PropDefinition } from '../types/index.js';

export class ValidationUtils {
  static validateProjectName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Project name cannot be empty' };
    }

    const validNameRegex = /^[a-z0-9-_]+$/i;
    if (!validNameRegex.test(name)) {
      return {
        valid: false,
        error: 'Project name can only contain letters, numbers, hyphens, and underscores',
      };
    }

    if (name.startsWith('-') || name.startsWith('_')) {
      return { valid: false, error: 'Project name cannot start with a hyphen or underscore' };
    }

    return { valid: true };
  }

  static validateEntityName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Entity name cannot be empty' };
    }

    const startsWithLetter = /^[a-z]/i.test(name);
    if (!startsWithLetter) {
      return { valid: false, error: 'Entity name must start with a letter' };
    }

    const validNameRegex = /^[a-z][a-z0-9]*$/i;
    if (!validNameRegex.test(name)) {
      return {
        valid: false,
        error: 'Entity name can only contain letters and numbers (no spaces or special characters)',
      };
    }

    return { valid: true };
  }

  static parseProps(propsString?: string): PropDefinition[] {
    if (!propsString || propsString.trim().length === 0) {
      return [];
    }

    const props: PropDefinition[] = [];
    const pairs = propsString.split(',').map((p) => p.trim());

    for (const pair of pairs) {
      const [name, type] = pair.split(':').map((s) => s.trim());
      
      if (!name || !type) {
        throw new Error(`Invalid prop definition: "${pair}". Expected format: "name:type"`);
      }

      if (!/^[a-z][a-z0-9]*$/i.test(name)) {
        throw new Error(`Invalid property name: "${name}". Must start with a letter and contain only letters and numbers`);
      }

      props.push({ name, type });
    }

    return props;
  }
}
