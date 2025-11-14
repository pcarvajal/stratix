import type { ZodError } from 'zod';
import type { Validator, ValidationResult, ValidationError, Schema } from './types.js';

export class ZodValidator<T> implements Validator<T> {
  constructor(private readonly schema: Schema<T>) {}

  validate(data: unknown): ValidationResult<T> {
    return this.safeParse(data);
  }

  async validateAsync(data: unknown): Promise<ValidationResult<T>> {
    return this.safeParseAsync(data);
  }

  parse(data: unknown): T {
    return this.schema.parse(data);
  }

  async parseAsync(data: unknown): Promise<T> {
    return this.schema.parseAsync(data);
  }

  safeParse(data: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: this.formatErrors(result.error),
    };
  }

  async safeParseAsync(data: unknown): Promise<ValidationResult<T>> {
    const result = await this.schema.safeParseAsync(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      errors: this.formatErrors(result.error),
    };
  }

  private formatErrors(error: ZodError): ValidationError[] {
    return error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }

  static create<T>(schema: Schema<T>): ZodValidator<T> {
    return new ZodValidator(schema);
  }
}
