export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
