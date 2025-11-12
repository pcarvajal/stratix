// @ts-nocheck
import { AggregateRoot, EntityId, DomainEvent } from '@stratix/primitives';

export type ItemId = EntityId<'Item'>;

export class ItemCreatedEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly itemId: string,
    public readonly name: string,
    public readonly description: string
  ) {
    this.occurredAt = new Date();
  }
}

export class Item extends AggregateRoot<'Item'> {
  private constructor(
    id: ItemId,
    private _name: string,
    private _description: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  updateName(name: string): void {
    this._name = name;
    this.touch();
  }

  updateDescription(description: string): void {
    this._description = description;
    this.touch();
  }

  static create(name: string, description: string): Item {
    const now = new Date();
    const id = EntityId.create<'Item'>();
    const item = new Item(id, name, description, now, now);
    item.record(new ItemCreatedEvent(id.toString(), name, description));
    return item;
  }
}
