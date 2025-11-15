// @ts-nocheck
import { DomainEvent } from '@stratix/primitives';
import { UserId } from '../../../../../shared/types/CommonTypes.js';

/**
 * Domain Event - Internal to Users context
 */
export class UserRegisteredEvent implements DomainEvent {
  readonly occurredAt: Date;

  constructor(
    readonly userId: UserId,
    readonly email: string,
    readonly name: string
  ) {
    this.occurredAt = new Date();
  }
}
