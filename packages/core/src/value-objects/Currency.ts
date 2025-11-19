import { ValueObject } from '../core/ValueObject.js';
import { CountryRegistry, type CountryInfo } from './CountryRegistry.js';

/**
 * Represents a currency code following ISO 4217 standard.
 *
 * Currency instances are created from the CountryRegistry which provides
 * comprehensive currency information including symbols and decimal places.
 *
 * @example
 * ```typescript
 * const usd = Currency.USD;
 * const eur = Currency.EUR;
 * const mxn = Currency.fromCode('MXN');
 * ```
 */
export class Currency extends ValueObject {
  private static readonly CURRENCY_CACHE = new Map<string, Currency>();

  // Pre-defined currency instances for common currencies (initialized lazily)
  private static _USD?: Currency;
  private static _EUR?: Currency;
  private static _GBP?: Currency;
  private static _JPY?: Currency;
  private static _CNY?: Currency;
  private static _CAD?: Currency;
  private static _AUD?: Currency;
  private static _CHF?: Currency;
  private static _INR?: Currency;
  private static _BRL?: Currency;
  private static _MXN?: Currency;
  private static _CLP?: Currency;
  private static _COP?: Currency;
  private static _PEN?: Currency;
  private static _ARS?: Currency;

  static get USD(): Currency {
    return (this._USD ??= Currency.fromCode('USD')!);
  }
  static get EUR(): Currency {
    return (this._EUR ??= Currency.fromCode('EUR')!);
  }
  static get GBP(): Currency {
    return (this._GBP ??= Currency.fromCode('GBP')!);
  }
  static get JPY(): Currency {
    return (this._JPY ??= Currency.fromCode('JPY')!);
  }
  static get CNY(): Currency {
    return (this._CNY ??= Currency.fromCode('CNY')!);
  }
  static get CAD(): Currency {
    return (this._CAD ??= Currency.fromCode('CAD')!);
  }
  static get AUD(): Currency {
    return (this._AUD ??= Currency.fromCode('AUD')!);
  }
  static get CHF(): Currency {
    return (this._CHF ??= Currency.fromCode('CHF')!);
  }
  static get INR(): Currency {
    return (this._INR ??= Currency.fromCode('INR')!);
  }
  static get BRL(): Currency {
    return (this._BRL ??= Currency.fromCode('BRL')!);
  }
  static get MXN(): Currency {
    return (this._MXN ??= Currency.fromCode('MXN')!);
  }
  static get CLP(): Currency {
    return (this._CLP ??= Currency.fromCode('CLP')!);
  }
  static get COP(): Currency {
    return (this._COP ??= Currency.fromCode('COP')!);
  }
  static get PEN(): Currency {
    return (this._PEN ??= Currency.fromCode('PEN')!);
  }
  static get ARS(): Currency {
    return (this._ARS ??= Currency.fromCode('ARS')!);
  }

  private constructor(
    readonly code: string,
    readonly name: string,
    readonly symbol: string,
    readonly decimalPlaces: number
  ) {
    super();
  }

  /**
   * Creates a Currency instance from a currency code.
   * Uses data from CountryRegistry to populate currency information.
   *
   * @param code - The ISO 4217 currency code (e.g., "USD", "EUR")
   * @returns Currency instance or undefined if not found
   *
   * @example
   * ```typescript
   * const currency = Currency.fromCode('MXN');
   * console.log(currency?.name); // "Mexican Peso"
   * console.log(currency?.symbol); // "$"
   * ```
   */
  static fromCode(code: string): Currency | undefined {
    const upperCode = code.toUpperCase();

    // Check cache first
    if (this.CURRENCY_CACHE.has(upperCode)) {
      return this.CURRENCY_CACHE.get(upperCode);
    }

    // Find any country that uses this currency
    const countries = CountryRegistry.getByCurrency(upperCode);
    if (countries.length === 0) {
      return undefined;
    }

    // Use the first country's currency information
    const countryInfo = countries[0];
    const decimalPlaces = this.getDecimalPlaces(upperCode);

    const currency = new Currency(
      upperCode,
      countryInfo.currencyName,
      countryInfo.currencySymbol,
      decimalPlaces
    );

    // Cache the currency
    this.CURRENCY_CACHE.set(upperCode, currency);

    return currency;
  }

  /**
   * Gets the standard number of decimal places for a currency.
   * Most currencies use 2 decimal places, but some use 0 (like JPY, CLP).
   *
   * @param code - The currency code
   * @returns Number of decimal places
   */
  private static getDecimalPlaces(code: string): number {
    // Currencies with no decimal places
    const noDecimals = new Set(['JPY', 'KRW', 'CLP', 'VND', 'ISK', 'COP']);

    // Currencies with 3 decimal places
    const threeDecimals = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'OMR', 'TND']);

    if (noDecimals.has(code)) {
      return 0;
    }

    if (threeDecimals.has(code)) {
      return 3;
    }

    // Default is 2 decimal places
    return 2;
  }

  /**
   * Gets all countries that use this currency.
   *
   * @returns Array of country information
   *
   * @example
   * ```typescript
   * const euro = Currency.EUR;
   * const euroCountries = euro.getCountries();
   * console.log(euroCountries.length); // 19+ countries
   * ```
   */
  getCountries(): CountryInfo[] {
    return CountryRegistry.getByCurrency(this.code);
  }

  /**
   * Checks if this is a major world currency.
   * Major currencies are those widely used in international trade and finance.
   *
   * @returns true if this is a major currency
   */
  isMajorCurrency(): boolean {
    const majorCurrencies = new Set(['USD', 'EUR', 'JPY', 'GBP', 'CHF', 'CAD', 'AUD']);
    return majorCurrencies.has(this.code);
  }

  /**
   * Checks if this currency uses decimal places.
   *
   * @returns true if the currency uses decimal places
   */
  hasDecimals(): boolean {
    return this.decimalPlaces > 0;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.code];
  }

  toString(): string {
    return this.code;
  }

  toJSON(): string {
    return this.code;
  }
}
