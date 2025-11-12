import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MongoConnection } from '../MongoConnection.js';

// Create mocks
const mockCollection = {
  findOne: vi.fn(),
  find: vi.fn(),
  insertOne: vi.fn(),
};

const mockDb = {
  command: vi.fn(),
  collection: vi.fn(() => mockCollection),
};

const mockClient = {
  connect: vi.fn(),
  db: vi.fn(() => mockDb),
  close: vi.fn(),
};

// Mock mongodb module
vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => mockClient),
}));

describe('MongoConnection', () => {
  let connection: MongoConnection;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.connect.mockResolvedValue(mockClient);
    mockClient.close.mockResolvedValue(undefined);
    mockDb.command.mockResolvedValue({ ok: 1 });

    connection = new MongoConnection('mongodb://localhost:27017', 'testdb', {});
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await connection.connect();

      expect(connection.connected()).toBe(true);
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should not connect twice', async () => {
      await connection.connect();
      await connection.connect();

      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });

    it('should throw error on connection failure', async () => {
      mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));

      const failingConnection = new MongoConnection('mongodb://bad', 'testdb', {});

      await expect(failingConnection.connect()).rejects.toThrow('Failed to connect to MongoDB');
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await connection.connect();
      await connection.disconnect();

      expect(connection.connected()).toBe(false);
      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should not disconnect if not connected', async () => {
      await connection.disconnect();

      expect(mockClient.close).not.toHaveBeenCalled();
    });
  });

  describe('collection', () => {
    it('should get a collection', async () => {
      await connection.connect();
      const col = connection.collection('users');

      expect(col).toBeDefined();
      expect(mockDb.collection).toHaveBeenCalledWith('users');
    });

    it('should throw error if not connected', () => {
      expect(() => connection.collection('users')).toThrow('Database not initialized');
    });
  });

  describe('getDatabase', () => {
    it('should get the database', async () => {
      await connection.connect();
      const db = connection.getDatabase();

      expect(db).toBeDefined();
    });

    it('should throw error if not connected', () => {
      expect(() => connection.getDatabase()).toThrow('Database not initialized');
    });
  });

  describe('createUnitOfWork', () => {
    it('should create a UnitOfWork', async () => {
      await connection.connect();
      const uow = connection.createUnitOfWork();

      expect(uow).toBeDefined();
    });
  });
});
