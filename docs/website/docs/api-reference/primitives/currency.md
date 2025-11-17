---
id: currency
title: Currency
sidebar_label: Currency
---

# Currency

> **Package:** `@stratix/primitives`
> **Layer:** Layer 1 - Primitives
> **Since:** v0.1.0

## Overview

Immutable value object representing ISO 4217 currency codes with metadata. Currency instances are cached and provide information about symbols, decimal places, and countries where the currency is used.

**Key Features:**
- ISO 4217 compliant currency codes
- Pre-defined constants for major currencies
- Country association lookup
- Decimal place information
- Singleton pattern (cached instances)
- Immutable and type-safe

## Import

```typescript
import { Currency } from '@stratix/primitives';
```

## Type Signature

```typescript
class Currency extends ValueObject {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimalPlaces: number;

  static readonly USD: Currency;
  static readonly EUR: Currency;
  static readonly CLP: Currency;
  // ... other currencies

  static fromCode(code: string): Currency | undefined;
  
  getCountries(): CountryInfo[];
  isMajorCurrency(): boolean;
  hasDecimals(): boolean;
}
```

## Usage Examples

### Basic Usage

```typescript
const usd = Currency.USD;
console.log(usd.code);        // "USD"
console.log(usd.name);        // "United States Dollar"
console.log(usd.symbol);      // "$"
console.log(usd.decimalPlaces); // 2

const jpy = Currency.JPY;
console.log(jpy.decimalPlaces); // 0 (no cents)
```

### Dynamic Currency Loading

```typescript
const currency = Currency.fromCode('MXN');
if (currency) {
  console.log(currency.name);   // "Mexican Peso"
  console.log(currency.symbol); // "$"
}
```

### Country Information

```typescript
const euro = Currency.EUR;
const countries = euro.getCountries();
console.log(countries.length); // 19+ countries
console.log(countries.map(c => c.name)); // ['France', 'Germany', ...]
```

## Available Currencies

USD, EUR, GBP, JPY, CNY, CAD, AUD, CHF, INR, BRL, MXN, CLP, COP, PEN, ARS

## Best Practices

- **Do:** Use static constants for common currencies
- **Do:** Check fromCode() result before use
- **Do:** Use with Money value object
- **Don't:** Create custom Currency subclasses

## Related Components

- [Money](./money.md) - Monetary amounts with currency
- [ValueObject](./value-object.md) - Base class

## See Also

- [Package README](../../../packages/primitives/README.md)
- [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
