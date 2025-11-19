import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';
import { CountryCallingCodeRegistry } from './CountryCallingCode.js';

/**
 * Represents a phone number with international format support.
 *
 * PhoneNumber is immutable and automatically normalizes the format.
 * Supports E.164 format validation (international standard).
 *
 * @example
 * ```typescript
 * const result = PhoneNumber.create('+1234567890');
 * if (result.isSuccess) {
 *   const phone = result.value;
 *   console.log(phone.value); // "+1234567890"
 *   console.log(phone.countryCode); // "+1"
 * }
 * ```
 */
export class PhoneNumber extends ValueObject {
  private static readonly E164_REGEX = /^\+[1-9]\d{1,14}$/;
  private static readonly DIGIT_REGEX = /\d/g;

  private constructor(readonly value: string) {
    super();
  }

  /**
   * Creates a PhoneNumber instance with validation.
   * Accepts various formats and normalizes to E.164 format.
   *
   * @param value - The phone number string (with or without formatting)
   * @returns Success with PhoneNumber or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = PhoneNumber.create('+1 (555) 123-4567');
   * if (result.isSuccess) {
   *   console.log(result.value.value); // "+15551234567"
   * }
   *
   * const invalid = PhoneNumber.create('invalid');
   * if (invalid.isFailure) {
   *   console.log(invalid.error.code); // "INVALID_PHONE_FORMAT"
   * }
   * ```
   */
  static create(value: string): Result<PhoneNumber, DomainError> {
    if (!value || typeof value !== 'string') {
      return Failure.create(new DomainError('EMPTY_PHONE', 'Phone number cannot be empty'));
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return Failure.create(new DomainError('EMPTY_PHONE', 'Phone number cannot be empty'));
    }

    const normalized = PhoneNumber.normalize(trimmed);

    if (!PhoneNumber.E164_REGEX.test(normalized)) {
      return Failure.create(
        new DomainError(
          'INVALID_PHONE_FORMAT',
          'Phone number must be in international format (E.164), e.g., +1234567890'
        )
      );
    }

    return Success.create(new PhoneNumber(normalized));
  }

  /**
   * Normalizes a phone number string by removing all non-digit characters except leading +.
   *
   * @param value - The phone number to normalize
   * @returns The normalized phone number
   */
  private static normalize(value: string): string {
    const hasPlus = value.startsWith('+');
    const digits = value.match(PhoneNumber.DIGIT_REGEX)?.join('') || '';
    return hasPlus ? `+${digits}` : digits;
  }

  /**
   * Gets the country code from the phone number.
   * Uses the CountryCallingCodeRegistry for accurate code detection.
   *
   * @example
   * ```typescript
   * const phone = PhoneNumber.create('+1234567890').unwrap();
   * console.log(phone.countryCode); // "+1"
   * ```
   */
  get countryCode(): string {
    const info = CountryCallingCodeRegistry.findCode(this.value);
    return info?.code || '';
  }

  /**
   * Gets the national number (without country code).
   *
   * @example
   * ```typescript
   * const phone = PhoneNumber.create('+1234567890').unwrap();
   * console.log(phone.nationalNumber); // "234567890"
   * ```
   */
  get nationalNumber(): string {
    return this.value.substring(this.countryCode.length);
  }

  /**
   * Gets the country name for this phone number.
   *
   * @returns The country name or undefined if not found
   *
   * @example
   * ```typescript
   * const phone = PhoneNumber.create('+52123456789').unwrap();
   * console.log(phone.getCountryName()); // "Mexico"
   * ```
   */
  getCountryName(): string | undefined {
    const info = CountryCallingCodeRegistry.findCode(this.value);
    return info?.country;
  }

  /**
   * Gets the ISO 2-letter country code.
   *
   * @returns The ISO2 code or undefined if not found
   *
   * @example
   * ```typescript
   * const phone = PhoneNumber.create('+52123456789').unwrap();
   * console.log(phone.getISO2()); // "MX"
   * ```
   */
  getISO2(): string | undefined {
    const info = CountryCallingCodeRegistry.findCode(this.value);
    return info?.iso2;
  }

  /**
   * Gets the ISO 3-letter country code.
   *
   * @returns The ISO3 code or undefined if not found
   *
   * @example
   * ```typescript
   * const phone = PhoneNumber.create('+52123456789').unwrap();
   * console.log(phone.getISO3()); // "MEX"
   * ```
   */
  getISO3(): string | undefined {
    const info = CountryCallingCodeRegistry.findCode(this.value);
    return info?.iso3;
  }

  /**
   * Formats the phone number in a human-readable format.
   *
   * @returns A formatted phone number string
   *
   * @example
   * ```typescript
   * const phone = PhoneNumber.create('+15551234567').unwrap();
   * console.log(phone.format()); // "+1 (555) 123-4567"
   * ```
   */
  format(): string {
    const cc = this.countryCode;
    const national = this.nationalNumber;

    if (cc === '+1' && national.length === 10) {
      return `${cc} (${national.substring(0, 3)}) ${national.substring(3, 6)}-${national.substring(6)}`;
    }

    if (national.length >= 8) {
      const groups = national.match(/.{1,4}/g) || [];
      return `${cc} ${groups.join(' ')}`;
    }

    return this.value;
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
