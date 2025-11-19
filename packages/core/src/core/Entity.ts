import { EntityId } from './EntityId.js';

/**
 * Base class for Entities in Domain-Driven Design.
 *
 * Entities are objects that have a distinct identity that runs through time and different representations.
 * They are compared by their identity rather than their attributes.
 *
 * @template T - Phantom type representing the entity type (e.g., 'User', 'Order')
 *
 * @example
 * ```typescript
 * class User extends Entity<'User'> {
 *   constructor(
 *     id: EntityId<'User'>,
 *     private email: string,
 *     private name: string
 *   ) {
 *     super(id, new Date(), new Date());
 *   }
 *
 *   changeName(newName: string): void {
 *     this.name = newName;
 *     this.touch(); // Update the updatedAt timestamp
 *   }
 * }
 * ```
 */
export abstract class Entity<T extends string> {
  protected constructor(
    private readonly _id: EntityId<T>,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  /**
   * Gets the unique identifier of this entity.
   */
  get id(): EntityId<T> {
    return this._id;
  }

  /**
   * Gets the timestamp when this entity was created.
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Gets the timestamp when this entity was last updated.
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Updates the updatedAt timestamp to the current time.
   * Should be called whenever the entity's state changes.
   *
   * @protected
   */
  protected touch(): void {
    this._updatedAt = new Date();
  }

  /**
   * Compares this entity with another for equality based on identity.
   * Two entities are equal if they have the same ID and are of the same type.
   *
   * @param other - The other entity to compare with
   * @returns true if the entities are equal, false otherwise
   */
  equals(other: Entity<T>): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }

    return this._id.equals(other._id);
  }
}
