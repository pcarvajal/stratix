import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

/**
 * Represents an email address with validation.
 *
 * Email is immutable and automatically normalized (trimmed and lowercased).
 *
 * @example
 * ```typescript
 * const result = Email.create('user@example.com');
 * if (result.isSuccess) {
 *   const email = result.value;
 *   console.log(email.value); // "user@example.com"
 *   console.log(email.domain); // "example.com"
 *   console.log(email.localPart); // "user"
 * }
 * ```
 */
export class Email extends ValueObject {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_LENGTH = 254; // RFC 5321

  private constructor(readonly value: string) {
    super();
  }

  /**
   * Creates an Email instance with validation.
   *
   * @param value - The email address string
   * @returns Success with Email or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = Email.create('user@example.com');
   * if (result.isSuccess) {
   *   console.log(result.value.value); // "user@example.com"
   * }
   *
   * const invalid = Email.create('not-an-email');
   * if (invalid.isFailure) {
   *   console.log(invalid.error.code); // "INVALID_EMAIL_FORMAT"
   * }
   * ```
   */
  static create(value: string): Result<Email, DomainError> {
    if (!value || typeof value !== 'string') {
      return Failure.create(new DomainError('EMPTY_EMAIL', 'Email cannot be empty'));
    }

    const trimmed = value.trim().toLowerCase();

    if (trimmed.length === 0) {
      return Failure.create(new DomainError('EMPTY_EMAIL', 'Email cannot be empty'));
    }

    if (trimmed.length > Email.MAX_LENGTH) {
      return Failure.create(
        new DomainError('EMAIL_TOO_LONG', `Email cannot exceed ${Email.MAX_LENGTH} characters`)
      );
    }

    if (!Email.EMAIL_REGEX.test(trimmed)) {
      return Failure.create(new DomainError('INVALID_EMAIL_FORMAT', 'Email format is invalid'));
    }

    return Success.create(new Email(trimmed));
  }

  /**
   * Gets the domain part of the email address.
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com').unwrap();
   * console.log(email.domain); // "example.com"
   * ```
   */
  get domain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Gets the local part (before @) of the email address.
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com').unwrap();
   * console.log(email.localPart); // "user"
   * ```
   */
  get localPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Checks if this email belongs to a specific domain.
   *
   * @param domain - The domain to check
   * @returns true if the email belongs to the domain
   *
   * @example
   * ```typescript
   * const email = Email.create('user@example.com').unwrap();
   * console.log(email.belongsToDomain('example.com')); // true
   * console.log(email.belongsToDomain('other.com')); // false
   * ```
   */
  belongsToDomain(domain: string): boolean {
    return this.domain.toLowerCase() === domain.toLowerCase();
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
