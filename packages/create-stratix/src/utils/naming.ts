export class NamingUtils {
  static toPascalCase(str: string): string {
    if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
      return str;
    }

    return str
      .split(/[-_\s]+/)
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  static toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .replace(/-/g, '_')
      .toLowerCase();
  }

  static pluralize(str: string): string {
    if (str.endsWith('y') && !this.isVowel(str.charAt(str.length - 2))) {
      return str.slice(0, -1) + 'ies';
    }
    if (
      str.endsWith('s') ||
      str.endsWith('x') ||
      str.endsWith('z') ||
      str.endsWith('ch') ||
      str.endsWith('sh')
    ) {
      return str + 'es';
    }
    return str + 's';
  }

  static singularize(str: string): string {
    if (str.endsWith('ies')) {
      return str.slice(0, -3) + 'y';
    }
    if (str.endsWith('es')) {
      return str.slice(0, -2);
    }
    if (str.endsWith('s') && !str.endsWith('ss')) {
      return str.slice(0, -1);
    }
    return str;
  }

  private static isVowel(char: string): boolean {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
  }
}
