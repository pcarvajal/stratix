import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Entity } from '../core/Entity.js';
import { EntityId } from '../core/EntityId.js';

class TestEntity extends Entity<'Test'> {
  constructor(
    id: EntityId<'Test'>,
    private _name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  get name(): string {
    return this._name;
  }

  changeName(newName: string): void {
    this._name = newName;
    this.touch();
  }
}

describe('Entity', () => {
  let id: EntityId<'Test'>;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(() => {
    id = EntityId.create<'Test'>();
    createdAt = new Date('2024-01-01T00:00:00Z');
    updatedAt = new Date('2024-01-01T00:00:00Z');
  });

  describe('constructor', () => {
    it('should create entity with id, createdAt, and updatedAt', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);

      expect(entity.id.equals(id)).toBe(true);
      expect(entity.createdAt).toBe(createdAt);
      expect(entity.updatedAt).toBe(updatedAt);
    });
  });

  describe('id', () => {
    it('should return the entity id', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);

      expect(entity.id.equals(id)).toBe(true);
    });

    it('should be immutable', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);
      const entityId = entity.id;

      expect(entityId.equals(id)).toBe(true);
      expect(entity.id).toBe(entityId); // Same reference
    });
  });

  describe('createdAt', () => {
    it('should return the creation timestamp', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);

      expect(entity.createdAt).toBe(createdAt);
    });

    it('should be immutable', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);
      const timestamp = entity.createdAt;

      expect(entity.createdAt).toBe(timestamp); // Same reference
    });
  });

  describe('updatedAt', () => {
    it('should return the last update timestamp', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);

      expect(entity.updatedAt).toBe(updatedAt);
    });

    it('should be updated when touch is called', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);
      const originalUpdatedAt = entity.updatedAt;

      // Wait a bit to ensure different timestamp
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-02T00:00:00Z'));

      entity.changeName('New Name');

      expect(entity.updatedAt).not.toBe(originalUpdatedAt);
      expect(entity.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      vi.useRealTimers();
    });
  });

  describe('touch', () => {
    it('should update the updatedAt timestamp', () => {
      const entity = new TestEntity(id, 'Test Name', createdAt, updatedAt);
      const originalUpdatedAt = entity.updatedAt;

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-02T00:00:00Z'));

      entity.changeName('New Name'); // Calls touch internally

      expect(entity.updatedAt).not.toBe(originalUpdatedAt);

      vi.useRealTimers();
    });
  });

  describe('equals', () => {
    it('should return true for entities with same id', () => {
      const entity1 = new TestEntity(id, 'Name 1', createdAt, updatedAt);
      const entity2 = new TestEntity(id, 'Name 2', createdAt, updatedAt);

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for entities with different ids', () => {
      const id1 = EntityId.create<'Test'>();
      const id2 = EntityId.create<'Test'>();
      const entity1 = new TestEntity(id1, 'Name', createdAt, updatedAt);
      const entity2 = new TestEntity(id2, 'Name', createdAt, updatedAt);

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false for non-entity objects', () => {
      const entity = new TestEntity(id, 'Name', createdAt, updatedAt);
      const notEntity = { id: 'test' };

      expect(entity.equals(notEntity as unknown as TestEntity)).toBe(false);
    });

    it('should compare by identity, not by attributes', () => {
      const entity1 = new TestEntity(id, 'Name 1', createdAt, updatedAt);
      const entity2 = new TestEntity(id, 'Name 2', new Date(), new Date());

      // Even with different attributes and timestamps, same ID means equal
      expect(entity1.equals(entity2)).toBe(true);
    });
  });
});
