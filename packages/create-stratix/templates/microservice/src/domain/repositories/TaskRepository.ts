// @ts-nocheck
import { Repository } from '@stratix/abstractions';
import { Task, TaskId } from '../entities/Task.js';

export interface TaskRepository extends Repository<Task, TaskId> {
  findAll(): Promise<Task[]>;
}
