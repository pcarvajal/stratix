import { ValueObject } from '../core/ValueObject.js';
import { Result, Success, Failure } from '../result/Result.js';
import { DomainError } from '../errors/DomainError.js';
import { Currency } from './Currency.js';
import { CountryRegistry, type CountryInfo } from './CountryRegistry.js';

/**
 * Represents a monetary amount with a specific currency.
 *
 * Money is immutable and all operations return new Money instances.
 * Operations between Money objects with different currencies will fail.
 *
 * @example
 * ```typescript
 * const price = Money.USD(99.99);
 * const quantity = 3;
 * const total = price.multiply(quantity);
 *
 * console.log(total.format()); // "$299.97"
 *
 * const discount = Money.USD(10);
 * const finalPrice = total.subtract(discount);
 * if (finalPrice.isSuccess) {
 *   console.log(finalPrice.value.format()); // "$289.97"
 * }
 * ```
 */
export class Money extends ValueObject {
  private constructor(
    readonly amount: number,
    readonly currency: Currency
  ) {
    super();
  }

  /**
   * Creates a Money instance with validation.
   *
   * @param amount - The monetary amount
   * @param currency - The currency
   * @returns Success with Money or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = Money.create(100, Currency.USD);
   * if (result.isSuccess) {
   *   console.log(result.value.format()); // "$100.00"
   * }
   * ```
   */
  static create(amount: number, currency: Currency): Result<Money, DomainError> {
    if (!Number.isFinite(amount)) {
      return Failure.create(new DomainError('INVALID_AMOUNT', 'Amount must be a finite number'));
    }

    if (amount < 0) {
      return Failure.create(new DomainError('NEGATIVE_AMOUNT', 'Amount cannot be negative'));
    }

    return Success.create(new Money(amount, currency));
  }

  /**
   * Creates a Money instance in Chilean Pesos.
   *
   * @param amount - The amount in Chilean Pesos
   * @returns A Money instance
   *
   * @example
   * ```typescript
   * const price = Money.CLP(5000);
   * ```
   */
  static CLP(amount: number): Money {
    return new Money(amount, Currency.CLP);
  }

  /**
   * Creates a Money instance in Colombian Pesos.
   *
   * @param amount - The amount in Colombian Pesos.
   * @returns A Money instance
   *
   * @example
   * ```typescript
   * const price = Money.COP(300);
   * ```
   */
  static COP(amount: number): Money {
    return new Money(amount, Currency.COP);
  }

  /**
   * Creates a Money instance in Peruvian Sol.
   *
   * @param amount - The amount in Peruvian Sol.
   * @returns A Money instance
   *
   * @example
   * ```typescript
   * const price = Money.PEN(5000);
   * ```
   */
  static PEN(amount: number): Money {
    return new Money(amount, Currency.PEN);
  }

  /**
   * Creates a Money instance in Argentine Pesos.
   *
   * @param amount - The amount in Argentine Pesos
   * @returns A Money instance
   *
   * @example
   * ```typescript
   * const price = Money.ARS(1000);
   * ```
   */
  static ARS(amount: number): Money {
    return new Money(amount, Currency.ARS);
  }

  /**
   * Creates a Money instance from a currency code.
   *
   * @param amount - The monetary amount
   * @param currencyCode - The ISO 4217 currency code
   * @returns Success with Money or Failure with DomainError
   *
   * @example
   * ```typescript
   * const result = Money.fromCurrencyCode(100, 'MXN');
   * if (result.isSuccess) {
   *   console.log(result.value.format()); // "$100.00"
   * }
   * ```
   */
  static fromCurrencyCode(amount: number, currencyCode: string): Result<Money, DomainError> {
    const currency = Currency.fromCode(currencyCode);

    if (!currency) {
      return Failure.create(
        new DomainError('UNKNOWN_CURRENCY', `Currency code "${currencyCode}" is not supported`)
      );
    }

    return Money.create(amount, currency);
  }

  /**
   * Creates a Money instance in US Dollars.
   *
   * @param amount - The amount in USD
   * @returns A Money instance
   *
   * @example
   * ```typescript
   * const price = Money.USD(99.99);
   * ```
   */
  static USD(amount: number): Money {
    return new Money(amount, Currency.USD);
  }

  /**
   * Creates a Money instance in Euros.
   *
   * @param amount - The amount in EUR
   * @returns A Money instance
   */
  static EUR(amount: number): Money {
    return new Money(amount, Currency.EUR);
  }

  /**
   * Creates a Money instance in British Pounds.
   *
   * @param amount - The amount in GBP
   * @returns A Money instance
   */
  static GBP(amount: number): Money {
    return new Money(amount, Currency.GBP);
  }

  /**
   * Creates a Money instance in Japanese Yen.
   *
   * @param amount - The amount in JPY
   * @returns A Money instance
   */
  static JPY(amount: number): Money {
    return new Money(amount, Currency.JPY);
  }

  /**
   * Adds another Money amount to this one.
   * Both Money objects must have the same currency.
   *
   * @param other - The Money to add
   * @returns Success with new Money or Failure with DomainError
   *
   * @example
   * ```typescript
   * const a = Money.USD(100);
   * const b = Money.USD(50);
   * const result = a.add(b);
   * // result.value.amount === 150
   * ```
   */
  add(other: Money): Result<Money, DomainError> {
    if (!this.currency.equals(other.currency)) {
      return Failure.create(
        new DomainError(
          'CURRENCY_MISMATCH',
          `Cannot add ${other.currency.code} to ${this.currency.code}`
        )
      );
    }

    return Success.create(new Money(this.amount + other.amount, this.currency));
  }

  /**
   * Subtracts another Money amount from this one.
   * Both Money objects must have the same currency.
   * Result cannot be negative.
   *
   * @param other - The Money to subtract
   * @returns Success with new Money or Failure with DomainError
   *
   * @example
   * ```typescript
   * const a = Money.USD(100);
   * const b = Money.USD(30);
   * const result = a.subtract(b);
   * // result.value.amount === 70
   * ```
   */
  subtract(other: Money): Result<Money, DomainError> {
    if (!this.currency.equals(other.currency)) {
      return Failure.create(
        new DomainError(
          'CURRENCY_MISMATCH',
          `Cannot subtract ${other.currency.code} from ${this.currency.code}`
        )
      );
    }

    const newAmount = this.amount - other.amount;

    if (newAmount < 0) {
      return Failure.create(
        new DomainError('INSUFFICIENT_FUNDS', 'Subtraction would result in negative amount')
      );
    }

    return Success.create(new Money(newAmount, this.currency));
  }

  /**
   * Multiplies this Money by a factor.
   *
   * @param factor - The multiplication factor
   * @returns A new Money instance
   *
   * @example
   * ```typescript
   * const price = Money.USD(10);
   * const total = price.multiply(3);
   * // total.amount === 30
   * ```
   */
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Divides this Money by a divisor.
   *
   * @param divisor - The division divisor
   * @returns Success with new Money or Failure with DomainError
   *
   * @example
   * ```typescript
   * const total = Money.USD(100);
   * const result = total.divide(4);
   * // result.value.amount === 25
   * ```
   */
  divide(divisor: number): Result<Money, DomainError> {
    if (divisor === 0) {
      return Failure.create(new DomainError('DIVISION_BY_ZERO', 'Cannot divide by zero'));
    }

    if (!Number.isFinite(divisor)) {
      return Failure.create(new DomainError('INVALID_DIVISOR', 'Divisor must be a finite number'));
    }

    return Success.create(new Money(this.amount / divisor, this.currency));
  }

  /**
   * Checks if this Money is greater than another.
   *
   * @param other - The Money to compare with
   * @returns true if this Money is greater
   */
  isGreaterThan(other: Money): boolean {
    if (!this.currency.equals(other.currency)) {
      throw new DomainError(
        'CURRENCY_MISMATCH',
        `Cannot compare ${this.currency.code} with ${other.currency.code}`
      );
    }
    return this.amount > other.amount;
  }

  /**
   * Checks if this Money is less than another.
   *
   * @param other - The Money to compare with
   * @returns true if this Money is less
   */
  isLessThan(other: Money): boolean {
    if (!this.currency.equals(other.currency)) {
      throw new DomainError(
        'CURRENCY_MISMATCH',
        `Cannot compare ${this.currency.code} with ${other.currency.code}`
      );
    }
    return this.amount < other.amount;
  }

  /**
   * Formats this Money as a string according to the locale.
   *
   * @param locale - The locale to use for formatting (default: 'en-US')
   * @returns A formatted string representation
   *
   * @example
   * ```typescript
   * const price = Money.USD(1234.56);
   * console.log(price.format()); // "$1,234.56"
   * console.log(price.format('de-DE')); // "1.234,56 $"
   * ```
   */
  format(locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency.code,
    }).format(this.amount);
  }

  /**
   * Gets all countries that use this money's currency.
   *
   * @returns Array of country information
   *
   * @example
   * ```typescript
   * const euros = Money.EUR(100);
   * const countries = euros.getCountries();
   * console.log(countries.map(c => c.name)); // ['France', 'Germany', ...]
   * ```
   */
  getCountries(): CountryInfo[] {
    return this.currency.getCountries();
  }

  /**
   * Checks if this money's currency is used in a specific country.
   *
   * @param countryCode - The ISO2 country code
   * @returns true if the currency is used in the country
   *
   * @example
   * ```typescript
   * const euros = Money.EUR(100);
   * console.log(euros.isValidForCountry('FR')); // true
   * console.log(euros.isValidForCountry('US')); // false
   * ```
   */
  isValidForCountry(countryCode: string): boolean {
    const country = CountryRegistry.getByISO2(countryCode);
    if (!country) {
      return false;
    }
    return country.currencyCode === this.currency.code;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.amount, this.currency.code];
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency.code,
    };
  }
}
