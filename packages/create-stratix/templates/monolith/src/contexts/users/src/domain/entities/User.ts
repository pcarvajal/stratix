// @ts-nocheck
import { AggregateRoot, EntityId } from '@stratix/primitives';
import { UserId } from '../../../../../shared/types/CommonTypes.js';
import { UserRegisteredEvent } from '../events/UserRegisteredEvent.js';

export interface UserProps {
  email: string;
  name: string;
  isActive: boolean;
}

export class User extends AggregateRoot<'User'> {
  private constructor(
    id: UserId,
    private _email: string,
    private _name: string,
    private _isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  updateName(name: string): void {
    this._name = name;
    this.touch();
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new Error('User is already inactive');
    }
    this._isActive = false;
    this.touch();
  }

  activate(): void {
    if (this._isActive) {
      throw new Error('User is already active');
    }
    this._isActive = true;
    this.touch();
  }

  static create(props: UserProps, id?: UserId): User {
    const userId = id ?? EntityId.create<'User'>();
    const now = new Date();
    const user = new User(userId, props.email, props.name, props.isActive, now, now);

    // Record domain event that will be converted to integration event
    user.record(new UserRegisteredEvent(userId, props.email, props.name));

    return user;
  }
}
