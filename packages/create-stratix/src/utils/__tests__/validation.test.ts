import { describe, it, expect } from 'vitest';
import { ValidationUtils } from '../validation.js';

describe('ValidationUtils', () => {
  describe('isValidIdentifier', () => {
    it('should accept valid identifiers', () => {
      expect(ValidationUtils.isValidIdentifier('product')).toBe(true);
      expect(ValidationUtils.isValidIdentifier('Product')).toBe(true);
      expect(ValidationUtils.isValidIdentifier('product_item')).toBe(true);
      expect(ValidationUtils.isValidIdentifier('product-item')).toBe(true);
      expect(ValidationUtils.isValidIdentifier('product123')).toBe(true);
    });

    it('should reject invalid identifiers', () => {
      expect(ValidationUtils.isValidIdentifier('123product')).toBe(false);
      expect(ValidationUtils.isValidIdentifier('product item')).toBe(false);
      expect(ValidationUtils.isValidIdentifier('product.item')).toBe(false);
      expect(ValidationUtils.isValidIdentifier('')).toBe(false);
    });
  });

  describe('isPascalCase', () => {
    it('should accept PascalCase names', () => {
      expect(ValidationUtils.isPascalCase('Product')).toBe(true);
      expect(ValidationUtils.isPascalCase('ProductItem')).toBe(true);
      expect(ValidationUtils.isPascalCase('APIEndpoint')).toBe(true);
    });

    it('should reject non-PascalCase names', () => {
      expect(ValidationUtils.isPascalCase('product')).toBe(false);
      expect(ValidationUtils.isPascalCase('productItem')).toBe(false);
      expect(ValidationUtils.isPascalCase('product_item')).toBe(false);
      expect(ValidationUtils.isPascalCase('product-item')).toBe(false);
    });
  });

  describe('isCamelCase', () => {
    it('should accept camelCase names', () => {
      expect(ValidationUtils.isCamelCase('product')).toBe(true);
      expect(ValidationUtils.isCamelCase('productItem')).toBe(true);
      expect(ValidationUtils.isCamelCase('getProductById')).toBe(true);
    });

    it('should reject non-camelCase names', () => {
      expect(ValidationUtils.isCamelCase('Product')).toBe(false);
      expect(ValidationUtils.isCamelCase('ProductItem')).toBe(false);
      expect(ValidationUtils.isCamelCase('product_item')).toBe(false);
    });
  });

  describe('validateProps', () => {
    it('should parse simple props', () => {
      const result = ValidationUtils.validateProps('name:string,age:number');
      expect(result).toEqual([
        { name: 'name', type: 'string' },
        { name: 'age', type: 'number' },
      ]);
    });

    it('should handle props without types', () => {
      const result = ValidationUtils.validateProps('name,age');
      expect(result).toEqual([
        { name: 'name', type: 'string' },
        { name: 'age', type: 'string' },
      ]);
    });

    it('should handle empty string', () => {
      const result = ValidationUtils.validateProps('');
      expect(result).toEqual([]);
    });

    it('should handle array types', () => {
      const result = ValidationUtils.validateProps('items:string[],tags:number[]');
      expect(result).toEqual([
        { name: 'items', type: 'string[]' },
        { name: 'tags', type: 'number[]' },
      ]);
    });

    it('should throw on invalid property names', () => {
      expect(() => ValidationUtils.validateProps('123invalid:string')).toThrow(
        'Invalid property name'
      );
      expect(() => ValidationUtils.validateProps('invalid name:string')).toThrow(
        'Invalid property name'
      );
    });
  });

  describe('validateEntityName', () => {
    it('should accept valid entity names', () => {
      expect(() => ValidationUtils.validateEntityName('Product')).not.toThrow();
      expect(() => ValidationUtils.validateEntityName('ProductItem')).not.toThrow();
      expect(() => ValidationUtils.validateEntityName('User')).not.toThrow();
    });

    it('should reject empty names', () => {
      expect(() => ValidationUtils.validateEntityName('')).toThrow('Entity name is required');
    });

    it('should reject non-PascalCase names', () => {
      expect(() => ValidationUtils.validateEntityName('product')).toThrow('must be in PascalCase');
      expect(() => ValidationUtils.validateEntityName('product_item')).toThrow(
        'must be in PascalCase'
      );
    });

    it('should reject names that are too short', () => {
      expect(() => ValidationUtils.validateEntityName('P')).toThrow('at least 2 characters');
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      expect(() => ValidationUtils.validateEntityName(longName)).toThrow('less than 50 characters');
    });
  });

  describe('validateRepositoryName', () => {
    it('should accept valid repository names', () => {
      expect(() => ValidationUtils.validateRepositoryName('ProductRepository')).not.toThrow();
      expect(() => ValidationUtils.validateRepositoryName('UserRepository')).not.toThrow();
    });

    it('should reject empty names', () => {
      expect(() => ValidationUtils.validateRepositoryName('')).toThrow(
        'Repository name is required'
      );
    });

    it('should reject non-PascalCase names', () => {
      expect(() => ValidationUtils.validateRepositoryName('productRepository')).toThrow(
        'must be in PascalCase'
      );
    });
  });

  describe('validateUseCaseName', () => {
    it('should accept valid use case names', () => {
      expect(() => ValidationUtils.validateUseCaseName('CreateProduct')).not.toThrow();
      expect(() => ValidationUtils.validateUseCaseName('GetProduct')).not.toThrow();
      expect(() => ValidationUtils.validateUseCaseName('ListProducts')).not.toThrow();
    });

    it('should reject empty names', () => {
      expect(() => ValidationUtils.validateUseCaseName('')).toThrow('Use case name is required');
    });

    it('should reject non-PascalCase names', () => {
      expect(() => ValidationUtils.validateUseCaseName('createProduct')).toThrow(
        'must be in PascalCase'
      );
    });
  });
});
