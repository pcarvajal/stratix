// @ts-nocheck
import { EventHandler, Logger } from '@stratix/abstractions';
import { TaskCompletedEvent } from '../../domain/events/TaskCompletedEvent.js';

export class TaskCompletedEventHandler implements EventHandler<TaskCompletedEvent> {
  constructor(private readonly logger: Logger) {}

  async handle(event: TaskCompletedEvent): Promise<void> {
    this.logger.info('Task completed', {
      taskId: event.taskId,
      completedAt: event.completedAt,
    });
  }
}
