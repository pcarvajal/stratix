import { describe, it, expect } from 'vitest';
import { ValueObject } from '../core/ValueObject.js';

// Test implementations
class SimpleValue extends ValueObject {
  constructor(private readonly value: string) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }
}

class ComplexValue extends ValueObject {
  constructor(
    private readonly name: string,
    private readonly age: number
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.name, this.age];
  }
}

class NestedValue extends ValueObject {
  constructor(
    private readonly simple: SimpleValue,
    private readonly number: number
  ) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.simple, this.number];
  }
}

class ArrayValue extends ValueObject {
  constructor(private readonly items: string[]) {
    super();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.items];
  }
}

describe('ValueObject', () => {
  describe('equals', () => {
    it('should return true for value objects with same values', () => {
      const value1 = new SimpleValue('test');
      const value2 = new SimpleValue('test');

      expect(value1.equals(value2)).toBe(true);
    });

    it('should return false for value objects with different values', () => {
      const value1 = new SimpleValue('test1');
      const value2 = new SimpleValue('test2');

      expect(value1.equals(value2)).toBe(false);
    });

    it('should return false for value objects of different types', () => {
      const simple = new SimpleValue('test');
      const complex = new ComplexValue('test', 30);

      expect(simple.equals(complex as unknown as SimpleValue)).toBe(false);
    });

    it('should handle multiple equality components', () => {
      const value1 = new ComplexValue('John', 30);
      const value2 = new ComplexValue('John', 30);
      const value3 = new ComplexValue('John', 31);
      const value4 = new ComplexValue('Jane', 30);

      expect(value1.equals(value2)).toBe(true);
      expect(value1.equals(value3)).toBe(false);
      expect(value1.equals(value4)).toBe(false);
    });

    it('should handle nested value objects', () => {
      const simple1 = new SimpleValue('test');
      const simple2 = new SimpleValue('test');
      const simple3 = new SimpleValue('different');

      const nested1 = new NestedValue(simple1, 42);
      const nested2 = new NestedValue(simple2, 42);
      const nested3 = new NestedValue(simple3, 42);
      const nested4 = new NestedValue(simple1, 43);

      expect(nested1.equals(nested2)).toBe(true);
      expect(nested1.equals(nested3)).toBe(false);
      expect(nested1.equals(nested4)).toBe(false);
    });

    it('should handle array equality components', () => {
      const value1 = new ArrayValue(['a', 'b', 'c']);
      const value2 = new ArrayValue(['a', 'b', 'c']);
      const value3 = new ArrayValue(['a', 'b']);
      const value4 = new ArrayValue(['a', 'b', 'd']);

      expect(value1.equals(value2)).toBe(true);
      expect(value1.equals(value3)).toBe(false);
      expect(value1.equals(value4)).toBe(false);
    });

    it('should handle arrays with different lengths', () => {
      const value1 = new ArrayValue(['a', 'b', 'c']);
      const value2 = new ArrayValue(['a', 'b']);

      expect(value1.equals(value2)).toBe(false);
    });

    it('should return false when equality components have different lengths', () => {
      class Value1 extends ValueObject {
        protected getEqualityComponents(): unknown[] {
          return ['a', 'b'];
        }
      }

      class Value2 extends ValueObject {
        protected getEqualityComponents(): unknown[] {
          return ['a', 'b', 'c'];
        }
      }

      const v1 = new Value1();
      const v2 = new Value2();

      expect(v1.equals(v2 as unknown as Value1)).toBe(false);
    });
  });
});
