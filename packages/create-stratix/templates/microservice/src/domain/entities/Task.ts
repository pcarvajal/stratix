// @ts-nocheck
import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';

export type TaskId = EntityId<'Task'>;

export class TaskCreatedEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly taskId: string,
    public readonly title: string
  ) {
    this.occurredAt = new Date();
  }
}

export class Task extends AggregateRoot<'Task'> {
  private constructor(
    id: TaskId,
    private _title: string,
    private _description: string,
    private _completed: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get completed(): boolean {
    return this._completed;
  }

  complete(): void {
    if (this._completed) {
      throw new Error('Task is already completed');
    }
    this._completed = true;
    this.touch();
  }

  static create(title: string, description: string): Task {
    const now = new Date();
    const id = EntityId.create<'Task'>();
    const task = new Task(id, title, description, false, now, now);
    task.record(new TaskCreatedEvent(id.toString(), title));
    return task;
  }
}
