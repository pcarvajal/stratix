// @ts-nocheck
import { DomainEvent } from '@stratix/primitives';

export class TaskCompletedEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly taskId: string,
    public readonly completedAt: Date
  ) {
    this.occurredAt = new Date();
  }
}
