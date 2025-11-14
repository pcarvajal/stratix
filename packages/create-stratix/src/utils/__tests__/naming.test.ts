import { describe, it, expect } from 'vitest';
import { NamingUtils } from '../naming.js';

describe('NamingUtils', () => {
  describe('toPascalCase', () => {
    it('should convert lowercase to PascalCase', () => {
      expect(NamingUtils.toPascalCase('product')).toBe('Product');
    });

    it('should convert kebab-case to PascalCase', () => {
      expect(NamingUtils.toPascalCase('product-item')).toBe('ProductItem');
    });

    it('should convert snake_case to PascalCase', () => {
      expect(NamingUtils.toPascalCase('product_item')).toBe('ProductItem');
    });

    it('should handle multiple words', () => {
      expect(NamingUtils.toPascalCase('create product order')).toBe('CreateProductOrder');
    });

    it('should handle already PascalCase', () => {
      expect(NamingUtils.toPascalCase('ProductItem')).toBe('ProductItem');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(NamingUtils.toCamelCase('Product')).toBe('product');
    });

    it('should convert PascalCase to camelCase', () => {
      expect(NamingUtils.toCamelCase('ProductItem')).toBe('productItem');
    });

    it('should convert kebab-case to camelCase', () => {
      expect(NamingUtils.toCamelCase('product-item')).toBe('productItem');
    });
  });

  describe('toKebabCase', () => {
    it('should convert PascalCase to kebab-case', () => {
      expect(NamingUtils.toKebabCase('ProductItem')).toBe('product-item');
    });

    it('should convert camelCase to kebab-case', () => {
      expect(NamingUtils.toKebabCase('productItem')).toBe('product-item');
    });

    it('should handle already kebab-case', () => {
      expect(NamingUtils.toKebabCase('product-item')).toBe('product-item');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert PascalCase to snake_case', () => {
      expect(NamingUtils.toSnakeCase('ProductItem')).toBe('product_item');
    });

    it('should convert camelCase to snake_case', () => {
      expect(NamingUtils.toSnakeCase('productItem')).toBe('product_item');
    });

    it('should convert kebab-case to snake_case', () => {
      expect(NamingUtils.toSnakeCase('product-item')).toBe('product_item');
    });
  });

  describe('pluralize', () => {
    it('should pluralize regular nouns', () => {
      expect(NamingUtils.pluralize('product')).toBe('products');
      expect(NamingUtils.pluralize('order')).toBe('orders');
    });

    it('should handle nouns ending in y', () => {
      expect(NamingUtils.pluralize('category')).toBe('categories');
      expect(NamingUtils.pluralize('country')).toBe('countries');
    });

    it('should handle nouns ending in s, x, z, ch, sh', () => {
      expect(NamingUtils.pluralize('class')).toBe('classes');
      expect(NamingUtils.pluralize('box')).toBe('boxes');
      expect(NamingUtils.pluralize('buzz')).toBe('buzzes');
      expect(NamingUtils.pluralize('church')).toBe('churches');
      expect(NamingUtils.pluralize('dish')).toBe('dishes');
    });

    it('should not pluralize words ending in vowel+y', () => {
      expect(NamingUtils.pluralize('day')).toBe('days');
      expect(NamingUtils.pluralize('key')).toBe('keys');
    });
  });

  describe('singularize', () => {
    it('should singularize regular nouns', () => {
      expect(NamingUtils.singularize('products')).toBe('product');
      expect(NamingUtils.singularize('orders')).toBe('order');
    });

    it('should handle nouns ending in ies', () => {
      expect(NamingUtils.singularize('categories')).toBe('category');
      expect(NamingUtils.singularize('countries')).toBe('country');
    });

    it('should handle nouns ending in es', () => {
      expect(NamingUtils.singularize('classes')).toBe('class');
      expect(NamingUtils.singularize('boxes')).toBe('box');
    });

    it('should not singularize words ending in ss', () => {
      expect(NamingUtils.singularize('class')).toBe('class');
    });
  });
});
