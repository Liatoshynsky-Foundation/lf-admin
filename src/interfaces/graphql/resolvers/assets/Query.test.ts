import { AssetsQuery } from './Query';

describe('AssetsQuery', () => {
  it('should pass filters to assets repository', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue(['asset']) };
    const ctx = { admin: true, requestContainer: { cradle: { assetsRepository: repo } } } as never;

    const filters = {
      type: 'image',
      isStarred: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      skip: 0
    };

    const res = await AssetsQuery.allAssets({}, { filters }, ctx);

    expect(res).toEqual(['asset']);
    expect(repo.findAll).toHaveBeenCalledWith(filters);
  });

  it('should throw when admin is missing', async () => {
    await expect(AssetsQuery.allAssets({}, { filters: {} } as never, { admin: false } as never)).rejects.toThrow();
  });
});
