import type { Model } from 'mongoose';

import { BaseEntity, BaseFilters, createBaseRepository } from './baseRepository';
import dbConnect from '~/infrastructure/db/connect';

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

const createMockObjectId = (id?: string): any => ({
  toString: () => id || '507f1f77bcf86cd799439011',
  _id: id || '507f1f77bcf86cd799439011'
});

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn((id: string) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
      })
    }
  }
}));

const mockedConnect = dbConnect as unknown as jest.Mock;

interface TestEntity extends BaseEntity {
  name: string;
  email: string;
  age?: number;
}

interface TestDbDoc {
  _id: any;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TestFilters extends BaseFilters {
  name?: string;
  email?: string;
  minAge?: number;
}

describe('createBaseRepository', () => {
  let mockModel: jest.Mocked<Model<TestDbDoc>>;
  let toEntity: (doc: TestDbDoc) => TestEntity;

  const createMockQueryBuilder = (resolvedValue: any) => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(resolvedValue)
  });

  const createMockDoc = (overrides?: Partial<TestDbDoc>): TestDbDoc => ({
    _id: createMockObjectId('507f1f77bcf86cd799439011'),
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn()
    } as unknown as jest.Mocked<Model<TestDbDoc>>;

    toEntity = (doc: TestDbDoc): TestEntity => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      age: doc.age,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    });
  });

  describe('findById', () => {
    it('should return entity when document is found', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439011');
      const mockDoc = createMockDoc({ _id: mockId });

      const leanMock = jest.fn().mockResolvedValue(mockDoc);
      (mockModel.findById as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.findById(mockId.toString());

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findById).toHaveBeenCalledWith(mockId.toString());
      expect(leanMock).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockId.toString(),
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        createdAt: mockDoc.createdAt.toISOString(),
        updatedAt: mockDoc.updatedAt.toISOString()
      });
    });

    it('should return null when document is not found', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439012');
      const leanMock = jest.fn().mockResolvedValue(null);
      (mockModel.findById as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.findById(mockId.toString());

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findById).toHaveBeenCalledWith(mockId.toString());
      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should return entity when document is found by slug', async () => {
      const mockSlug = 'john-doe';
      const mockDoc = createMockDoc({
        _id: createMockObjectId('507f1f77bc86cd799439011'),
        name: 'John Doe'
      });

      const leanMock = jest.fn().mockResolvedValue(mockDoc);
      (mockModel.findOne as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.findBySlug(mockSlug);

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findOne).toHaveBeenCalledWith({ slug: mockSlug });
      expect(leanMock).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockDoc._id.toString(),
        name: 'John Doe',
        email: mockDoc.email,
        age: mockDoc.age,
        createdAt: mockDoc.createdAt.toISOString(),
        updatedAt: mockDoc.updatedAt.toISOString()
      });
    });

    it('should return null when document is not found by slug', async () => {
      const mockSlug = 'nonexistent-slug';
      const leanMock = jest.fn().mockResolvedValue(null);

      (mockModel.findOne as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.findBySlug(mockSlug);

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findOne).toHaveBeenCalledWith({ slug: mockSlug });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    const mockDocs: TestDbDoc[] = [
      createMockDoc({ _id: createMockObjectId('507f1f77bcf86cd799439011') }),
      createMockDoc({
        _id: createMockObjectId('507f1f77bcf86cd799439012'),
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-04')
      })
    ];

    it('should return all documents with default sorting', async () => {
      const mockQueryBuilder = createMockQueryBuilder(mockDocs);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.findAll();

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.find).toHaveBeenCalledWith({});
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQueryBuilder.skip).not.toHaveBeenCalled();
      expect(mockQueryBuilder.limit).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(mockDocs[0]._id.toString());
    });

    it('should apply custom filters with buildQuery', async () => {
      const mockQueryBuilder = createMockQueryBuilder([mockDocs[0]]);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const buildQuery = (filters?: { name?: string; email?: string }) => {
        const query: any = {};
        if (filters?.name) query.name = filters.name;
        if (filters?.email) query.email = filters.email;
        return query;
      };

      const repository = createBaseRepository({ model: mockModel, toEntity, buildQuery });
      const result = await repository.findAll({ name: 'John Doe', email: 'john@example.com' } as TestFilters);

      expect(mockModel.find).toHaveBeenCalledWith({ name: 'John Doe', email: 'john@example.com' });
      expect(result).toHaveLength(1);
    });

    it('should apply pagination with skip and limit', async () => {
      const mockQueryBuilder = createMockQueryBuilder([mockDocs[1]]);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      await repository.findAll({ skip: 10, limit: 5 } as TestFilters);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });

    it('should apply custom sorting with sortBy and sortOrder', async () => {
      const mockQueryBuilder = createMockQueryBuilder(mockDocs);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      await repository.findAll({ sortBy: 'name', sortOrder: 'asc' } as TestFilters);

      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should apply descending sort order', async () => {
      const mockQueryBuilder = createMockQueryBuilder(mockDocs);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      await repository.findAll({ sortBy: 'age', sortOrder: 'desc' } as TestFilters);

      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ age: -1 });
    });

    it('should use custom getDefaultSort when provided', async () => {
      const mockQueryBuilder = createMockQueryBuilder(mockDocs);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const getDefaultSort = (filters?: TestFilters): Record<string, 1 | -1> => {
        if (filters?.sortBy === 'email') {
          return { email: filters?.sortOrder === 'asc' ? (1 as const) : (-1 as const) };
        }
        return { name: 1 as const };
      };

      const repository = createBaseRepository({ model: mockModel, toEntity, getDefaultSort });
      await repository.findAll();

      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should return empty array when no documents found', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update and return the entity', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439011');
      const updatedDoc = createMockDoc({
        _id: mockId,
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 31,
        updatedAt: new Date('2024-01-05')
      });

      const leanMock = jest.fn().mockResolvedValue(updatedDoc);
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.update(mockId.toString(), { name: 'John Updated', age: 31 });

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId.toString(),
        { name: 'John Updated', age: 31 },
        { new: true, runValidators: true }
      );
      expect(leanMock).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockId.toString(),
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 31,
        createdAt: updatedDoc.createdAt.toISOString(),
        updatedAt: updatedDoc.updatedAt.toISOString()
      });
    });

    it('should return null when document to update is not found', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439012');
      const leanMock = jest.fn().mockResolvedValue(null);
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.update(mockId.toString(), { name: 'New Name' });

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should update partial fields', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439013');
      const updatedDoc = createMockDoc({
        _id: mockId,
        age: 35,
        updatedAt: new Date('2024-01-06')
      });

      const leanMock = jest.fn().mockResolvedValue(updatedDoc);
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      await repository.update(mockId.toString(), { age: 35 });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(mockId.toString(), { age: 35 }, expect.any(Object));
    });
  });

  describe('delete', () => {
    it('should delete document and return true', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439011');
      const mockDoc = createMockDoc({ _id: mockId });

      (mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDoc);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.delete(mockId.toString());

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(mockId.toString());
      expect(result).toBe(true);
    });

    it('should return false when document to delete is not found', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439012');
      (mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.delete(mockId.toString());

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(mockId.toString());
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return count of all documents', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(42);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.count();

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(42);
    });

    it('should return count with filters applied', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(5);

      const buildQuery = (filters?: { name?: string }) => {
        const query: any = {};
        if (filters?.name) query.name = filters.name;
        return query;
      };

      const repository = createBaseRepository({ model: mockModel, toEntity, buildQuery });
      const result = await repository.count({ name: 'John' });

      expect(mockedConnect).toHaveBeenCalled();
      expect(mockModel.countDocuments).toHaveBeenCalledWith({ name: 'John' });
      expect(result).toBe(5);
    });

    it('should return 0 when no documents match', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const result = await repository.count();

      expect(mockedConnect).toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete CRUD operations', async () => {
      const mockId = createMockObjectId('507f1f77bcf86cd799439011');

      const createdDoc = createMockDoc({
        _id: mockId,
        name: 'Test User',
        email: 'test@example.com',
        age: 28,
        updatedAt: new Date('2024-01-01')
      });

      const leanFindByIdMock = jest.fn().mockResolvedValue(createdDoc);
      (mockModel.findById as jest.Mock).mockReturnValue({ lean: leanFindByIdMock });

      const repository = createBaseRepository({ model: mockModel, toEntity });
      const found = await repository.findById(mockId.toString());

      expect(found?.name).toBe('Test User');

      const updatedDoc = { ...createdDoc, name: 'Updated User', updatedAt: new Date('2024-01-02') };
      const leanUpdateMock = jest.fn().mockResolvedValue(updatedDoc);
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanUpdateMock });

      const updated = await repository.update(mockId.toString(), { name: 'Updated User' });
      expect(updated?.name).toBe('Updated User');

      (mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(updatedDoc);
      const deleted = await repository.delete(mockId.toString());
      expect(deleted).toBe(true);
    });

    it('should properly filter query parameters from pagination parameters', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);

      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const buildQuery = jest.fn().mockReturnValue({});
      const repository = createBaseRepository({ model: mockModel, toEntity, buildQuery });

      const filters: TestFilters = {
        name: 'John',
        email: 'john@example.com',
        minAge: 25,
        skip: 10,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      };

      await repository.findAll(filters);
      expect(buildQuery).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com', minAge: 25 });

      await repository.count({ name: 'John', email: 'john@example.com', minAge: 25 });
      expect(buildQuery).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com', minAge: 25 });
    });
  });
});
