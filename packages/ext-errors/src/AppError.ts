import { ErrorCode, ErrorSeverity } from './ErrorCode.js';

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly statusCode: number;
  abstract readonly severity: ErrorSeverity;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      severity: this.severity,
      details: this.details,
    };
  }
}

export class BadRequestError extends AppError {
  readonly code = ErrorCode.BAD_REQUEST;
  readonly statusCode = 400;
  readonly severity = ErrorSeverity.LOW;
}

export class UnauthorizedError extends AppError {
  readonly code = ErrorCode.UNAUTHORIZED;
  readonly statusCode = 401;
  readonly severity = ErrorSeverity.MEDIUM;
}

export class ForbiddenError extends AppError {
  readonly code = ErrorCode.FORBIDDEN;
  readonly statusCode = 403;
  readonly severity = ErrorSeverity.MEDIUM;
}

export class NotFoundError extends AppError {
  readonly code = ErrorCode.NOT_FOUND;
  readonly statusCode = 404;
  readonly severity = ErrorSeverity.LOW;
}

export class ConflictError extends AppError {
  readonly code = ErrorCode.CONFLICT;
  readonly statusCode = 409;
  readonly severity = ErrorSeverity.MEDIUM;
}

export class UnprocessableEntityError extends AppError {
  readonly code = ErrorCode.UNPROCESSABLE_ENTITY;
  readonly statusCode = 422;
  readonly severity = ErrorSeverity.LOW;
}

export class InternalServerError extends AppError {
  readonly code = ErrorCode.INTERNAL_SERVER_ERROR;
  readonly statusCode = 500;
  readonly severity = ErrorSeverity.CRITICAL;
}

export class DatabaseError extends AppError {
  readonly code = ErrorCode.DATABASE_ERROR;
  readonly statusCode = 500;
  readonly severity = ErrorSeverity.HIGH;
}

export class ExternalServiceError extends AppError {
  readonly code = ErrorCode.EXTERNAL_SERVICE_ERROR;
  readonly statusCode = 503;
  readonly severity = ErrorSeverity.HIGH;
}
