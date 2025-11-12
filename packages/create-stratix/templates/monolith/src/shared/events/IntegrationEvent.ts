// @ts-nocheck
import { DomainEvent, EntityId } from '@stratix/primitives';

/**
 * Integration Event - Used for communication between bounded contexts
 *
 * Unlike domain events which are internal to a bounded context,
 * integration events cross context boundaries and represent
 * facts that other contexts might be interested in.
 */
export abstract class IntegrationEvent implements DomainEvent {
  readonly occurredAt: Date;
  readonly eventId: string;
  readonly contextName: string;

  constructor(contextName: string) {
    this.occurredAt = new Date();
    this.eventId = EntityId.create<'Event'>().toString();
    this.contextName = contextName;
  }

  abstract get eventType(): string;
}
