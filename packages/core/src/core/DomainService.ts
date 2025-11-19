/**
 * Base class for Domain Services in Domain-Driven Design.
 *
 * Domain Services encapsulate domain logic that:
 * - Doesn't naturally fit within an Entity or Value Object
 * - Operates on multiple aggregates
 * - Represents a significant process or transformation in the domain
 *
 * Unlike Application Services, Domain Services contain pure domain logic
 * and have no dependencies on infrastructure concerns.
 *
 * @example
 * ```typescript
 * class MoneyTransferService extends DomainService {
 *   readonly name = 'MoneyTransferService';
 *
 *   transfer(
 *     from: BankAccount,
 *     to: BankAccount,
 *     amount: Money
 *   ): Result<void, DomainError> {
 *     // Validate transfer
 *     if (!from.canWithdraw(amount)) {
 *       return Result.fail(
 *         new DomainError('INSUFFICIENT_FUNDS', 'Account has insufficient funds')
 *       );
 *     }
 *
 *     if (!from.currency.equals(amount.currency)) {
 *       return Result.fail(
 *         new DomainError('CURRENCY_MISMATCH', 'Currency mismatch')
 *       );
 *     }
 *
 *     // Perform transfer
 *     from.withdraw(amount);
 *     to.deposit(amount);
 *
 *     // Record domain events
 *     from.record({
 *       occurredAt: new Date(),
 *       accountId: from.id.value,
 *       amount: amount.value,
 *       type: 'withdrawal'
 *     });
 *
 *     to.record({
 *       occurredAt: new Date(),
 *       accountId: to.id.value,
 *       amount: amount.value,
 *       type: 'deposit'
 *     });
 *
 *     return Result.ok(undefined);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * class OrderPricingService extends DomainService {
 *   readonly name = 'OrderPricingService';
 *
 *   calculateTotal(order: Order, customer: Customer): Money {
 *     let total = order.subtotal;
 *
 *     // Apply customer discount
 *     if (customer.isPremium()) {
 *       total = total.multiply(0.9); // 10% discount
 *     }
 *
 *     // Add shipping
 *     const shipping = this.calculateShipping(order, customer);
 *     total = total.add(shipping);
 *
 *     // Add taxes
 *     const tax = this.calculateTax(total, customer.address);
 *     total = total.add(tax);
 *
 *     return total;
 *   }
 *
 *   private calculateShipping(order: Order, customer: Customer): Money {
 *     // Shipping logic
 *   }
 *
 *   private calculateTax(amount: Money, address: Address): Money {
 *     // Tax calculation logic
 *   }
 * }
 * ```
 */
export abstract class DomainService {
  /**
   * Unique name identifying this domain service
   */
  abstract readonly name: string;
}

/**
 * Utility type for domain service method signatures
 *
 * @example
 * ```typescript
 * type TransferMethod = DomainServiceMethod<
 *   [BankAccount, BankAccount, Money],
 *   Result<void, DomainError>
 * >;
 * ```
 */
export type DomainServiceMethod<TArgs extends unknown[], TReturn> = (...args: TArgs) => TReturn;

/**
 * Utility type for async domain service method signatures
 *
 * @example
 * ```typescript
 * type ValidateTransferMethod = AsyncDomainServiceMethod<
 *   [BankAccount, Money],
 *   Result<boolean, DomainError>
 * >;
 * ```
 */
export type AsyncDomainServiceMethod<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;
