import { MediaMentionsQuery } from './MediaMentionQuery';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import type { IMediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import {  SortOrder } from '~/types/enums/common.enums';
import type { MediaMentionsFiltersInput } from '~/types/graphql/generated/graphql';

describe('MediaMentionsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IMediaMentionsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findById: jest.fn(),
    count: jest.fn()
  };

  const context = {
    admin: true,
    requestContainer: {
      cradle: { mediaMentionsRepository: mockRepo as IMediaMentionsRepository }
    }
  } as unknown as GraphQLContext;

  it('allMediaMentions: should map complex sort array accurately', async () => {
    const args = {
      filters: {
        sort: [{ field: 'adminTitle', order: SortOrder.Desc }]
      } as unknown as MediaMentionsFiltersInput
    };

    await MediaMentionsQuery.allMediaMentions({}, args, context);

    expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
      sort: [{ sortBy: 'adminTitle', sortOrder: SortOrder.Desc }]
    }));
  });

  it('paginatedMediaMentions: should pass correct page and limit', async () => {
    const args = { page: 2, limit: 5, filters: {} };

    await MediaMentionsQuery.paginatedMediaMentions({}, args, context);

    expect(mockRepo.findPaginated).toHaveBeenCalledWith(2, 5, expect.any(Object));
  });
});