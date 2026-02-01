import { NewsQuery } from './NewsQuery';

describe('NewsQuery', () => {
  it('should map filters and call findAll', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue(['n']) };
    const ctx = { admin: true, requestContainer: { cradle: { newsRepository: repo } } } as any;

    const res = await NewsQuery.allNews(
      {},
      { filters: { status: 'PUBLISHED', slug: 's', sortBy: 'createdAt', sortOrder: 'asc' } },
      ctx
    );
    expect(res).toEqual(['n']);
    expect(repo.findAll).toHaveBeenCalledWith({
      status: 'PUBLISHED',
      slug: 's',
      sortBy: 'createdAt',
      sortOrder: 'asc'
    });
  });

  it('should throw when admin missing', async () => {
    await expect(NewsQuery.allNews({}, { filters: {} } as any, { admin: false } as any)).rejects.toThrow();
  });
});
