import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresRepository, DatabaseRow } from '../PostgresRepository.js';
import { PostgresConnection } from '../PostgresConnection.js';
import { PostgresUnitOfWork } from '../PostgresUnitOfWork.js';

// Test entity
class User {
  constructor(
    public id: string,
    public email: string,
    public name: string
  ) {}
}

// Test repository implementation
class UserRepository extends PostgresRepository<User, string> {
  protected tableName = 'users';

  protected extractId(user: User): string {
    return user.id;
  }

  protected toDatabaseRow(user: User): DatabaseRow {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  protected toDomain(row: DatabaseRow): User {
    return new User(row.id as string, row.email as string, row.name as string);
  }
}

// Create mocks
const mockPool = {
  connect: vi.fn(),
  query: vi.fn(),
  end: vi.fn(),
  on: vi.fn(),
  totalCount: 10,
  idleCount: 5,
  waitingCount: 0,
};

// Mock pg module
vi.mock('pg', () => ({
  Pool: vi.fn(() => mockPool),
}));

describe('PostgresRepository', () => {
  let connection: PostgresConnection;
  let repository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

    connection = new PostgresConnection({
      connectionString: 'postgres://user:pass@localhost:5432/testdb',
    });

    repository = new UserRepository(connection);
  });

  describe('save', () => {
    it('should insert a new entity', async () => {
      const user = new User('1', 'john@example.com', 'John Doe');

      mockPool.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // exists check
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // insert

      await repository.save(user);

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT'), [
        '1',
        'john@example.com',
        'John Doe',
      ]);
    });

    it('should update an existing entity', async () => {
      const user = new User('1', 'john@example.com', 'John Doe');

      mockPool.query
        .mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 }) // exists check
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // update

      await repository.save(user);

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE'), [
        'john@example.com',
        'John Doe',
        '1',
      ]);
    });
  });

  describe('findById', () => {
    it('should find entity by id', async () => {
      const mockUser = { id: '1', email: 'john@example.com', name: 'John Doe' };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('1');
      expect(result?.email).toBe('john@example.com');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
    });

    it('should return null if entity not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all entities', async () => {
      const mockUsers = [
        { id: '1', email: 'john@example.com', name: 'John Doe' },
        { id: '2', email: 'jane@example.com', name: 'Jane Doe' },
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockUsers, rowCount: 2 });

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users', undefined);
    });

    it('should return empty array if no entities found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findBy', () => {
    it('should find entities by where clause', async () => {
      const mockUsers = [{ id: '1', email: 'john@example.com', name: 'John Doe' }];

      mockPool.query.mockResolvedValueOnce({ rows: mockUsers, rowCount: 1 });

      const result = await repository.findBy('email = $1', ['john@example.com']);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('john@example.com');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', [
        'john@example.com',
      ]);
    });
  });

  describe('findOneBy', () => {
    it('should find one entity by where clause', async () => {
      const mockUser = { id: '1', email: 'john@example.com', name: 'John Doe' };

      mockPool.query.mockResolvedValueOnce({ rows: [mockUser], rowCount: 1 });

      const result = await repository.findOneBy('email = $1', ['john@example.com']);

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('john@example.com');
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1 LIMIT 1', [
        'john@example.com',
      ]);
    });

    it('should return null if no entity found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await repository.findOneBy('email = $1', ['nonexistent@example.com']);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete entity by id', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await repository.delete('1');

      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    });
  });

  describe('deleteBy', () => {
    it('should delete entities by where clause', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 2 });

      const count = await repository.deleteBy('name = $1', ['John Doe']);

      expect(count).toBe(2);
      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM users WHERE name = $1', [
        'John Doe',
      ]);
    });
  });

  describe('count', () => {
    it('should count all entities', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 });

      const count = await repository.count();

      expect(count).toBe(5);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM users', undefined);
    });
  });

  describe('countBy', () => {
    it('should count entities by where clause', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ count: '3' }], rowCount: 1 });

      const count = await repository.countBy('email LIKE $1', ['%@example.com']);

      expect(count).toBe(3);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM users WHERE email LIKE $1',
        ['%@example.com']
      );
    });
  });

  describe('exists', () => {
    it('should return true if entity exists', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });

      const exists = await repository.exists('1');

      expect(exists).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1 FROM users WHERE id = $1 LIMIT 1', [
        '1',
      ]);
    });

    it('should return false if entity does not exist', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const exists = await repository.exists('999');

      expect(exists).toBe(false);
    });
  });

  describe('with UnitOfWork', () => {
    it('should use UnitOfWork transaction when available', async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: vi.fn(),
      };

      const unitOfWork = new PostgresUnitOfWork(connection);
      const spy = vi.spyOn(unitOfWork, 'query').mockResolvedValue({ rows: [], rowCount: 0 } as any);
      vi.spyOn(unitOfWork, 'isInTransaction').mockReturnValue(true);

      const repoWithUow = new UserRepository(connection, unitOfWork);
      const user = new User('1', 'john@example.com', 'John Doe');

      await repoWithUow.save(user);

      expect(spy).toHaveBeenCalled();
    });
  });
});
