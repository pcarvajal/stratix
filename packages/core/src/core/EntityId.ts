import { randomUUID } from 'node:crypto';
import { ValueObject } from './ValueObject.js';

/**
 * Type-safe Entity ID with phantom types to prevent mixing IDs of different entity types.
 *
 * The phantom type parameter T is used to make IDs type-incompatible across different entities,
 * preventing common bugs like passing a UserId where an OrderId is expected.
 *
 * @template T - Phantom type representing the entity type (e.g., 'User', 'Order')
 *
 * @example
 * ```typescript
 * type UserId = EntityId<'User'>;
 * type OrderId = EntityId<'Order'>;
 *
 * const userId = EntityId.create<'User'>();
 * const orderId = EntityId.create<'Order'>();
 *
 * function getUser(id: UserId) { }
 *
 * getUser(userId);   // ✓ OK
 * getUser(orderId);  // ✗ Compile error: Type 'OrderId' is not assignable to type 'UserId'
 * ```
 */
export class EntityId<T extends string> extends ValueObject {
  private readonly _value: string;
  // @ts-expect-error - Phantom type for type safety, intentionally unused
  private readonly _brand!: T;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  /**
   * Creates a new EntityId with a random UUID.
   *
   * @template T - The entity type
   * @returns A new EntityId instance
   *
   * @example
   * ```typescript
   * const userId = EntityId.create<'User'>();
   * console.log(userId.value); // "550e8400-e29b-41d4-a716-446655440000"
   * ```
   */
  static create<T extends string>(): EntityId<T> {
    return new EntityId<T>(randomUUID());
  }

  /**
   * Creates an EntityId from an existing string value.
   * Useful when reconstructing entities from persistence.
   *
   * @template T - The entity type
   * @param value - The string representation of the ID
   * @returns An EntityId instance
   *
   * @example
   * ```typescript
   * const userId = EntityId.from<'User'>('550e8400-e29b-41d4-a716-446655440000');
   * ```
   */
  static from<T extends string>(value: string): EntityId<T> {
    return new EntityId<T>(value);
  }

  /**
   * Gets the string value of this EntityId.
   */
  get value(): string {
    return this._value;
  }

  /**
   * Returns the string representation of this EntityId.
   */
  toString(): string {
    return this._value;
  }

  /**
   * Returns the JSON representation of this EntityId.
   */
  toJSON(): string {
    return this._value;
  }

  protected getEqualityComponents(): unknown[] {
    return [this._value];
  }
}
