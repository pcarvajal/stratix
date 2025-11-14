/**
 * Specification Pattern for encapsulating business rules and validation logic.
 *
 * Specifications allow you to compose complex business rules using logical operators
 * (AND, OR, NOT) while keeping each rule independently testable and reusable.
 *
 * @template T - The type of object this specification validates
 *
 * @example
 * ```typescript
 * class CustomerIsActiveSpec extends Specification<Customer> {
 *   isSatisfiedBy(customer: Customer): boolean {
 *     return customer.status === 'active';
 *   }
 * }
 *
 * class CustomerHasMinimumBalanceSpec extends Specification<Customer> {
 *   constructor(private minBalance: number) {
 *     super();
 *   }
 *
 *   isSatisfiedBy(customer: Customer): boolean {
 *     return customer.balance >= this.minBalance;
 *   }
 * }
 *
 * // Compose specifications
 * const eligibleForLoan = new CustomerIsActiveSpec()
 *   .and(new CustomerHasMinimumBalanceSpec(1000));
 *
 * if (eligibleForLoan.isSatisfiedBy(customer)) {
 *   // Process loan application
 * }
 * ```
 */
export abstract class Specification<T> {
  /**
   * Checks if the candidate satisfies this specification.
   *
   * @param candidate - The object to check
   * @returns true if the candidate satisfies this specification
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * Creates a new specification that is satisfied only if both this specification
   * AND the other specification are satisfied.
   *
   * @param other - The other specification to combine with
   * @returns A new specification representing the AND operation
   *
   * @example
   * ```typescript
   * const activeAndPremium = isActive.and(isPremium);
   * ```
   */
  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * Creates a new specification that is satisfied if either this specification
   * OR the other specification is satisfied.
   *
   * @param other - The other specification to combine with
   * @returns A new specification representing the OR operation
   *
   * @example
   * ```typescript
   * const activeOrVip = isActive.or(isVip);
   * ```
   */
  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * Creates a new specification that is satisfied only if this specification
   * is NOT satisfied.
   *
   * @returns A new specification representing the NOT operation
   *
   * @example
   * ```typescript
   * const notSuspended = isSuspended.not();
   * ```
   */
  not(): Specification<T> {
    return new NotSpecification(this);
  }

  /**
   * Checks if the candidate satisfies this specification and returns a detailed result.
   *
   * This method can be overridden to provide more detailed error messages when
   * a specification is not satisfied.
   *
   * @param candidate - The object to check
   * @returns A result object with success status and optional error message
   */
  check(candidate: T): SpecificationResult {
    const satisfied = this.isSatisfiedBy(candidate);
    return {
      satisfied,
      reason: satisfied ? undefined : 'Specification not satisfied',
    };
  }
}

/**
 * Result of a specification check with optional reason for failure
 */
export interface SpecificationResult {
  readonly satisfied: boolean;
  readonly reason?: string;
}

/**
 * Specification that is satisfied when both specifications are satisfied
 * @private
 */
class AndSpecification<T> extends Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }

  check(candidate: T): SpecificationResult {
    const leftResult = this.left.check(candidate);
    if (!leftResult.satisfied) {
      return leftResult;
    }

    const rightResult = this.right.check(candidate);
    if (!rightResult.satisfied) {
      return rightResult;
    }

    return { satisfied: true };
  }
}

/**
 * Specification that is satisfied when either specification is satisfied
 * @private
 */
class OrSpecification<T> extends Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }

  check(candidate: T): SpecificationResult {
    const leftResult = this.left.check(candidate);
    if (leftResult.satisfied) {
      return { satisfied: true };
    }

    const rightResult = this.right.check(candidate);
    if (rightResult.satisfied) {
      return { satisfied: true };
    }

    return {
      satisfied: false,
      reason: `Neither condition satisfied: ${leftResult.reason || 'left'} and ${rightResult.reason || 'right'}`,
    };
  }
}

/**
 * Specification that is satisfied when the wrapped specification is NOT satisfied
 * @private
 */
class NotSpecification<T> extends Specification<T> {
  constructor(private wrapped: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.wrapped.isSatisfiedBy(candidate);
  }

  check(candidate: T): SpecificationResult {
    const result = this.wrapped.check(candidate);
    return {
      satisfied: !result.satisfied,
      reason: result.satisfied ? 'Specification should not be satisfied' : undefined,
    };
  }
}

/**
 * Utility function to create a specification from a predicate function
 *
 * @param predicate - A function that returns true if the candidate satisfies the specification
 * @returns A new specification wrapping the predicate
 *
 * @example
 * ```typescript
 * const isAdult = fromPredicate<Person>(p => p.age >= 18);
 * const isEligible = isAdult.and(fromPredicate(p => p.hasValidId));
 * ```
 */
export function fromPredicate<T>(
  predicate: (candidate: T) => boolean,
  description?: string
): Specification<T> {
  return new PredicateSpecification(predicate, description);
}

/**
 * Specification created from a predicate function
 * @private
 */
class PredicateSpecification<T> extends Specification<T> {
  constructor(
    private predicate: (candidate: T) => boolean,
    private description?: string
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.predicate(candidate);
  }

  check(candidate: T): SpecificationResult {
    const satisfied = this.isSatisfiedBy(candidate);
    return {
      satisfied,
      reason: satisfied ? undefined : this.description || 'Predicate not satisfied',
    };
  }
}
