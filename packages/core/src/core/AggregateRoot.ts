import { Entity } from './Entity.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Base class for Aggregate Roots in Domain-Driven Design.
 *
 * An Aggregate Root is the entry point to an aggregate, which is a cluster of domain objects
 * that can be treated as a single unit. The Aggregate Root ensures the consistency of changes
 * within the aggregate boundary and manages domain events.
 *
 * @template T - Phantom type representing the aggregate type (e.g., 'User', 'Order')
 *
 * @example
 * ```typescript
 * class Order extends AggregateRoot<'Order'> {
 *   constructor(id: EntityId<'Order'>, private items: OrderItem[]) {
 *     super(id, new Date(), new Date());
 *   }
 *
 *   addItem(item: OrderItem): void {
 *     this.items.push(item);
 *     this.record({ occurredAt: new Date(), orderId: this.id.value, itemId: item.id });
 *     this.touch();
 *   }
 *
 *   checkout(): void {
 *     // Business logic...
 *     this.record({ occurredAt: new Date(), orderId: this.id.value });
 *   }
 * }
 *
 * // Later, publish events:
 * const events = order.pullDomainEvents();
 * await eventBus.publish(events);
 * ```
 */
export abstract class AggregateRoot<T extends string> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  /**
   * Records a domain event that occurred within this aggregate.
   * Events are stored internally and can be retrieved later for publishing.
   *
   * @param event - The domain event to record
   * @protected
   *
   * @example
   * ```typescript
   * this.record({
   *   occurredAt: new Date(),
   *   userId: this.id.value,
   *   email: 'user@example.com'
   * });
   * ```
   */
  protected record(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Retrieves and clears all domain events recorded by this aggregate.
   * This is typically called after the aggregate is persisted, to publish the events.
   *
   * @returns An array of domain events
   *
   * @example
   * ```typescript
   * await repository.save(order);
   * const events = order.pullDomainEvents();
   * await eventBus.publish(events);
   * ```
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /**
   * Checks if this aggregate has any recorded domain events.
   *
   * @returns true if there are pending domain events, false otherwise
   */
  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}
