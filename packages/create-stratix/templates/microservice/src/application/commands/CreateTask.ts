// @ts-nocheck
import { Command, CommandHandler, EventBus } from '@stratix/abstractions';
import { Result, Success, Failure } from '@stratix/primitives';
import { Task } from '../../domain/entities/Task.js';
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';

export interface CreateTaskInput {
  title: string;
  description: string;
}

export interface CreateTaskOutput {
  id: string;
}

export class CreateTask implements Command {
  constructor(public readonly data: CreateTaskInput) {}
}

export class CreateTaskHandler implements CommandHandler<CreateTask, Result<CreateTaskOutput>> {
  constructor(
    private readonly repository: TaskRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateTask): Promise<Result<CreateTaskOutput>> {
    try {
      const { title, description } = command.data;

      const task = Task.create(title, description);
      await this.repository.save(task);

      const events = task.pullDomainEvents();
      await this.eventBus.publish(events);

      return Success.create({ id: task.id.toString() });
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
