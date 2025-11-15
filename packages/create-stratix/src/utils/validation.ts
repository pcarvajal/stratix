export class ValidationUtils {
  static isValidIdentifier(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name);
  }

  static isPascalCase(name: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  static isCamelCase(name: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }

  static validateProps(propsString: string): Array<{ name: string; type: string }> {
    if (!propsString || propsString.trim() === '') {
      return [];
    }

    const props = propsString.split(',').map((prop) => {
      const [name, type] = prop.split(':').map((s) => s.trim());

      if (!name || !this.isValidIdentifier(name)) {
        throw new Error(`Invalid property name: ${name}`);
      }

      const validType = type || 'string';
      const allowedTypes = ['string', 'number', 'boolean', 'Date', 'any'];

      if (
        !allowedTypes.includes(validType) &&
        !validType.endsWith('[]') &&
        !validType.includes('<')
      ) {
        console.warn(`Warning: Unusual type "${validType}" for property "${name}"`);
      }

      return { name, type: validType };
    });

    return props;
  }

  static validateEntityName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Entity name is required');
    }

    if (!this.isPascalCase(name)) {
      throw new Error('Entity name must be in PascalCase (e.g., Product, OrderItem)');
    }

    if (name.length < 2) {
      throw new Error('Entity name must be at least 2 characters long');
    }

    if (name.length > 50) {
      throw new Error('Entity name must be less than 50 characters');
    }
  }

  static validateValueObjectName(name: string): void {
    this.validateEntityName(name);
  }

  static validateRepositoryName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Repository name is required');
    }

    if (!this.isPascalCase(name)) {
      throw new Error('Repository name must be in PascalCase');
    }

    if (!name.endsWith('Repository')) {
      console.warn(
        `Warning: Repository name should end with "Repository" (e.g., ProductRepository)`
      );
    }
  }

  static validateUseCaseName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Use case name is required');
    }

    if (!this.isPascalCase(name)) {
      throw new Error('Use case name must be in PascalCase (e.g., CreateProduct, GetProduct)');
    }
  }
}
