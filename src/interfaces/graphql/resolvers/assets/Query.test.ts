import { AssetsQuery } from './Query';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { SortOrder } from '~/types/enums/common.enums';
import { AssetType } from '~/types/graphql/generated/graphql';

jest.mock('mongoose', () => {
  const MockSchema = jest.fn().mockImplementation(() => ({
    index: jest.fn(),
  }));

  (MockSchema as unknown as Record<string, unknown>).Types = {
    ObjectId: String,
  };

  return {
    Schema: MockSchema,
    Types: {
      ObjectId: jest.fn().mockImplementation(() => 'mocked-id'),
    },
    model: jest.fn().mockReturnValue({}),
    models: {},
  };
});

jest.mock('~/infrastructure/models/imageCrop.model', () => ({
  ImageCropModel: {
    findOneAndUpdate: jest.fn().mockResolvedValue({}),
  },
}));

describe('AssetsQuery', () => {
  it('should pass filters to assets repository', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue(['asset']) };

    const ctx = {
      admin: true,
      requestContainer: {
        cradle: { assetsRepository: repo }
      }
    } as unknown as GraphQLContext;

    const filters = {
      type: AssetType.Image,
      isStarred: true,
      sortBy: 'createdAt' as const,
      sortOrder: SortOrder.Desc,
      limit: 20,
      skip: 0
    };

    const res = await AssetsQuery.allAssets({}, { filters }, ctx);

    expect(res).toEqual(['asset']);
    expect(repo.findAll).toHaveBeenCalledWith(filters);
  });

  it('should throw when admin is missing', async () => {
    const invalidCtx = { admin: false } as unknown as GraphQLContext;
    const args = { filters: {} } as unknown as Parameters<typeof AssetsQuery.allAssets>[1];

    await expect(AssetsQuery.allAssets({}, args, invalidCtx)).rejects.toThrow();
  });
});