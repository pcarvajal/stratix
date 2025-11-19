import { describe, it, expect } from 'vitest';
import { Success, Failure, ResultUtils } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

describe('Result', () => {
  describe('Success', () => {
    it('should create a success result', () => {
      const result = Success.create(42);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(42);
    });

    it('should support any value type', () => {
      const numberResult = Success.create(42);
      const stringResult = Success.create('hello');
      const objectResult = Success.create({ name: 'test' });
      const arrayResult = Success.create([1, 2, 3]);

      expect(numberResult.value).toBe(42);
      expect(stringResult.value).toBe('hello');
      expect(objectResult.value).toEqual({ name: 'test' });
      expect(arrayResult.value).toEqual([1, 2, 3]);
    });

    it('should support null and undefined values', () => {
      const nullResult = Success.create(null);
      const undefinedResult = Success.create(undefined);

      expect(nullResult.value).toBe(null);
      expect(undefinedResult.value).toBe(undefined);
    });

    describe('map', () => {
      it('should map the success value', () => {
        const result = Success.create(5);
        const mapped = result.map((x) => x * 2);

        expect(mapped.isSuccess).toBe(true);
        expect(mapped.value).toBe(10);
      });

      it('should support chaining multiple maps', () => {
        const result = Success.create(5)
          .map((x) => x * 2)
          .map((x) => x + 3)
          .map((x) => x.toString());

        expect(result.value).toBe('13');
      });

      it('should transform to different types', () => {
        const result = Success.create(42).map((x) => `Number: ${x}`);

        expect(result.value).toBe('Number: 42');
      });
    });

    describe('flatMap', () => {
      it('should flat map to another success', () => {
        const divide = (a: number, b: number) => {
          if (b === 0) {
            return Failure.create(new DomainError('DIV_BY_ZERO', 'Cannot divide by zero'));
          }
          return Success.create(a / b);
        };

        const result = Success.create(10).flatMap((x) => divide(x, 2));

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
          expect(result.value).toBe(5);
        }
      });

      it('should flat map to a failure', () => {
        const divide = (a: number, b: number) => {
          if (b === 0) {
            return Failure.create(new DomainError('DIV_BY_ZERO', 'Cannot divide by zero'));
          }
          return Success.create(a / b);
        };

        const result = Success.create(10).flatMap((x) => divide(x, 0));

        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
          expect(result.error.code).toBe('DIV_BY_ZERO');
        }
      });

      it('should support chaining flatMaps', () => {
        const divide = (a: number, b: number) => {
          if (b === 0) {
            return Failure.create(new DomainError('DIV_BY_ZERO', 'Cannot divide by zero'));
          }
          return Success.create(a / b);
        };

        const result = Success.create(100)
          .flatMap((x) => divide(x, 2)) // 50
          .flatMap((x) => divide(x, 5)); // 10

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
          expect(result.value).toBe(10);
        }
      });
    });
  });

  describe('Failure', () => {
    it('should create a failure result', () => {
      const error = new DomainError('TEST_ERROR', 'Test error message');
      const result = Failure.create(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });

    it('should support any error type', () => {
      const domainError = new DomainError('CODE', 'message');
      const genericError = new Error('generic error');

      const result1 = Failure.create(domainError);
      const result2 = Failure.create(genericError);

      expect(result1.error).toBe(domainError);
      expect(result2.error).toBe(genericError);
    });

    describe('map', () => {
      it('should not transform the error', () => {
        const error = new DomainError('CODE', 'message');
        const result = Failure.create(error);
        const mapped = result.map((x) => x * 2);

        expect(mapped.isFailure).toBe(true);
        expect(mapped.error).toBe(error);
      });

      it('should maintain failure through map chain', () => {
        const error = new DomainError('CODE', 'message');
        const result = Failure.create(error)
          .map((x) => x * 2)
          .map((x) => x + 3);

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe(error);
      });
    });

    describe('flatMap', () => {
      it('should not execute the function', () => {
        const error = new DomainError('CODE', 'message');
        const result = Failure.create(error);
        let executed = false;

        const mapped = result.flatMap(() => {
          executed = true;
          return Success.create(42);
        });

        expect(executed).toBe(false);
        expect(mapped.isFailure).toBe(true);
        expect(mapped.error).toBe(error);
      });

      it('should maintain failure through flatMap chain', () => {
        const error = new DomainError('CODE', 'message');
        const result = Failure.create(error)
          .flatMap(() => Success.create(42))
          .flatMap(() => Success.create(84));

        expect(result.isFailure).toBe(true);
        expect(result.error).toBe(error);
      });
    });
  });

  describe('ResultUtils', () => {
    describe('unwrap', () => {
      it('should unwrap success value', () => {
        const result = Success.create(42);
        const value = ResultUtils.unwrap(result);

        expect(value).toBe(42);
      });

      it('should throw error for failure', () => {
        const error = new DomainError('CODE', 'message');
        const result = Failure.create(error);

        expect(() => ResultUtils.unwrap(result)).toThrow(error);
      });
    });

    describe('unwrapOr', () => {
      it('should unwrap success value', () => {
        const result = Success.create(42);
        const value = ResultUtils.unwrapOr(result, 0);

        expect(value).toBe(42);
      });

      it('should return default value for failure', () => {
        const error = new DomainError('CODE', 'message');
        const result = Failure.create(error);
        const value = ResultUtils.unwrapOr(result, 0);

        expect(value).toBe(0);
      });
    });

    describe('isSuccess', () => {
      it('should return true for success', () => {
        const result = Success.create(42);

        expect(ResultUtils.isSuccess(result)).toBe(true);
      });

      it('should return false for failure', () => {
        const result = Failure.create(new Error('fail'));

        expect(ResultUtils.isSuccess(result)).toBe(false);
      });

      it('should narrow type', () => {
        const result = Success.create(42);

        if (ResultUtils.isSuccess(result)) {
          // TypeScript should know result.value exists
          expect(result.value).toBe(42);
        }
      });
    });

    describe('isFailure', () => {
      it('should return true for failure', () => {
        const result = Failure.create(new Error('fail'));

        expect(ResultUtils.isFailure(result)).toBe(true);
      });

      it('should return false for success', () => {
        const result = Success.create(42);

        expect(ResultUtils.isFailure(result)).toBe(false);
      });

      it('should narrow type', () => {
        const result = Failure.create(new DomainError('CODE', 'message'));

        if (ResultUtils.isFailure(result)) {
          // TypeScript should know result.error exists
          expect(result.error).toBeInstanceOf(DomainError);
        }
      });
    });
  });

  describe('Real-world usage patterns', () => {
    it('should handle validation chains', () => {
      function validatePositive(n: number) {
        if (n <= 0) {
          return Failure.create(new DomainError('NOT_POSITIVE', 'Number must be positive'));
        }
        return Success.create(n);
      }

      function validateLessThan100(n: number) {
        if (n >= 100) {
          return Failure.create(new DomainError('TOO_LARGE', 'Number must be less than 100'));
        }
        return Success.create(n);
      }

      const result1 = validatePositive(50).flatMap(validateLessThan100);
      const result2 = validatePositive(-5).flatMap(validateLessThan100);
      const result3 = validatePositive(150).flatMap(validateLessThan100);

      expect(result1.isSuccess).toBe(true);
      expect(result2.isFailure).toBe(true);
      expect(result3.isFailure).toBe(true);

      if (result2.isFailure) {
        expect(result2.error.code).toBe('NOT_POSITIVE');
      }
      if (result3.isFailure) {
        expect(result3.error.code).toBe('TOO_LARGE');
      }
    });

    it('should handle transformation pipelines', () => {
      const result = Success.create('42')
        .map(parseInt)
        .map((x) => x * 2)
        .map((x) => `Result: ${x}`);

      expect(result.value).toBe('Result: 84');
    });
  });
});
