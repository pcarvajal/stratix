import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

/**
 * Represents a percentage value with validation and formatting.
 *
 * Percentage is immutable and can be created from decimal (0.5) or percentage (50) values.
 * Supports common percentage operations and formatting.
 *
 * @example
 * ```typescript
 * const result = Percentage.fromDecimal(0.25);
 * if (result.isSuccess) {
 *   const pct = result.value;
 *   console.log(pct.asPercentage()); // 25
 *   console.log(pct.format()); // "25%"
 * }
 * ```
 */
export class Percentage extends ValueObject {
  private constructor(readonly value: number) {
    super();
  }

  /**
   * Creates a Percentage from a decimal value (0-1).
   *
   * @param value - The decimal value (e.g., 0.25 for 25%)
   * @returns Success with Percentage or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = Percentage.fromDecimal(0.25);
   * if (result.isSuccess) {
   *   console.log(result.value.asPercentage()); // 25
   * }
   * ```
   */
  static fromDecimal(value: number): Result<Percentage, DomainError> {
    if (!Number.isFinite(value)) {
      return Failure.create(
        new DomainError('INVALID_PERCENTAGE', 'Percentage must be a finite number')
      );
    }

    if (value < 0 || value > 1) {
      return Failure.create(
        new DomainError('PERCENTAGE_OUT_OF_RANGE', 'Decimal percentage must be between 0 and 1')
      );
    }

    return Success.create(new Percentage(value));
  }

  /**
   * Creates a Percentage from a percentage value (0-100).
   *
   * @param value - The percentage value (e.g., 25 for 25%)
   * @returns Success with Percentage or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = Percentage.fromPercentage(25);
   * if (result.isSuccess) {
   *   console.log(result.value.asDecimal()); // 0.25
   * }
   * ```
   */
  static fromPercentage(value: number): Result<Percentage, DomainError> {
    if (!Number.isFinite(value)) {
      return Failure.create(
        new DomainError('INVALID_PERCENTAGE', 'Percentage must be a finite number')
      );
    }

    if (value < 0 || value > 100) {
      return Failure.create(
        new DomainError('PERCENTAGE_OUT_OF_RANGE', 'Percentage must be between 0 and 100')
      );
    }

    return Success.create(new Percentage(value / 100));
  }

  /**
   * Creates a Percentage representing 0%.
   *
   * @returns A Percentage instance representing 0%
   *
   * @example
   * ```typescript
   * const zero = Percentage.zero();
   * console.log(zero.asPercentage()); // 0
   * ```
   */
  static zero(): Percentage {
    return new Percentage(0);
  }

  /**
   * Creates a Percentage representing 100%.
   *
   * @returns A Percentage instance representing 100%
   *
   * @example
   * ```typescript
   * const full = Percentage.full();
   * console.log(full.asPercentage()); // 100
   * ```
   */
  static full(): Percentage {
    return new Percentage(1);
  }

  /**
   * Gets the value as a decimal (0-1).
   *
   * @returns The decimal representation
   *
   * @example
   * ```typescript
   * const pct = Percentage.fromPercentage(25).unwrap();
   * console.log(pct.asDecimal()); // 0.25
   * ```
   */
  asDecimal(): number {
    return this.value;
  }

  /**
   * Gets the value as a percentage (0-100).
   *
   * @returns The percentage representation
   *
   * @example
   * ```typescript
   * const pct = Percentage.fromDecimal(0.25).unwrap();
   * console.log(pct.asPercentage()); // 25
   * ```
   */
  asPercentage(): number {
    return this.value * 100;
  }

  /**
   * Applies this percentage to a number.
   *
   * @param amount - The amount to apply the percentage to
   * @returns The calculated result
   *
   * @example
   * ```typescript
   * const discount = Percentage.fromPercentage(20).unwrap();
   * const price = 100;
   * console.log(discount.of(price)); // 20
   * ```
   */
  of(amount: number): number {
    return amount * this.value;
  }

  /**
   * Adds another percentage to this one.
   *
   * @param other - The percentage to add
   * @returns Success with new Percentage or Failure if result exceeds 100%
   *
   * @example
   * ```typescript
   * const a = Percentage.fromPercentage(25).unwrap();
   * const b = Percentage.fromPercentage(30).unwrap();
   * const result = a.add(b);
   * // result.value.asPercentage() === 55
   * ```
   */
  add(other: Percentage): Result<Percentage, DomainError> {
    const newValue = this.value + other.value;

    if (newValue > 1) {
      return Failure.create(
        new DomainError('PERCENTAGE_OVERFLOW', 'Sum of percentages exceeds 100%')
      );
    }

    return Success.create(new Percentage(newValue));
  }

  /**
   * Subtracts another percentage from this one.
   *
   * @param other - The percentage to subtract
   * @returns Success with new Percentage or Failure if result is negative
   *
   * @example
   * ```typescript
   * const a = Percentage.fromPercentage(50).unwrap();
   * const b = Percentage.fromPercentage(20).unwrap();
   * const result = a.subtract(b);
   * // result.value.asPercentage() === 30
   * ```
   */
  subtract(other: Percentage): Result<Percentage, DomainError> {
    const newValue = this.value - other.value;

    if (newValue < 0) {
      return Failure.create(
        new DomainError('PERCENTAGE_UNDERFLOW', 'Subtraction would result in negative percentage')
      );
    }

    return Success.create(new Percentage(newValue));
  }

  /**
   * Multiplies this percentage by a factor.
   *
   * @param factor - The multiplication factor
   * @returns Success with new Percentage or Failure if result exceeds 100%
   *
   * @example
   * ```typescript
   * const pct = Percentage.fromPercentage(25).unwrap();
   * const result = pct.multiply(2);
   * // result.value.asPercentage() === 50
   * ```
   */
  multiply(factor: number): Result<Percentage, DomainError> {
    if (!Number.isFinite(factor)) {
      return Failure.create(new DomainError('INVALID_FACTOR', 'Factor must be a finite number'));
    }

    const newValue = this.value * factor;

    if (newValue < 0 || newValue > 1) {
      return Failure.create(
        new DomainError('PERCENTAGE_OUT_OF_RANGE', 'Result would be outside valid range (0-100%)')
      );
    }

    return Success.create(new Percentage(newValue));
  }

  /**
   * Checks if this percentage is zero.
   *
   * @returns true if the percentage is 0%
   *
   * @example
   * ```typescript
   * const zero = Percentage.zero();
   * console.log(zero.isZero()); // true
   * ```
   */
  isZero(): boolean {
    return this.value === 0;
  }

  /**
   * Checks if this percentage is 100%.
   *
   * @returns true if the percentage is 100%
   *
   * @example
   * ```typescript
   * const full = Percentage.full();
   * console.log(full.isFull()); // true
   * ```
   */
  isFull(): boolean {
    return this.value === 1;
  }

  /**
   * Formats the percentage as a string.
   *
   * @param decimals - Number of decimal places (default: 0)
   * @returns A formatted string representation
   *
   * @example
   * ```typescript
   * const pct = Percentage.fromDecimal(0.2575).unwrap();
   * console.log(pct.format()); // "25.75%"
   * console.log(pct.format(0)); // "26%"
   * console.log(pct.format(1)); // "25.8%"
   * ```
   */
  format(decimals = 2): string {
    return `${this.asPercentage().toFixed(decimals)}%`;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.value];
  }

  toString(): string {
    return this.format();
  }

  toJSON(): number {
    return this.value;
  }
}
