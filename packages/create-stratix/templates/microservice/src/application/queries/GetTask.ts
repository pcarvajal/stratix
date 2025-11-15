// @ts-nocheck
import { Query, QueryHandler } from '@stratix/abstractions';
import { Result, Success, Failure, EntityId } from '@stratix/primitives';
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';

export interface GetTaskInput {
  id: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetTask implements Query {
  constructor(public readonly data: GetTaskInput) {}
}

export class GetTaskHandler implements QueryHandler<GetTask, Result<TaskDto>> {
  constructor(private readonly repository: TaskRepository) {}

  async handle(query: GetTask): Promise<Result<TaskDto>> {
    try {
      const taskId = EntityId.from(query.data.id);
      const task = await this.repository.findById(taskId);

      if (!task) {
        return Failure.create(new Error('Task not found'));
      }

      const dto: TaskDto = {
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };

      return Success.create(dto);
    } catch (error) {
      return Failure.create(error as Error);
    }
  }
}
