import type { Model } from 'mongoose';

import { createBaseRepository } from './baseRepository';
import { BaseEntity, FiltersInput, QueryFilters } from '~/domain/repositories/baseRepository';
import { SortOrder } from '~/types/enums/common.enums';

jest.mock('../../db/connect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id))
    }
  }
}));

interface TestEntity extends BaseEntity {
  name: string;
  email: string;
}

interface TestDbDoc {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface TestFilters extends FiltersInput {
  name?: string;
}

describe('createBaseRepository', () => {
  let mockModel: jest.Mocked<Model<TestDbDoc>>;
  let toEntity: (doc: TestDbDoc) => TestEntity;

  const createMockQueryBuilder = (resolvedValue: TestDbDoc[] | TestDbDoc | null) => ({
    session: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(resolvedValue)
  });

  const createMockDoc = (overrides?: Partial<TestDbDoc>): TestDbDoc => ({
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  });

  describe('findById', () => {
    it('should return null for invalid ObjectId', async () => {
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.findById('invalid-id');

      expect(result).toBeNull();
      expect(mockModel.findById).not.toHaveBeenCalled();
    });

    it('should return entity if doc found, or null if doc missing', async () => {
      const validId = '507f1f77bcf86cd799439011';
      const doc = createMockDoc();

      const mockQueryBuilder = createMockQueryBuilder(doc);
      (mockModel.findById as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.findById(validId);

      expect(result?.id).toBe(validId);

      (mockModel.findById as jest.Mock).mockReturnValue(createMockQueryBuilder(null));
      const nullResult = await repository.findById(validId);
      expect(nullResult).toBeNull();
    });

    it('should apply the provided session to the query', async () => {
      const session = {} as never;
      const mockQueryBuilder = createMockQueryBuilder(createMockDoc());
      (mockModel.findById as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      await repository.findById('507f1f77bcf86cd799439011', session);

      expect(mockQueryBuilder.session).toHaveBeenCalledWith(session);
    });
  });

  describe('findBySlug', () => {
    it('should return null for empty slug', async () => {
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.findBySlug('');

      expect(result).toBeNull();
      expect(mockModel.findOne).not.toHaveBeenCalled();
    });

    it('should find entity by slug, or return null if not found', async () => {
      const doc = createMockDoc();
      const mockQueryBuilder = createMockQueryBuilder(doc);
      (mockModel.findOne as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.findBySlug('valid-slug');

      expect(result?.name).toBe('John Doe');

      (mockModel.findOne as jest.Mock).mockReturnValue(createMockQueryBuilder(null));
      const nullResult = await repository.findBySlug('non-existent-slug');
      expect(nullResult).toBeNull();
    });

    it('should apply the provided session to the query', async () => {
      const session = {} as never;
      const mockQueryBuilder = createMockQueryBuilder(createMockDoc());
      (mockModel.findOne as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      await repository.findBySlug('valid-slug', session);

      expect(mockQueryBuilder.session).toHaveBeenCalledWith(session);
    });
  });

  describe('update', () => {
    it('should return null for invalid ObjectId in update', async () => {
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.update('invalid-id', { name: 'New Name' });

      expect(result).toBeNull();
      expect(mockModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should automatically add updatedAt timestamp as ISO string', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      const input = { name: 'Updated Name' };
      const updatedDoc = createMockDoc({ ...input, updatedAt: '2024-03-10T12:00:00.000Z' });

      const leanMock = jest.fn().mockResolvedValue(updatedDoc);
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      await repository.update(mockId, input);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({
          name: 'Updated Name',
          updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        }),
        { new: true, runValidators: true }
      );
    });

    it('should return null if update returns no document', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      const leanMock = jest.fn().mockResolvedValue(null);
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.update(mockId, { name: 'New' });

      expect(result).toBeNull();
    });

    it('should pass the provided session to the update operation', async () => {
      const session = {} as never;
      const leanMock = jest.fn().mockResolvedValue(createMockDoc());
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ lean: leanMock });

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      await repository.update('507f1f77bcf86cd799439011', { name: 'Updated' }, session);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.any(Object),
        expect.objectContaining({ new: true, runValidators: true, session })
      );
    });
  });

  describe('delete', () => {
    it('should return false for invalid ObjectId in delete', async () => {
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.delete('invalid-id');

      expect(result).toBe(false);
      expect(mockModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should return true when document deleted, false when not found', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      (mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(createMockDoc());

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.delete(mockId);
      expect(result).toBe(true);

      (mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      const falseResult = await repository.delete(mockId);
      expect(falseResult).toBe(false);
    });

    it('should pass the provided session to the delete operation', async () => {
      const session = {} as never;
      (mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(createMockDoc());

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      await repository.delete('507f1f77bcf86cd799439011', session);

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { session });
    });
  });

  describe('findAll with custom sort and defaultSort fallback', () => {
    it('should handle undefined filters gracefully', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity
      });

      const res = await repository.findAll();

      expect(res).toEqual([]);
      expect(mockModel.find).toHaveBeenCalledWith({});
    });

    it('should fallback to getDefaultSort if provided and filters.sort is missing', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const getDefaultSort = jest.fn().mockReturnValue({ name: 1 });
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity,
        getDefaultSort
      });

      await repository.findAll({});

      expect(getDefaultSort).toHaveBeenCalled();
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should use getSort when provided with sort filters', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const getSort = jest.fn().mockReturnValue({ name: 1, additionalText: 1 });
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity,
        getSort
      });

      await repository.findAll({ sort: [{ sortBy: 'name', sortOrder: SortOrder.Asc }] });

      expect(getSort).toHaveBeenCalled();
      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ name: 1, additionalText: 1 });
    });

    it('should apply custom sorting from the sort array filters', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity
      });

      await repository.findAll({
        sort: [{ sortBy: 'email', sortOrder: SortOrder.Asc }]
      });

      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ email: 1 });
    });

    it('should apply multiple sorting criteria in order', async () => {
      const mockQueryBuilder = createMockQueryBuilder([]);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity
      });

      await repository.findAll({
        sort: [
          { sortBy: 'name', sortOrder: SortOrder.Asc },
          { sortBy: 'createdAt', sortOrder: SortOrder.Desc }
        ]
      });

      expect(mockQueryBuilder.sort).toHaveBeenCalledWith({
        name: 1,
        createdAt: -1
      });
    });

    it('should apply the provided session and pagination options', async () => {
      const session = {} as never;
      const mockQueryBuilder = createMockQueryBuilder([]);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      await repository.findAll({ skip: 2, limit: 5 }, session);

      expect(mockQueryBuilder.session).toHaveBeenCalledWith(session);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(2);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('findPaginated', () => {
    it('should calculate skip correctly and return paginated result when called without arguments', async () => {
      const mockItems = [createMockDoc({ name: 'User 1' }), createMockDoc({ name: 'User 2' })];

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });

      const mockQueryBuilder = createMockQueryBuilder(mockItems);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(20);

      const untypedFindPaginated = repository.findPaginated as unknown as () => Promise<unknown>;
      const result = await untypedFindPaginated();

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);

      expect(result).toEqual({
        items: expect.any(Array),
        total: 20,
        page: 1,
        totalPages: 2
      });
    });

    it('should call skip when page is greater than 1', async () => {
      const mockItems = [createMockDoc({ name: 'User 1' })];

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });

      const mockQueryBuilder = createMockQueryBuilder(mockItems);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(20);

      const result = await repository.findPaginated(2, 5, { name: 'John' });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
      expect(result.page).toBe(2);
    });
  });

  describe('count', () => {
    it('should call countDocuments with empty query if buildQuery is omitted', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(5);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity
      });

      const result = await repository.count();

      expect(mockModel.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(5);
    });

    it('should fallback to empty object query if buildQuery is null', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(3);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity,
        buildQuery: null as unknown as undefined
      });

      const result = await repository.count();

      expect(mockModel.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(3);
    });

    it('should call countDocuments with filters through buildQuery', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(10);

      const buildQuery = (f?: QueryFilters<TestFilters>) => (f?.name ? { name: f.name } : {});
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity,
        buildQuery
      });

      const result = await repository.count({ name: 'John' });

      expect(mockModel.countDocuments).toHaveBeenCalledWith({ name: 'John' });
      expect(result).toBe(10);
    });

    it('should pass the provided session to countDocuments', async () => {
      const session = {} as never;
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(7);

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });
      const result = await repository.count({ name: 'John' }, session);

      expect(mockModel.countDocuments).toHaveBeenCalledWith({}, { session });
      expect(result).toBe(7);
    });
  });
});
