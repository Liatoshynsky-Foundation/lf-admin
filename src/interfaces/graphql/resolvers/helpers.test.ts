import { GraphQLError } from 'graphql';

import {endpointRepositoryHandler, mapFilters} from './helpers';
import {GraphQLContext} from '~/src/shared/types/container/types';
import {SortByDate, SortOrder} from '~/types/enums/common.enums';

describe('endpointRepositoryHandler', () => {
  const fakeRepo = {
    findById: jest.fn().mockResolvedValue({ id: '1' })
  };

  const createMockContext = (admin: boolean): GraphQLContext => ({
    admin,
    requestContainer: {
      cradle: {
        mediaMentionsRepository: fakeRepo
      }
    } as unknown as GraphQLContext['requestContainer']
  } as GraphQLContext);

  it('should throw GraphQLError when admin is falsy', async () => {
    const handler = endpointRepositoryHandler('mediaMentionsRepository')(
      async ({ repo }) => (repo as typeof fakeRepo).findById('1')
    );

    const context = createMockContext(false);
    await expect(handler({}, {}, context)).rejects.toThrow(GraphQLError);
  });

  it('should call handler and return value when admin is true', async () => {
    interface Args { id: string }

    const handler = endpointRepositoryHandler<'mediaMentionsRepository', Args>('mediaMentionsRepository')(
      async ({ args, repo }) => (repo as typeof fakeRepo).findById(args.id)
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

  it('should handle partial filters and null values', () => {
    const input = {
      status: 'draft',
      slug: null,
      limit: undefined
    };

    const result = mapFilters(input);

    expect(result).toEqual({
      status: 'draft',
      slug: undefined,
      limit: undefined,
      skip: undefined,
      sort: undefined
    });
  });

  it('should work with generic type constraints', () => {
    interface CustomFilters {
      status?: string;
      slug?: string;
      limit?: number;
    }

    const result = mapFilters<CustomFilters>({ status: 'published' });

    expect(result?.status).toBe('published');
  });
});
