import { GraphQLError } from 'graphql';

import { Query } from './Query';

describe('page Query', () => {
  it('should throw if not admin', async () => {
    await expect(Query.pageBlocks({}, { slug: 's' } as any, { admin: false } as any)).rejects.toThrow(GraphQLError);
  });

  it('should return page when found (published)', async () => {
    const page = { id: 'p', blocks: [] };
    const repo = { getPublishedBySlug: jest.fn().mockResolvedValue(page), getDraftBySlug: jest.fn() };
    const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as any;
    const res = await Query.pageBlocks({}, { slug: 'p' } as any, ctx);
    expect(res).toBe(page);
    expect(repo.getPublishedBySlug).toHaveBeenCalledWith('p');
  });

  it('should throw NOT_FOUND when page missing', async () => {
    const repo = { getPublishedBySlug: jest.fn().mockResolvedValue(null), getDraftBySlug: jest.fn() };
    const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as any;
    await expect(Query.pageBlocks({}, { slug: 'x' } as any, ctx)).rejects.toThrow(GraphQLError);
  });
});
