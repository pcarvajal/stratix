// @ts-nocheck
import { ValueObject } from '@stratix/primitives';

export interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  static create(props: MoneyProps): Money {
    this.validate(props);
    return new Money(props);
  }

  private static validate(props: MoneyProps): void {
    if (props.amount < 0) {
      throw new Error('Invalid Money: amount cannot be negative');
    }

    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error('Invalid Money: currency cannot be empty');
    }

    if (props.currency.length !== 3) {
      throw new Error('Invalid Money: currency must be a 3-letter code (e.g., USD, EUR)');
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }

    return Money.create({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }

    return Money.create({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }

  multiply(factor: number): Money {
    return Money.create({
      amount: this.amount * factor,
      currency: this.currency,
    });
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
