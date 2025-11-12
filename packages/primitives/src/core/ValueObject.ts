/**
 * Base class for Value Objects in Domain-Driven Design.
 *
 * Value Objects are immutable objects that represent descriptive aspects of the domain
 * with no conceptual identity. They are compared by their structural content rather than identity.
 *
 * @example
 * ```typescript
 * class Email extends ValueObject {
 *   constructor(private readonly value: string) {
 *     super();
 *   }
 *
 *   protected getEqualityComponents(): unknown[] {
 *     return [this.value];
 *   }
 * }
 *
 * const email1 = new Email('user@example.com');
 * const email2 = new Email('user@example.com');
 * console.log(email1.equals(email2)); // true
 * ```
 */
export abstract class ValueObject {
  /**
   * Returns the components that determine equality for this Value Object.
   * Two Value Objects are equal if all their equality components are equal.
   *
   * @returns An array of values used for equality comparison
   */
  protected abstract getEqualityComponents(): unknown[];

  /**
   * Compares this Value Object with another for equality.
   * Value Objects are equal if they are of the same type and all equality components match.
   *
   * @param other - The other Value Object to compare with
   * @returns true if the Value Objects are equal, false otherwise
   */
  equals(other: ValueObject): boolean {
    if (!(other instanceof this.constructor)) {
      return false;
    }

    const thisComponents = this.getEqualityComponents();
    const otherComponents = other.getEqualityComponents();

    if (thisComponents.length !== otherComponents.length) {
      return false;
    }

    return thisComponents.every((component, index) => {
      const otherComponent = otherComponents[index];

      if (component instanceof ValueObject) {
        return component.equals(otherComponent as ValueObject);
      }

      if (Array.isArray(component) && Array.isArray(otherComponent)) {
        return this.arraysEqual(component, otherComponent);
      }

      return component === otherComponent;
    });
  }

  private arraysEqual(arr1: unknown[], arr2: unknown[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }

    return arr1.every((item, index) => {
      const otherItem = arr2[index];

      if (item instanceof ValueObject && otherItem instanceof ValueObject) {
        return item.equals(otherItem);
      }

      return item === otherItem;
    });
  }
}
