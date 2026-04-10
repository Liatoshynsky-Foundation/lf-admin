import { createMockContext } from '../testUtils';
import { AllAssetsArgs, AssetsQuery } from './Query';
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

    await expect(AssetsQuery.allAssets({}, args as never, invalidCtx))
      .rejects.toThrow();
  });
});