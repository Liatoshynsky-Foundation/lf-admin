import { GraphQLError } from 'graphql';

import { Query } from './Query';
import { GraphQLContext } from '~/back-shared/types/container/types';
import { PageStatus } from '~/types/enums/common.enums';

describe('page Query', () => {
  it('should throw if not admin', async () => {
    await expect(Query.pageBlocks({}, { slug: 's' }, { admin: false } as unknown as GraphQLContext)).rejects.toThrow(GraphQLError);
  });

  it('should return page when found (published)', async () => {
    const page = { id: 'p', blocks: [] };
    const repo = { getPublishedBySlug: jest.fn().mockResolvedValue(page), getDraftBySlug: jest.fn() };
    const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as unknown as GraphQLContext;
    const res = await Query.pageBlocks({}, { slug: 'p', status: PageStatus.Published }, ctx);
    expect(res).toBe(page);
    expect(repo.getPublishedBySlug).toHaveBeenCalledWith('p');
  });

  it('should throw NOT_FOUND when page missing', async () => {
    const repo = { getPublishedBySlug: jest.fn().mockResolvedValue(null), getDraftBySlug: jest.fn() };
    const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as unknown as GraphQLContext;
    await expect(Query.pageBlocks({}, { slug: 'x' }, ctx)).rejects.toThrow(GraphQLError);
  });
});
