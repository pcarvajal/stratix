/**
 * Represents the result of an operation that can succeed or fail.
 *
 * Result is a type-safe way to handle errors without throwing exceptions.
 * It forces explicit error handling at compile time.
 *
 * @template T - The type of the success value
 * @template E - The type of the error (must extend Error)
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, DomainError> {
 *   if (b === 0) {
 *     return Failure.create(new DomainError('DIVISION_BY_ZERO', 'Cannot divide by zero'));
 *   }
 *   return Success.create(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.isSuccess) {
 *   console.log(result.value); // 5
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

/**
 * Represents a successful result.
 *
 * @template T - The type of the success value
 */
export class Success<T> {
  readonly isSuccess = true as const;
  readonly isFailure = false as const;

  constructor(readonly value: T) {}

  /**
   * Creates a new Success result.
   *
   * @param value - The success value
   * @returns A Success instance
   *
   * @example
   * ```typescript
   * return Success.create(42);
   * ```
   */
  static create<T>(value: T): Success<T> {
    return new Success(value);
  }

  /**
   * Maps the success value to a new value.
   *
   * @param fn - The mapping function
   * @returns A new Success with the mapped value
   *
   * @example
   * ```typescript
   * const result = Success.create(5);
   * const doubled = result.map(x => x * 2); // Success(10)
   * ```
   */
  map<U>(fn: (value: T) => U): Success<U> {
    return Success.create(fn(this.value));
  }

  /**
   * Flat maps the success value to a new Result.
   *
   * @param fn - The flat mapping function
   * @returns The result of the flat mapping function
   *
   * @example
   * ```typescript
   * const result = Success.create(5);
   * const divided = result.flatMap(x => divide(10, x)); // Success(2) or Failure
   * ```
   */
  flatMap<U, E extends Error>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }
}

/**
 * Represents a failed result.
 *
 * @template E - The type of the error (must extend Error)
 */
export class Failure<E extends Error> {
  readonly isSuccess = false as const;
  readonly isFailure = true as const;

  constructor(readonly error: E) {}

  /**
   * Creates a new Failure result.
   *
   * @param error - The error
   * @returns A Failure instance
   *
   * @example
   * ```typescript
   * return Failure.create(new DomainError('INVALID_INPUT', 'Input is invalid'));
   * ```
   */
  static create<E extends Error>(error: E): Failure<E> {
    return new Failure(error);
  }

  /**
   * Maps have no effect on Failure, but preserves the type signature.
   *
   * @returns This Failure instance
   *
   * @example
   * ```typescript
   * const result = Failure.create(new Error('fail'));
   * const mapped = result.map(x => x * 2); // Still Failure('fail')
   * ```
   */
  map<U>(_fn: (value: never) => U): Failure<E> {
    return this;
  }

  /**
   * Flat map has no effect on Failure, but preserves the type signature.
   *
   * @returns This Failure instance cast to the new Result type
   *
   * @example
   * ```typescript
   * const result = Failure.create(new Error('fail'));
   * const flatMapped = result.flatMap(x => Success.create(x * 2)); // Still Failure('fail')
   * ```
   */
  flatMap<U, E2 extends Error>(_fn: (value: never) => Result<U, E2>): Failure<E> {
    return this;
  }
}

/**
 * Helper functions for working with Results.
 */
export const ResultUtils = {
  /**
   * Unwraps a Success value or throws the error if Failure.
   *
   * @param result - The Result to unwrap
   * @returns The success value
   * @throws The error if result is Failure
   *
   * @example
   * ```typescript
   * const value = ResultUtils.unwrap(result); // throws if failure
   * ```
   */
  unwrap<T, E extends Error>(result: Result<T, E>): T {
    if (result.isSuccess) {
      return result.value;
    }
    throw result.error;
  },

  /**
   * Unwraps a Success value or returns a default value if Failure.
   *
   * @param result - The Result to unwrap
   * @param defaultValue - The default value to return if Failure
   * @returns The success value or the default value
   *
   * @example
   * ```typescript
   * const value = ResultUtils.unwrapOr(result, 0); // returns 0 if failure
   * ```
   */
  unwrapOr<T, E extends Error>(result: Result<T, E>, defaultValue: T): T {
    if (result.isSuccess) {
      return result.value;
    }
    return defaultValue;
  },

  /**
   * Checks if a Result is a Success.
   *
   * @param result - The Result to check
   * @returns true if Success, false otherwise
   */
  isSuccess<T, E extends Error>(result: Result<T, E>): result is Success<T> {
    return result.isSuccess;
  },

  /**
   * Checks if a Result is a Failure.
   *
   * @param result - The Result to check
   * @returns true if Failure, false otherwise
   */
  isFailure<T, E extends Error>(result: Result<T, E>): result is Failure<E> {
    return result.isFailure;
  },
};
