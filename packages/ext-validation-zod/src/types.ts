import type { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidatorOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

export interface Validator<T> {
  validate(data: unknown): ValidationResult<T>;
  validateAsync(data: unknown): Promise<ValidationResult<T>>;
  parse(data: unknown): T;
  parseAsync(data: unknown): Promise<T>;
  safeParse(data: unknown): ValidationResult<T>;
  safeParseAsync(data: unknown): Promise<ValidationResult<T>>;
}

export type Schema<T = unknown> = z.ZodType<T>;
