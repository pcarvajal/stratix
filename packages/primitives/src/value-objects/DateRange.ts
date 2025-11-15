import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';

/**
 * Represents a date range with start and end dates.
 *
 * DateRange is immutable and ensures that the end date is not before the start date.
 * Provides utility methods for checking overlaps, containment, and duration.
 *
 * @example
 * ```typescript
 * const result = DateRange.create(
 *   new Date('2024-01-01'),
 *   new Date('2024-12-31')
 * );
 * if (result.isSuccess) {
 *   const range = result.value;
 *   console.log(range.durationInDays()); // 365
 * }
 * ```
 */
export class DateRange extends ValueObject {
  private constructor(
    readonly startDate: Date,
    readonly endDate: Date
  ) {
    super();
  }

  /**
   * Creates a DateRange instance with validation.
   *
   * @param startDate - The start date of the range
   * @param endDate - The end date of the range
   * @returns Success with DateRange or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-12-31')
   * );
   * if (result.isSuccess) {
   *   console.log(result.value.startDate); // 2024-01-01
   * }
   *
   * const invalid = DateRange.create(
   *   new Date('2024-12-31'),
   *   new Date('2024-01-01')
   * );
   * if (invalid.isFailure) {
   *   console.log(invalid.error.code); // "INVALID_DATE_RANGE"
   * }
   * ```
   */
  static create(startDate: Date, endDate: Date): Result<DateRange, DomainError> {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      return Failure.create(new DomainError('INVALID_START_DATE', 'Start date is invalid'));
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      return Failure.create(new DomainError('INVALID_END_DATE', 'End date is invalid'));
    }

    if (endDate < startDate) {
      return Failure.create(
        new DomainError('INVALID_DATE_RANGE', 'End date cannot be before start date')
      );
    }

    return Success.create(new DateRange(new Date(startDate), new Date(endDate)));
  }

  /**
   * Creates a DateRange from ISO date strings.
   *
   * @param startDateStr - The start date as ISO string
   * @param endDateStr - The end date as ISO string
   * @returns Success with DateRange or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = DateRange.fromStrings('2024-01-01', '2024-12-31');
   * ```
   */
  static fromStrings(startDateStr: string, endDateStr: string): Result<DateRange, DomainError> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    return DateRange.create(startDate, endDate);
  }

  /**
   * Calculates the duration of the range in milliseconds.
   *
   * @returns The duration in milliseconds
   *
   * @example
   * ```typescript
   * const range = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-01-02')
   * ).unwrap();
   * console.log(range.durationInMs()); // 86400000
   * ```
   */
  durationInMs(): number {
    return this.endDate.getTime() - this.startDate.getTime();
  }

  /**
   * Calculates the duration of the range in days.
   *
   * @returns The duration in days
   *
   * @example
   * ```typescript
   * const range = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-01-08')
   * ).unwrap();
   * console.log(range.durationInDays()); // 7
   * ```
   */
  durationInDays(): number {
    return Math.floor(this.durationInMs() / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if a date is within this range (inclusive).
   *
   * @param date - The date to check
   * @returns true if the date is within the range
   *
   * @example
   * ```typescript
   * const range = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-12-31')
   * ).unwrap();
   * console.log(range.contains(new Date('2024-06-15'))); // true
   * console.log(range.contains(new Date('2025-01-01'))); // false
   * ```
   */
  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Checks if this range overlaps with another range.
   *
   * @param other - The other DateRange to check
   * @returns true if the ranges overlap
   *
   * @example
   * ```typescript
   * const range1 = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-06-30')
   * ).unwrap();
   * const range2 = DateRange.create(
   *   new Date('2024-06-01'),
   *   new Date('2024-12-31')
   * ).unwrap();
   * console.log(range1.overlaps(range2)); // true
   * ```
   */
  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  /**
   * Checks if this range completely contains another range.
   *
   * @param other - The other DateRange to check
   * @returns true if this range contains the other range
   *
   * @example
   * ```typescript
   * const range1 = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-12-31')
   * ).unwrap();
   * const range2 = DateRange.create(
   *   new Date('2024-06-01'),
   *   new Date('2024-06-30')
   * ).unwrap();
   * console.log(range1.containsRange(range2)); // true
   * ```
   */
  containsRange(other: DateRange): boolean {
    return this.startDate <= other.startDate && this.endDate >= other.endDate;
  }

  /**
   * Checks if this range is adjacent to another range (touching but not overlapping).
   *
   * @param other - The other DateRange to check
   * @returns true if the ranges are adjacent
   *
   * @example
   * ```typescript
   * const range1 = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-06-30')
   * ).unwrap();
   * const range2 = DateRange.create(
   *   new Date('2024-07-01'),
   *   new Date('2024-12-31')
   * ).unwrap();
   * console.log(range1.isAdjacentTo(range2)); // true
   * ```
   */
  isAdjacentTo(other: DateRange): boolean {
    const oneDayMs = 1000 * 60 * 60 * 24;
    const thisEndPlusOne = new Date(this.endDate.getTime() + oneDayMs);
    const otherEndPlusOne = new Date(other.endDate.getTime() + oneDayMs);

    return (
      thisEndPlusOne.toDateString() === other.startDate.toDateString() ||
      otherEndPlusOne.toDateString() === this.startDate.toDateString()
    );
  }

  /**
   * Creates a new DateRange that is the intersection of this range and another.
   *
   * @param other - The other DateRange
   * @returns Success with intersection DateRange or Failure if no overlap
   *
   * @example
   * ```typescript
   * const range1 = DateRange.create(
   *   new Date('2024-01-01'),
   *   new Date('2024-06-30')
   * ).unwrap();
   * const range2 = DateRange.create(
   *   new Date('2024-06-01'),
   *   new Date('2024-12-31')
   * ).unwrap();
   * const intersection = range1.intersection(range2);
   * // intersection.value covers 2024-06-01 to 2024-06-30
   * ```
   */
  intersection(other: DateRange): Result<DateRange, DomainError> {
    if (!this.overlaps(other)) {
      return Failure.create(new DomainError('NO_OVERLAP', 'Date ranges do not overlap'));
    }

    const startDate = this.startDate > other.startDate ? this.startDate : other.startDate;
    const endDate = this.endDate < other.endDate ? this.endDate : other.endDate;

    return DateRange.create(startDate, endDate);
  }

  protected getEqualityComponents(): unknown[] {
    return [this.startDate.getTime(), this.endDate.getTime()];
  }

  toString(): string {
    return `${this.startDate.toISOString()} - ${this.endDate.toISOString()}`;
  }

  toJSON(): { startDate: string; endDate: string } {
    return {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
    };
  }
}
