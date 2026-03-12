import { GraphQLError } from 'graphql';

import {endpointRepositoryHandler, extractTitleForSlug, mapFilters, processSlugUpdate} from './helpers';
import { GraphQLContext } from '~/back-shared/types/container/types';
import { SortByDate, SortOrder } from '~/types/enums/common.enums';

describe('endpointRepositoryHandler', () => {
  const fakeRepo = {
    findById: jest.fn().mockResolvedValue({ id: '1' })
  };

  const createMockContext = (admin: boolean): GraphQLContext => {
    return {
      admin,
      requestContainer: {
        cradle: {
          mediaMentionsRepository: fakeRepo
        }
      } as unknown as GraphQLContext['requestContainer'],
      cookieActions: [],
      setCookie: jest.fn(),
      deleteCookie: jest.fn()
    } as unknown as GraphQLContext;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw GraphQLError when admin is falsy', async () => {
    const handler = endpointRepositoryHandler('mediaMentionsRepository')<Record<string, never>, unknown>(
      async ({ repo }) => {
        return (repo as unknown as typeof fakeRepo).findById('1');
      }
    );

    const context = createMockContext(false);

    await expect(handler({}, {}, context)).rejects.toThrow(GraphQLError);
  });

  it('should call handler and return value when admin is true', async () => {
    interface Args { id: string }
    interface Result { id: string }

    const handler = endpointRepositoryHandler('mediaMentionsRepository')<Args, Result>(
      async ({ args, repo }) => {
        return (repo as unknown as typeof fakeRepo).findById(args.id);
      }
    );

    const context = createMockContext(true);
    const res = await handler({}, { id: '1' }, context);

    expect(res).toEqual({ id: '1' });
    expect(fakeRepo.findById).toHaveBeenCalledWith('1');
  });
});

describe('mapFilters', () => {
  it('should return undefined if filters are not provided', () => {
    expect(mapFilters(undefined)).toBeUndefined();
    expect(mapFilters(null)).toBeUndefined();
  });

  it('should correctly map basic filter fields', () => {
    const input = {
      status: 'published',
      slug: 'test-slug',
      limit: 10,
      skip: 0
    };

    const result = mapFilters(input);

    expect(result).toEqual({
      status: 'published',
      slug: 'test-slug',
      limit: 10,
      skip: 0,
      sort: undefined
    });
  });

  it('should correctly map sorting fields', () => {
    const input = {
      sort: [
        { field: 'createdAt', order: 'desc' },
        { field: 'adminTitle', order: 'asc' }
      ]
    };

    const result = mapFilters(input);

    expect(result?.sort).toEqual([
      { sortBy: SortByDate.CreatedAt, sortOrder: SortOrder.Desc },
      { sortBy: SortByDate.AdminTitle, sortOrder: SortOrder.Asc }
    ]);
  });
});

describe('Slug Helpers', () => {
  describe('extractTitleForSlug', () => {
    it('should extract uk title from localized object', () => {
      expect(extractTitleForSlug({ uk: 'Привіт', en: 'Hello' })).toBe('Привіт');
    });

    it('should return the string if title is already a string', () => {
      expect(extractTitleForSlug('Звичайна назва')).toBe('Звичайна назва');
    });

    it('should return empty string for invalid inputs', () => {
      expect(extractTitleForSlug(null)).toBe('');
      expect(extractTitleForSlug({})).toBe('');
    });
  });

  describe('processSlugUpdate', () => {
    const mockRepo = {
      findBySlug: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update slug property in updateData', async () => {
      mockRepo.findBySlug.mockResolvedValue(null);
      const updateData: { slug?: string } = {};

      await processSlugUpdate('123', 'Новий заголовок', mockRepo as any, updateData);

      expect(updateData.slug).toBeDefined();
      expect(typeof updateData.slug).toBe('string');
      expect(mockRepo.findBySlug).toHaveBeenCalled();
    });

    it('should not update slug if title is missing', async () => {
      const updateData: { slug?: string } = {};
      await processSlugUpdate('123', null, mockRepo as any, updateData);
      expect(updateData.slug).toBeUndefined();
    });
  });
});