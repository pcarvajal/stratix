/**
 * Base error class for domain-related errors.
 *
 * DomainError represents violations of business rules or domain invariants.
 * Unlike technical errors, domain errors are expected and should be handled gracefully.
 *
 * @example
 * ```typescript
 * throw new DomainError('INVALID_EMAIL', 'Email format is invalid');
 * ```
 */
export class DomainError extends Error {
  /**
   * Creates a new DomainError.
   *
   * @param code - A unique error code for programmatic handling
   * @param message - A human-readable error message
   */
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  /**
   * Returns a JSON representation of this error.
   */
  toJSON(): { code: string; message: string; name: string } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
    };
  }
}
