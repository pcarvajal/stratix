import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';
import { randomUUID } from 'crypto';

/**
 * Represents a UUID (Universally Unique Identifier) with validation.
 *
 * UUID is immutable and validates the UUID format (version 4).
 * Provides convenient generation and validation methods.
 *
 * @example
 * ```typescript
 * const uuid = UUID.generate();
 * console.log(uuid.value); // "550e8400-e29b-41d4-a716-446655440000"
 *
 * const result = UUID.create('550e8400-e29b-41d4-a716-446655440000');
 * if (result.isSuccess) {
 *   console.log(result.value.value);
 * }
 * ```
 */
export class UUID extends ValueObject {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(readonly value: string) {
    super();
  }

  /**
   * Creates a UUID instance with validation.
   *
   * @param value - The UUID string
   * @returns Success with UUID or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = UUID.create('550e8400-e29b-41d4-a716-446655440000');
   * if (result.isSuccess) {
   *   console.log(result.value.value);
   * }
   *
   * const invalid = UUID.create('not-a-uuid');
   * if (invalid.isFailure) {
   *   console.log(invalid.error.code); // "INVALID_UUID_FORMAT"
   * }
   * ```
   */
  static create(value: string): Result<UUID, DomainError> {
    if (!value || typeof value !== 'string') {
      return Failure.create(new DomainError('EMPTY_UUID', 'UUID cannot be empty'));
    }

    const trimmed = value.trim().toLowerCase();

    if (trimmed.length === 0) {
      return Failure.create(new DomainError('EMPTY_UUID', 'UUID cannot be empty'));
    }

    if (!UUID.UUID_REGEX.test(trimmed)) {
      return Failure.create(
        new DomainError(
          'INVALID_UUID_FORMAT',
          'UUID must be in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        )
      );
    }

    return Success.create(new UUID(trimmed));
  }

  /**
   * Generates a new random UUID (version 4).
   *
   * @returns A new UUID instance
   *
   * @example
   * ```typescript
   * const uuid = UUID.generate();
   * console.log(uuid.value); // "550e8400-e29b-41d4-a716-446655440000"
   * ```
   */
  static generate(): UUID {
    return new UUID(randomUUID());
  }

  /**
   * Checks if a string is a valid UUID.
   *
   * @param value - The string to validate
   * @returns true if the string is a valid UUID
   *
   * @example
   * ```typescript
   * console.log(UUID.isValid('550e8400-e29b-41d4-a716-446655440000')); // true
   * console.log(UUID.isValid('not-a-uuid')); // false
   * ```
   */
  static isValid(value: string): boolean {
    return UUID.UUID_REGEX.test(value);
  }

  /**
   * Gets the UUID version.
   *
   * @returns The version number (1-5)
   *
   * @example
   * ```typescript
   * const uuid = UUID.generate();
   * console.log(uuid.version()); // 4
   * ```
   */
  version(): number {
    return parseInt(this.value.charAt(14), 16);
  }

  /**
   * Gets the UUID variant.
   *
   * @returns The variant identifier
   *
   * @example
   * ```typescript
   * const uuid = UUID.generate();
   * console.log(uuid.variant());
   * ```
   */
  variant(): string {
    const variantChar = this.value.charAt(19);
    const variantValue = parseInt(variantChar, 16);

    if ((variantValue & 0x8) === 0) return 'NCS';
    if ((variantValue & 0xc) === 0x8) return 'RFC4122';
    if ((variantValue & 0xe) === 0xc) return 'Microsoft';
    return 'Reserved';
  }

  /**
   * Converts the UUID to uppercase format.
   *
   * @returns The UUID in uppercase
   *
   * @example
   * ```typescript
   * const uuid = UUID.create('550e8400-e29b-41d4-a716-446655440000').unwrap();
   * console.log(uuid.toUpperCase()); // "550E8400-E29B-41D4-A716-446655440000"
   * ```
   */
  toUpperCase(): string {
    return this.value.toUpperCase();
  }

  /**
   * Removes hyphens from the UUID.
   *
   * @returns The UUID without hyphens
   *
   * @example
   * ```typescript
   * const uuid = UUID.create('550e8400-e29b-41d4-a716-446655440000').unwrap();
   * console.log(uuid.toCompact()); // "550e8400e29b41d4a716446655440000"
   * ```
   */
  toCompact(): string {
    return this.value.replace(/-/g, '');
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
