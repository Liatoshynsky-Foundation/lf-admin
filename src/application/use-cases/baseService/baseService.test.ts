import { createBaseService } from './baseService';
import type {
  BaseEntity,
  BaseFilters,
  BaseRepository
} from '~/infrastructure/repositories/baseRepository/baseRepository';

type TestEntity = BaseEntity & {
  name: string;
  email: string;
};

type TestFilters = BaseFilters & {
  name?: string;
};

describe('createBaseService', () => {
  let mockRepository: jest.Mocked<BaseRepository<TestEntity, TestFilters>>;
  let service: ReturnType<typeof createBaseService<TestEntity, TestFilters>>;

  const testEntity: TestEntity = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02')
  };

  const createTestEntity = (overrides: Partial<TestEntity>): TestEntity => ({
    ...testEntity,
    ...overrides
  });

  const testEntities: TestEntity[] = [
    testEntity,
    createTestEntity({
      id: '507f1f77bcf86cd799439012',
      name: 'Test User 2',
      email: 'test2@example.com',
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-04')
    })
  ];

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    service = createBaseService({
      repository: mockRepository,
      entityName: 'TestEntity'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return entity when found', async () => {
      mockRepository.findById.mockResolvedValue(testEntity);

      const result = await service.getById(testEntity.id);

      expect(result).toEqual(testEntity);
      expect(mockRepository.findById).toHaveBeenCalledWith(testEntity.id);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null when entity not found', async () => {
      const nonexistentId = 'nonexistent-id';
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getById(nonexistentId);

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(nonexistentId);
    });
  });

  describe('getAll', () => {
    it('should return all entities without filters', async () => {
      mockRepository.findAll.mockResolvedValue(testEntities);

      const result = await service.getAll();

      expect(result).toEqual(testEntities);
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return filtered entities when filters provided', async () => {
      const filters: TestFilters = { name: 'Test User', limit: 10, skip: 0 };
      mockRepository.findAll.mockResolvedValue([testEntity]);

      const result = await service.getAll(filters);

      expect(result).toEqual([testEntity]);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when no entities found', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update and return entity when successful', async () => {
      const updateInput = { name: 'Updated Name' };
      const updatedEntity = createTestEntity({ name: 'Updated Name' });

      mockRepository.update.mockResolvedValue(updatedEntity);

      const result = await service.update(testEntity.id, updateInput);

      expect(result).toEqual(updatedEntity);
      expect(mockRepository.update).toHaveBeenCalledWith(testEntity.id, updateInput);
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error when entity not found', async () => {
      const nonexistentId = 'nonexistent-id';
      mockRepository.update.mockResolvedValue(null);

      await expect(service.update(nonexistentId, { name: 'New Name' })).rejects.toThrow(
        `TestEntity not found: ${nonexistentId}`
      );
      expect(mockRepository.update).toHaveBeenCalledWith(nonexistentId, { name: 'New Name' });
    });

    it('should allow partial updates', async () => {
      const updateInput = { email: 'newemail@example.com' };
      const updatedEntity = createTestEntity({ email: 'newemail@example.com' });

      mockRepository.update.mockResolvedValue(updatedEntity);

      const result = await service.update(testEntity.id, updateInput);

      expect(result).toEqual(updatedEntity);
      expect(mockRepository.update).toHaveBeenCalledWith(testEntity.id, updateInput);
    });
  });

  describe('delete', () => {
    it('should delete entity and return true when successful', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await service.delete(testEntity.id);

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(testEntity.id);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw error when entity not found', async () => {
      const nonexistentId = 'nonexistent-id';
      mockRepository.delete.mockResolvedValue(false);

      await expect(service.delete(nonexistentId)).rejects.toThrow(`Failed to delete TestEntity: ${nonexistentId}`);
      expect(mockRepository.delete).toHaveBeenCalledWith(nonexistentId);
    });
  });

  describe('getCount', () => {
    it('should return count without filters', async () => {
      mockRepository.count.mockResolvedValue(42);

      const result = await service.getCount();

      expect(result).toBe(42);
      expect(mockRepository.count).toHaveBeenCalledWith(undefined);
      expect(mockRepository.count).toHaveBeenCalledTimes(1);
    });

    it('should return count with filters excluding pagination fields', async () => {
      const filters = { name: 'Test User' };
      mockRepository.count.mockResolvedValue(5);

      const result = await service.getCount(filters);

      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalledWith(filters);
    });

    it('should return 0 when no entities match', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getCount({ name: 'Nonexistent' });

      expect(result).toBe(0);
    });
  });

  describe('getPaginated', () => {
    const setupPaginationMocks = (items: TestEntity[], total: number) => {
      mockRepository.findAll.mockResolvedValue(items);
      mockRepository.count.mockResolvedValue(total);
    };

    it('should return paginated results with default page and limit', async () => {
      setupPaginationMocks(testEntities, 25);

      const result = await service.getPaginated(1, 10);

      expect(result).toEqual({
        items: testEntities,
        total: 25,
        page: 1,
        totalPages: 3
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 0
      });
      expect(mockRepository.count).toHaveBeenCalledWith(undefined);
    });

    it('should calculate skip correctly for page 2', async () => {
      setupPaginationMocks(testEntities, 25);

      const result = await service.getPaginated(2, 10);

      expect(result).toEqual({
        items: testEntities,
        total: 25,
        page: 2,
        totalPages: 3
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 10
      });
    });

    it('should calculate total pages correctly', async () => {
      setupPaginationMocks(testEntities, 23);

      const result = await service.getPaginated(1, 10);

      expect(result.totalPages).toBe(3);
    });

    it('should handle empty results', async () => {
      setupPaginationMocks([], 0);

      const result = await service.getPaginated(1, 10);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        totalPages: 0
      });
    });
  });
});
