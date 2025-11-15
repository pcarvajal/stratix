// @ts-nocheck
import { ProductId, Money } from '../../../../../shared/types/CommonTypes.js';

export interface OrderItemProps {
  productId: ProductId;
  quantity: number;
  unitPrice: Money;
}

export class OrderItem {
  constructor(private readonly props: OrderItemProps) {
    if (props.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (props.unitPrice.amount < 0) {
      throw new Error('Unit price cannot be negative');
    }
  }

  get productId(): ProductId {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get totalPrice(): Money {
    return {
      amount: this.props.unitPrice.amount * this.props.quantity,
      currency: this.props.unitPrice.currency,
    };
  }

  equals(other: OrderItem): boolean {
    return (
      this.props.productId.toString() === other.props.productId.toString() &&
      this.props.quantity === other.props.quantity &&
      this.props.unitPrice.amount === other.props.unitPrice.amount &&
      this.props.unitPrice.currency === other.props.unitPrice.currency
    );
  }

  static create(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }
}
