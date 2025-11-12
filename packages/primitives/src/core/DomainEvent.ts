/**
 * Base interface for Domain Events in Domain-Driven Design.
 *
 * Domain Events represent something that happened in the domain that domain experts care about.
 * They are immutable facts about the past.
 *
 * @example
 * ```typescript
 * interface UserCreatedEvent extends DomainEvent {
 *   readonly userId: string;
 *   readonly email: string;
 * }
 *
 * const event: UserCreatedEvent = {
 *   occurredAt: new Date(),
 *   userId: '123',
 *   email: 'user@example.com'
 * };
 * ```
 */
export interface DomainEvent {
  /**
   * The timestamp when this event occurred.
   */
  readonly occurredAt: Date;
}
