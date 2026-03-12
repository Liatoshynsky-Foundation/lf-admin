import type { Model } from 'mongoose';

import {createBaseRepository } from './baseRepository';
import {BaseEntity, FiltersInput, QueryFilters} from '~/domain/repositories/baseRepository';
import {SortOrder} from '~/types/enums/common.enums';

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

  describe('update', () => {
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
  });

  describe('findPaginated', () => {
    it('should calculate skip correctly and return paginated result', async () => {
      const mockItems = [createMockDoc({ name: 'User 1' }), createMockDoc({ name: 'User 2' })];

      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({ model: mockModel, toEntity });

      const mockQueryBuilder = createMockQueryBuilder(mockItems);
      (mockModel.find as jest.Mock).mockReturnValue(mockQueryBuilder);
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(20);

      const result = await repository.findPaginated(2, 5, { name: 'John' });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);

      expect(result).toEqual({
        items: expect.any(Array),
        total: 20,
        page: 2,
        totalPages: 4
      });
    });
  });

  describe('findAll with complex sorting', () => {
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
  });

  describe('count', () => {
    it('should call countDocuments with filters through buildQuery', async () => {
      (mockModel.countDocuments as jest.Mock).mockResolvedValue(10);

      const buildQuery = (f?: QueryFilters<TestFilters>) => f?.name ? { name: f.name } : {};
      const repository = createBaseRepository<TestEntity, TestDbDoc, TestFilters>({
        model: mockModel,
        toEntity,
        buildQuery
      });

      const result = await repository.count({ name: 'John' });

      expect(mockModel.countDocuments).toHaveBeenCalledWith({ name: 'John' });
      expect(result).toBe(10);
    });
  });
});