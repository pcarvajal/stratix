import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

/**
 * Properties for creating an Address.
 */
export interface AddressProps {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

/**
 * Represents a physical address.
 *
 * Address is immutable and validates required fields.
 * Provides formatting and comparison capabilities.
 *
 * @example
 * ```typescript
 * const result = Address.create({
 *   street: '123 Main St',
 *   city: 'San Francisco',
 *   state: 'CA',
 *   postalCode: '94102',
 *   country: 'USA'
 * });
 * if (result.isSuccess) {
 *   const address = result.value;
 *   console.log(address.format());
 * }
 * ```
 */
export class Address extends ValueObject {
  private constructor(
    readonly street: string,
    readonly city: string,
    readonly state: string,
    readonly postalCode: string,
    readonly country: string,
    readonly additionalInfo?: string
  ) {
    super();
  }

  /**
   * Creates an Address instance with validation.
   *
   * @param props - The address properties
   * @returns Success with Address or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = Address.create({
   *   street: '123 Main St',
   *   city: 'San Francisco',
   *   state: 'CA',
   *   postalCode: '94102',
   *   country: 'USA',
   *   additionalInfo: 'Apt 4B'
   * });
   * ```
   */
  static create(props: AddressProps): Result<Address, DomainError> {
    const errors: string[] = [];

    if (!props.street || props.street.trim().length === 0) {
      errors.push('Street is required');
    }

    if (!props.city || props.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!props.state || props.state.trim().length === 0) {
      errors.push('State is required');
    }

    if (!props.postalCode || props.postalCode.trim().length === 0) {
      errors.push('Postal code is required');
    }

    if (!props.country || props.country.trim().length === 0) {
      errors.push('Country is required');
    }

    if (errors.length > 0) {
      return Failure.create(new DomainError('INVALID_ADDRESS', errors.join(', ')));
    }

    return Success.create(
      new Address(
        props.street.trim(),
        props.city.trim(),
        props.state.trim(),
        props.postalCode.trim(),
        props.country.trim(),
        props.additionalInfo?.trim()
      )
    );
  }

  /**
   * Formats the address as a single line string.
   *
   * @returns A formatted address string
   *
   * @example
   * ```typescript
   * const address = Address.create({
   *   street: '123 Main St',
   *   city: 'San Francisco',
   *   state: 'CA',
   *   postalCode: '94102',
   *   country: 'USA'
   * }).unwrap();
   * console.log(address.format());
   * // "123 Main St, San Francisco, CA 94102, USA"
   * ```
   */
  format(): string {
    const parts = [this.street];

    if (this.additionalInfo) {
      parts.push(this.additionalInfo);
    }

    parts.push(this.city);
    parts.push(`${this.state} ${this.postalCode}`);
    parts.push(this.country);

    return parts.join(', ');
  }

  /**
   * Formats the address as a multi-line string.
   *
   * @returns A multi-line formatted address string
   *
   * @example
   * ```typescript
   * const address = Address.create({
   *   street: '123 Main St',
   *   city: 'San Francisco',
   *   state: 'CA',
   *   postalCode: '94102',
   *   country: 'USA',
   *   additionalInfo: 'Apt 4B'
   * }).unwrap();
   * console.log(address.formatMultiline());
   * // 123 Main St
   * // Apt 4B
   * // San Francisco, CA 94102
   * // USA
   * ```
   */
  formatMultiline(): string {
    const lines = [this.street];

    if (this.additionalInfo) {
      lines.push(this.additionalInfo);
    }

    lines.push(`${this.city}, ${this.state} ${this.postalCode}`);
    lines.push(this.country);

    return lines.join('\n');
  }

  /**
   * Checks if this address is in the same city as another address.
   *
   * @param other - The other address to compare
   * @returns true if both addresses are in the same city
   *
   * @example
   * ```typescript
   * const addr1 = Address.create({...}).unwrap();
   * const addr2 = Address.create({...}).unwrap();
   * console.log(addr1.isSameCity(addr2));
   * ```
   */
  isSameCity(other: Address): boolean {
    return (
      this.city.toLowerCase() === other.city.toLowerCase() &&
      this.state.toLowerCase() === other.state.toLowerCase() &&
      this.country.toLowerCase() === other.country.toLowerCase()
    );
  }

  /**
   * Checks if this address is in the same country as another address.
   *
   * @param other - The other address to compare
   * @returns true if both addresses are in the same country
   *
   * @example
   * ```typescript
   * const addr1 = Address.create({...}).unwrap();
   * const addr2 = Address.create({...}).unwrap();
   * console.log(addr1.isSameCountry(addr2));
   * ```
   */
  isSameCountry(other: Address): boolean {
    return this.country.toLowerCase() === other.country.toLowerCase();
  }

  protected getEqualityComponents(): unknown[] {
    return [
      this.street.toLowerCase(),
      this.city.toLowerCase(),
      this.state.toLowerCase(),
      this.postalCode.toLowerCase(),
      this.country.toLowerCase(),
      this.additionalInfo?.toLowerCase() || '',
    ];
  }

  toString(): string {
    return this.format();
  }

  toJSON(): AddressProps {
    return {
      street: this.street,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      additionalInfo: this.additionalInfo,
    };
  }
}
