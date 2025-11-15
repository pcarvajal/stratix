// @ts-nocheck
import { Task, TaskId } from '../../domain/entities/Task.js';
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id.toString(), task);
  }

  async findById(id: TaskId): Promise<Task | null> {
    const task = this.tasks.get(id.toString());
    return task || null;
  }

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async delete(id: TaskId): Promise<void> {
    this.tasks.delete(id.toString());
  }

  async exists(id: TaskId): Promise<boolean> {
    return this.tasks.has(id.toString());
  }
}
