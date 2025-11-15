import { describe, it, expect } from 'vitest';
import { Money } from '../value-objects/Money.js';
import { Currency } from '../value-objects/Currency.js';

describe('Money', () => {
  describe('create', () => {
    it('should create money with valid amount', () => {
      const result = Money.create(100, Currency.USD);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(100);
        expect(result.value.currency).toBe(Currency.USD);
      }
    });

    it('should reject negative amounts', () => {
      const result = Money.create(-100, Currency.USD);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('NEGATIVE_AMOUNT');
      }
    });

    it('should reject non-finite amounts', () => {
      const result1 = Money.create(Infinity, Currency.USD);
      const result2 = Money.create(NaN, Currency.USD);

      expect(result1.isFailure).toBe(true);
      expect(result2.isFailure).toBe(true);

      if (result1.isFailure) {
        expect(result1.error.code).toBe('INVALID_AMOUNT');
      }
    });

    it('should accept zero', () => {
      const result = Money.create(0, Currency.USD);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(0);
      }
    });
  });

  describe('factory methods', () => {
    it('should create USD money', () => {
      const money = Money.USD(100);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe(Currency.USD);
    });

    it('should create EUR money', () => {
      const money = Money.EUR(100);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe(Currency.EUR);
    });

    it('should create GBP money', () => {
      const money = Money.GBP(100);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe(Currency.GBP);
    });

    it('should create JPY money', () => {
      const money = Money.JPY(100);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe(Currency.JPY);
    });
  });

  describe('add', () => {
    it('should add money with same currency', () => {
      const money1 = Money.USD(100);
      const money2 = Money.USD(50);
      const result = money1.add(money2);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(150);
        expect(result.value.currency).toBe(Currency.USD);
      }
    });

    it('should fail to add money with different currencies', () => {
      const money1 = Money.USD(100);
      const money2 = Money.EUR(50);
      const result = money1.add(money2);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('CURRENCY_MISMATCH');
        expect(result.error.message).toContain('USD');
        expect(result.error.message).toContain('EUR');
      }
    });

    it('should handle decimal amounts correctly', () => {
      const money1 = Money.USD(10.5);
      const money2 = Money.USD(20.3);
      const result = money1.add(money2);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBeCloseTo(30.8);
      }
    });
  });

  describe('subtract', () => {
    it('should subtract money with same currency', () => {
      const money1 = Money.USD(100);
      const money2 = Money.USD(30);
      const result = money1.subtract(money2);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(70);
        expect(result.value.currency).toBe(Currency.USD);
      }
    });

    it('should fail to subtract money with different currencies', () => {
      const money1 = Money.USD(100);
      const money2 = Money.EUR(30);
      const result = money1.subtract(money2);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('CURRENCY_MISMATCH');
      }
    });

    it('should fail if result would be negative', () => {
      const money1 = Money.USD(50);
      const money2 = Money.USD(100);
      const result = money1.subtract(money2);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('INSUFFICIENT_FUNDS');
      }
    });

    it('should allow subtraction to zero', () => {
      const money1 = Money.USD(100);
      const money2 = Money.USD(100);
      const result = money1.subtract(money2);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(0);
      }
    });
  });

  describe('multiply', () => {
    it('should multiply money by a factor', () => {
      const money = Money.USD(10);
      const result = money.multiply(3);

      expect(result.amount).toBe(30);
      expect(result.currency).toBe(Currency.USD);
    });

    it('should handle decimal factors', () => {
      const money = Money.USD(100);
      const result = money.multiply(0.5);

      expect(result.amount).toBe(50);
    });

    it('should handle negative factors', () => {
      const money = Money.USD(100);
      const result = money.multiply(-2);

      expect(result.amount).toBe(-200);
    });

    it('should handle zero factor', () => {
      const money = Money.USD(100);
      const result = money.multiply(0);

      expect(result.amount).toBe(0);
    });
  });

  describe('divide', () => {
    it('should divide money by a divisor', () => {
      const money = Money.USD(100);
      const result = money.divide(4);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(25);
        expect(result.value.currency).toBe(Currency.USD);
      }
    });

    it('should fail to divide by zero', () => {
      const money = Money.USD(100);
      const result = money.divide(0);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('DIVISION_BY_ZERO');
      }
    });

    it('should fail to divide by non-finite numbers', () => {
      const money = Money.USD(100);
      const result1 = money.divide(Infinity);
      const result2 = money.divide(NaN);

      expect(result1.isFailure).toBe(true);
      expect(result2.isFailure).toBe(true);
    });

    it('should handle decimal divisors', () => {
      const money = Money.USD(100);
      const result = money.divide(2.5);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(40);
      }
    });
  });

  describe('comparisons', () => {
    describe('isGreaterThan', () => {
      it('should return true when amount is greater', () => {
        const money1 = Money.USD(100);
        const money2 = Money.USD(50);

        expect(money1.isGreaterThan(money2)).toBe(true);
      });

      it('should return false when amount is less', () => {
        const money1 = Money.USD(50);
        const money2 = Money.USD(100);

        expect(money1.isGreaterThan(money2)).toBe(false);
      });

      it('should return false when amounts are equal', () => {
        const money1 = Money.USD(100);
        const money2 = Money.USD(100);

        expect(money1.isGreaterThan(money2)).toBe(false);
      });

      it('should throw for different currencies', () => {
        const money1 = Money.USD(100);
        const money2 = Money.EUR(50);

        expect(() => money1.isGreaterThan(money2)).toThrow();
      });
    });

    describe('isLessThan', () => {
      it('should return true when amount is less', () => {
        const money1 = Money.USD(50);
        const money2 = Money.USD(100);

        expect(money1.isLessThan(money2)).toBe(true);
      });

      it('should return false when amount is greater', () => {
        const money1 = Money.USD(100);
        const money2 = Money.USD(50);

        expect(money1.isLessThan(money2)).toBe(false);
      });

      it('should return false when amounts are equal', () => {
        const money1 = Money.USD(100);
        const money2 = Money.USD(100);

        expect(money1.isLessThan(money2)).toBe(false);
      });

      it('should throw for different currencies', () => {
        const money1 = Money.USD(100);
        const money2 = Money.EUR(50);

        expect(() => money1.isLessThan(money2)).toThrow();
      });
    });
  });

  describe('format', () => {
    it('should format USD', () => {
      const money = Money.USD(1234.56);
      const formatted = money.format('en-US');

      expect(formatted).toBe('$1,234.56');
    });

    it('should format EUR', () => {
      const money = Money.EUR(1234.56);
      const formatted = money.format('de-DE');

      expect(formatted).toContain('1'); // Contains the number
    });

    it('should format with default locale', () => {
      const money = Money.USD(100);
      const formatted = money.format();

      expect(formatted).toContain('100');
    });

    it('should format zero', () => {
      const money = Money.USD(0);
      const formatted = money.format();

      expect(formatted).toContain('0');
    });
  });

  describe('equals', () => {
    it('should be equal for same amount and currency', () => {
      const money1 = Money.USD(100);
      const money2 = Money.USD(100);

      expect(money1.equals(money2)).toBe(true);
    });

    it('should not be equal for different amounts', () => {
      const money1 = Money.USD(100);
      const money2 = Money.USD(200);

      expect(money1.equals(money2)).toBe(false);
    });

    it('should not be equal for different currencies', () => {
      const money1 = Money.USD(100);
      const money2 = Money.EUR(100);

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const money = Money.USD(100);
      const json = money.toJSON();

      expect(json).toEqual({
        amount: 100,
        currency: 'USD',
      });
    });

    it('should be serializable', () => {
      const money = Money.USD(123.45);
      const json = JSON.stringify(money);

      expect(json).toBe('{"amount":123.45,"currency":"USD"}');
    });
  });

  describe('real-world scenarios', () => {
    it('should calculate shopping cart total', () => {
      const item1 = Money.USD(29.99);
      const item2 = Money.USD(49.99);
      const item3 = Money.USD(19.99);

      const total = item1.add(item2).flatMap((subtotal) => subtotal.add(item3));

      expect(total.isSuccess).toBe(true);
      if (total.isSuccess) {
        expect(total.value.amount).toBeCloseTo(99.97);
      }
    });

    it('should apply discount', () => {
      const price = Money.USD(100);
      const discountPercent = 0.2; // 20% off
      const discountedPrice = price.multiply(1 - discountPercent);

      expect(discountedPrice.amount).toBe(80);
    });

    it('should split bill evenly', () => {
      const total = Money.USD(150);
      const people = 3;
      const result = total.divide(people);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(50);
      }
    });

    it('should handle tax calculation', () => {
      const subtotal = Money.USD(100);
      const taxRate = 0.08; // 8%
      const tax = subtotal.multiply(taxRate);
      const result = subtotal.add(tax);

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.amount).toBe(108);
      }
    });
  });
});
