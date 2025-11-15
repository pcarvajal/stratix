import type { Result } from '@stratix/primitives';
import { Success, Failure } from '@stratix/primitives';
import type { Schema, ValidationResult } from './types.js';
import { ZodValidator } from './ZodValidator.js';
import { ValidationErrorException } from './ValidationError.js';

export function validate<T>(schema: Schema<T>, data: unknown): ValidationResult<T> {
  const validator = new ZodValidator(schema);
  return validator.safeParse(data);
}

export async function validateAsync<T>(
  schema: Schema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  const validator = new ZodValidator(schema);
  return validator.safeParseAsync(data);
}

export function validateOrThrow<T>(schema: Schema<T>, data: unknown): T {
  const result = validate(schema, data);

  if (!result.success) {
    throw new ValidationErrorException(result.errors || []);
  }

  return result.data!;
}

export async function validateOrThrowAsync<T>(schema: Schema<T>, data: unknown): Promise<T> {
  const result = await validateAsync(schema, data);

  if (!result.success) {
    throw new ValidationErrorException(result.errors || []);
  }

  return result.data!;
}

export function validateWithResult<T>(schema: Schema<T>, data: unknown): Result<T> {
  const result = validate(schema, data);

  if (result.success) {
    return Success.create(result.data!);
  }

  const errorMessage =
    result.errors?.map((err) => `${err.field}: ${err.message}`).join(', ') || 'Validation failed';
  return Failure.create(new Error(errorMessage));
}

export async function validateWithResultAsync<T>(
  schema: Schema<T>,
  data: unknown
): Promise<Result<T>> {
  const result = await validateAsync(schema, data);

  if (result.success) {
    return Success.create(result.data!);
  }

  const errorMessage =
    result.errors?.map((err) => `${err.field}: ${err.message}`).join(', ') || 'Validation failed';
  return Failure.create(new Error(errorMessage));
}
