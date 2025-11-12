import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MongoRepository } from '../MongoRepository.js';
import { MongoConnection } from '../MongoConnection.js';
import type { Collection, ObjectId } from 'mongodb';

// Test entity
class User {
  constructor(
    public id: string,
    public email: string,
    public name: string
  ) {}
}

// Test repository
class UserRepository extends MongoRepository<User, string> {
  protected collectionName = 'users';

  protected toDocument(entity: User): any {
    return {
      _id: entity.id,
      email: entity.email,
      name: entity.name,
    };
  }

  protected toDomain(doc: any): User {
    return new User(doc._id, doc.email, doc.name);
  }

  protected extractId(entity: User): string {
    return entity.id;
  }
}

// Create mocks
const mockCursor = {
  toArray: vi.fn(),
};

const mockCollection = {
  findOne: vi.fn(),
  find: vi.fn(() => mockCursor),
  insertOne: vi.fn(),
  replaceOne: vi.fn(),
  updateOne: vi.fn(),
  deleteOne: vi.fn(),
  deleteMany: vi.fn(),
  countDocuments: vi.fn(),
};

const mockDb = {
  command: vi.fn(),
  collection: vi.fn(() => mockCollection),
};

const mockClient = {
  connect: vi.fn(),
  db: vi.fn(() => mockDb),
  close: vi.fn(),
  startSession: vi.fn(),
};

// Mock mongodb module
vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => mockClient),
  ObjectId: vi.fn((id) => id),
}));

describe('MongoRepository', () => {
  let connection: MongoConnection;
  let repository: UserRepository;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient.connect.mockResolvedValue(mockClient);
    mockClient.close.mockResolvedValue(undefined);
    mockCollection.findOne.mockResolvedValue(null);
    mockCollection.insertOne.mockResolvedValue({ acknowledged: true });
    mockCollection.replaceOne.mockResolvedValue({ acknowledged: true });
    mockCollection.updateOne.mockResolvedValue({ acknowledged: true });
    mockCollection.deleteOne.mockResolvedValue({ acknowledged: true });
    mockCollection.deleteMany.mockResolvedValue({ acknowledged: true, deletedCount: 0 });
    mockCollection.countDocuments.mockResolvedValue(0);
    mockCursor.toArray.mockResolvedValue([]);

    connection = new MongoConnection('mongodb://localhost:27017', 'testdb', {});
    await connection.connect();
    repository = new UserRepository(connection);
  });

  describe('save', () => {
    it('should save an entity using replaceOne with upsert', async () => {
      const user = new User('1', 'john@example.com', 'John Doe');

      await repository.save(user);

      expect(mockCollection.replaceOne).toHaveBeenCalledWith(
        { _id: '1' },
        {
          _id: '1',
          email: 'john@example.com',
          name: 'John Doe',
        },
        expect.objectContaining({ upsert: true })
      );
    });

    it('should handle entity update with replaceOne', async () => {
      const user = new User('1', 'john@example.com', 'John Doe Updated');

      await repository.save(user);

      expect(mockCollection.replaceOne).toHaveBeenCalledWith(
        { _id: '1' },
        expect.objectContaining({
          _id: '1',
          email: 'john@example.com',
          name: 'John Doe Updated',
        }),
        expect.objectContaining({ upsert: true })
      );
    });
  });

  describe('findById', () => {
    it('should find entity by id', async () => {
      const mockDoc = { _id: '1', email: 'john@example.com', name: 'John Doe' };
      mockCollection.findOne.mockResolvedValueOnce(mockDoc);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('1');
      expect(result?.email).toBe('john@example.com');
    });

    it('should return null if entity not found', async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all entities', async () => {
      const mockDocs = [
        { _id: '1', email: 'john@example.com', name: 'John Doe' },
        { _id: '2', email: 'jane@example.com', name: 'Jane Doe' },
      ];
      mockCursor.toArray.mockResolvedValueOnce(mockDocs);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
    });
  });

  describe('findBy', () => {
    it('should find entities by filter', async () => {
      const mockDocs = [{ _id: '1', email: 'john@example.com', name: 'John Doe' }];
      mockCursor.toArray.mockResolvedValueOnce(mockDocs);

      const result = await repository.findBy({ email: 'john@example.com' });

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john@example.com');
    });
  });

  describe('delete', () => {
    it('should delete entity by id', async () => {
      await repository.delete('1');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: '1' }, expect.any(Object));
    });
  });

  describe('deleteBy', () => {
    it('should delete entities by filter', async () => {
      mockCollection.deleteMany.mockImplementationOnce(async () => ({
        acknowledged: true,
        deletedCount: 2,
      }));

      const count = await repository.deleteBy({ name: 'John Doe' });

      expect(count).toBe(2);
      expect(mockCollection.deleteMany).toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('should count all entities', async () => {
      mockCollection.countDocuments.mockImplementationOnce(async () => 5);

      const count = await repository.count();

      expect(count).toBe(5);
    });
  });

  describe('exists', () => {
    it('should return true if entity exists', async () => {
      mockCollection.countDocuments.mockImplementationOnce(async () => 1);

      const exists = await repository.exists('1');

      expect(exists).toBe(true);
    });

    it('should return false if entity does not exist', async () => {
      mockCollection.countDocuments.mockImplementationOnce(async () => 0);

      const exists = await repository.exists('999');

      expect(exists).toBe(false);
    });
  });
});
