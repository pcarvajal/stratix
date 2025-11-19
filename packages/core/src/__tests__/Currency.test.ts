import { describe, it, expect } from 'vitest';
import { Currency } from '../value-objects/Currency.js';

describe('Currency', () => {
  describe('predefined currencies', () => {
    it('should have USD', () => {
      expect(Currency.USD.code).toBe('USD');
      expect(Currency.USD.name).toBe('US Dollar');
      expect(Currency.USD.symbol).toBe('$');
      expect(Currency.USD.decimalPlaces).toBe(2);
    });

    it('should have EUR', () => {
      expect(Currency.EUR.code).toBe('EUR');
      expect(Currency.EUR.name).toBe('Euro');
      expect(Currency.EUR.symbol).toBe('€');
      expect(Currency.EUR.decimalPlaces).toBe(2);
    });

    it('should have GBP', () => {
      expect(Currency.GBP.code).toBe('GBP');
      expect(Currency.GBP.name).toBe('British Pound');
      expect(Currency.GBP.symbol).toBe('£');
      expect(Currency.GBP.decimalPlaces).toBe(2);
    });

    it('should have JPY', () => {
      expect(Currency.JPY.code).toBe('JPY');
      expect(Currency.JPY.name).toBe('Japanese Yen');
      expect(Currency.JPY.symbol).toBe('¥');
      expect(Currency.JPY.decimalPlaces).toBe(0);
    });

    it('should have CNY', () => {
      expect(Currency.CNY.code).toBe('CNY');
      expect(Currency.CNY.name).toBe('Chinese Yuan');
      expect(Currency.CNY.symbol).toBe('¥');
      expect(Currency.CNY.decimalPlaces).toBe(2);
    });

    it('should have MXN', () => {
      expect(Currency.MXN.code).toBe('MXN');
      expect(Currency.MXN.name).toBe('Mexican Peso');
      expect(Currency.MXN.symbol).toBe('$');
      expect(Currency.MXN.decimalPlaces).toBe(2);
    });

    it('should have BRL', () => {
      expect(Currency.BRL.code).toBe('BRL');
      expect(Currency.BRL.name).toBe('Brazilian Real');
      expect(Currency.BRL.symbol).toBe('R$');
      expect(Currency.BRL.decimalPlaces).toBe(2);
    });

    it('should have INR', () => {
      expect(Currency.INR.code).toBe('INR');
      expect(Currency.INR.name).toBe('Indian Rupee');
      expect(Currency.INR.symbol).toBe('₹');
      expect(Currency.INR.decimalPlaces).toBe(2);
    });

    it('should have CAD', () => {
      expect(Currency.CAD.code).toBe('CAD');
      expect(Currency.CAD.name).toBe('Canadian Dollar');
      expect(Currency.CAD.symbol).toBe('$');
      expect(Currency.CAD.decimalPlaces).toBe(2);
    });

    it('should have AUD', () => {
      expect(Currency.AUD.code).toBe('AUD');
      expect(Currency.AUD.name).toBe('Australian Dollar');
      expect(Currency.AUD.symbol).toBe('$');
      expect(Currency.AUD.decimalPlaces).toBe(2);
    });
  });

  describe('equals', () => {
    it('should be equal for same currency', () => {
      expect(Currency.USD.equals(Currency.USD)).toBe(true);
      expect(Currency.EUR.equals(Currency.EUR)).toBe(true);
    });

    it('should not be equal for different currencies', () => {
      expect(Currency.USD.equals(Currency.EUR)).toBe(false);
      expect(Currency.GBP.equals(Currency.JPY)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return currency code', () => {
      expect(Currency.USD.toString()).toBe('USD');
      expect(Currency.EUR.toString()).toBe('EUR');
      expect(Currency.GBP.toString()).toBe('GBP');
    });
  });

  describe('decimal places', () => {
    it('should have 2 decimal places for most currencies', () => {
      expect(Currency.USD.decimalPlaces).toBe(2);
      expect(Currency.EUR.decimalPlaces).toBe(2);
      expect(Currency.GBP.decimalPlaces).toBe(2);
    });

    it('should have 0 decimal places for JPY', () => {
      expect(Currency.JPY.decimalPlaces).toBe(0);
    });
  });

  describe('singleton behavior', () => {
    it('should be same instance', () => {
      const usd1 = Currency.USD;
      const usd2 = Currency.USD;

      expect(usd1).toBe(usd2);
    });
  });
});
