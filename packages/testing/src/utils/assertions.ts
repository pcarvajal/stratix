import { Result } from '@stratix/primitives';

/**
 * Assert that a Result is successful
 *
 * @example
 * ```typescript
 * const result = await useCase.execute(command);
 * assertSuccess(result);
 * ```
 */
export function assertSuccess<T>(result: Result<T>): asserts result is Result<T> {
  if (!result.isSuccess) {
    throw new Error(
      `Expected success but got failure: ${result.isFailure ? result.error.message : 'Unknown error'}`
    );
  }
}

/**
 * Assert that a Result is a failure
 *
 * @example
 * ```typescript
 * const result = await useCase.execute(invalidCommand);
 * assertFailure(result);
 * ```
 */
export function assertFailure<T>(result: Result<T>): asserts result is Result<T> {
  if (!result.isFailure) {
    throw new Error('Expected failure but got success');
  }
}

/**
 * Assert that a Result is successful and return the value
 *
 * @example
 * ```typescript
 * const result = await useCase.execute(command);
 * const value = unwrapSuccess(result);
 * ```
 */
export function unwrapSuccess<T>(result: Result<T>): T {
  assertSuccess(result);
  if (!result.isSuccess) {
    throw new Error('Result is not a success');
  }
  return result.value;
}

/**
 * Assert that a Result is a failure and return the error
 *
 * @example
 * ```typescript
 * const result = await useCase.execute(invalidCommand);
 * const error = unwrapFailure(result);
 * expect(error.message).toBe('Invalid command');
 * ```
 */
export function unwrapFailure<T>(result: Result<T>): Error {
  assertFailure(result);
  if (!result.isFailure) {
    throw new Error('Result is not a failure');
  }
  return result.error;
}
