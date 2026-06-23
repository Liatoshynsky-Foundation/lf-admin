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

  describe('pageBlocks with draft status', () => {
    it('should return page when found (draft)', async () => {
      const page = { id: 'd', blocks: [] };
      const repo = { getPublishedBySlug: jest.fn(), getDraftBySlug: jest.fn().mockResolvedValue(page) };
      const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as unknown as GraphQLContext;
      const res = await Query.pageBlocks({}, { slug: 'd', status: PageStatus.Draft }, ctx);
      expect(res).toBe(page);
      expect(repo.getDraftBySlug).toHaveBeenCalledWith('d');
    });
  });

  describe('pages', () => {
    it('should throw if not admin', async () => {
      await expect(
        Query.pages({}, { category: 'foundation' as any }, { admin: false } as unknown as GraphQLContext)
      ).rejects.toThrow(GraphQLError);
    });

    it('should return pages list when pages are found', async () => {
      const mockPages = [{ id: 'p1', title: 'Page 1' }];
      const repo = { findPages: jest.fn().mockResolvedValue(mockPages) };
      const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as unknown as GraphQLContext;
      const res = await Query.pages({}, { category: 'foundation' as any }, ctx);
      expect(res).toBe(mockPages);
      expect(repo.findPages).toHaveBeenCalledWith('foundation');
    });

    it('should throw NOT_FOUND when pages list is empty', async () => {
      const repo = { findPages: jest.fn().mockResolvedValue([]) };
      const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as unknown as GraphQLContext;
      await expect(
        Query.pages({}, { category: 'foundation' as any }, ctx)
      ).rejects.toThrow(GraphQLError);
    });

    it('should throw NOT_FOUND when pages is null', async () => {
      const repo = { findPages: jest.fn().mockResolvedValue(null) };
      const ctx = { admin: true, requestContainer: { cradle: { pageRepository: repo } } } as unknown as GraphQLContext;
      await expect(
        Query.pages({}, { category: 'foundation' as any }, ctx)
      ).rejects.toThrow(GraphQLError);
    });
  });
});
