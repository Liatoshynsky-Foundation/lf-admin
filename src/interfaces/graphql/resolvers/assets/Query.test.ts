import { createMockContext } from '../testUtils';
import { AllAssetsArgs, AssetsMutation, AssetsQuery } from './Query';
import { SortOrder } from '~/types/enums/common.enums';
import { AssetType } from '~/types/graphql/generated/graphql';

jest.mock('mongoose');
jest.mock('~/infrastructure/models/imageCrop.model');

describe('AssetsQuery', () => {
  const mockRepo = {
    findAll: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass filters to assets repository', async () => {
    const expectedAssets = ['asset'];
    mockRepo.findAll.mockResolvedValue(expectedAssets);

    const ctx = createMockContext(true, 'assetsRepository', mockRepo);

    const filters = {
      type: AssetType.Image,
      isStarred: true,
      sortBy: 'createdAt' as const,
      sortOrder: SortOrder.Desc,
      limit: 20,
      skip: 0
    };

    const res = await AssetsQuery.allAssets({}, { filters }, ctx);

    expect(res).toEqual(expectedAssets);
    expect(mockRepo.findAll).toHaveBeenCalledWith(filters);
  });

  it('should throw when admin is missing', async () => {
    const invalidCtx = createMockContext(false, 'assetsRepository', mockRepo);

    const args = {
      filters: {}
    } as unknown as { filters: AllAssetsArgs['filters'] };

    await expect(AssetsQuery.allAssets({}, args as never, invalidCtx)).rejects.toThrow();
  });

  describe('AssetsMutation', () => {
    const mockRepo = {
      findAll: jest.fn(),
      updateAsset: jest.fn(),
      createAsset: jest.fn(),
      deleteAsset: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('updateAsset: should update asset', async () => {
      const expected = { id: '1', isStarred: true };
      mockRepo.updateAsset.mockResolvedValue(expected);
      const ctx = createMockContext(true, 'assetsRepository', mockRepo);

      const input = { isStarred: true };
      const res = await AssetsMutation.updateAsset({}, { id: '1', input }, ctx);

      expect(res).toEqual(expected);
      expect(mockRepo.updateAsset).toHaveBeenCalledWith('1', input);
    });

    it('createAsset: should create asset', async () => {
      const expected = { id: '2', filename: 'file.jpg' };
      mockRepo.createAsset.mockResolvedValue(expected);
      const ctx = createMockContext(true, 'assetsRepository', mockRepo);

      const input = {
        filename: 'file.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        url: 'https://example.com/file.jpg',
        type: AssetType.Image
      };
      const res = await AssetsMutation.createAsset({}, { input }, ctx);

      expect(res).toEqual(expected);
      expect(mockRepo.createAsset).toHaveBeenCalledWith(input);
    });

    it('deleteAsset: should delete asset', async () => {
      mockRepo.deleteAsset.mockResolvedValue(true);
      const ctx = createMockContext(true, 'assetsRepository', mockRepo);

      const res = await AssetsMutation.deleteAsset({}, { id: '1' }, ctx);

      expect(res).toBe(true);
      expect(mockRepo.deleteAsset).toHaveBeenCalledWith('1');
    });
  });
});
