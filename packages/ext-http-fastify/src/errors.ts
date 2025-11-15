import type { HttpError } from './types.js';

export class HttpErrorImpl extends Error implements HttpError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): HttpErrorImpl {
    return new HttpErrorImpl(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: unknown): HttpErrorImpl {
    return new HttpErrorImpl(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message: string = 'Forbidden', details?: unknown): HttpErrorImpl {
    return new HttpErrorImpl(message, 403, 'FORBIDDEN', details);
  }

  static notFound(message: string = 'Not found', details?: unknown): HttpErrorImpl {
    return new HttpErrorImpl(message, 404, 'NOT_FOUND', details);
  }

  static conflict(message: string, details?: unknown): HttpErrorImpl {
    return new HttpErrorImpl(message, 409, 'CONFLICT', details);
  }

  static unprocessableEntity(message: string, details?: unknown): HttpErrorImpl {
    return new HttpErrorImpl(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }

  static internalServerError(
    message: string = 'Internal server error',
    details?: unknown
  ): HttpErrorImpl {
    return new HttpErrorImpl(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }

  static serviceUnavailable(
    message: string = 'Service unavailable',
    details?: unknown
  ): HttpErrorImpl {
    return new HttpErrorImpl(message, 503, 'SERVICE_UNAVAILABLE', details);
  }

  toJSON() {
    const result: Record<string, unknown> = {
      error: this.code || 'ERROR',
      message: this.message,
      statusCode: this.statusCode,
    };

    if (this.details) {
      result.details = this.details;
    }

    return result;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof HttpErrorImpl ||
    (typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as Record<string, unknown>).statusCode === 'number')
  );
}
