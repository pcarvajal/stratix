import type { ValidationError as IValidationError } from './types.js';
import type { ZodError, ZodIssue } from 'zod';

export class ValidationErrorException extends Error {
  public readonly errors: IValidationError[];

  constructor(errors: IValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static fromZodError(error: ZodError): ValidationErrorException {
    const errors: IValidationError[] = error.errors.map((err: ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return new ValidationErrorException(errors);
  }

  toJSON() {
    return {
      error: 'VALIDATION_ERROR',
      message: this.message,
      errors: this.errors,
    };
  }

  getErrorsForField(field: string): IValidationError[] {
    return this.errors.filter((err) => err.field === field);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getFirstError(): IValidationError | undefined {
    return this.errors[0];
  }
}
