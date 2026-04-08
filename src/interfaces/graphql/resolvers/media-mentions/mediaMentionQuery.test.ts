import { MediaMentionsQuery } from './mediaMentionQuery';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import type { IMediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { MediaStatus, SortOrder } from '~/types/enums/common.enums';
import type { MediaMentionsFiltersInput } from '~/types/graphql/generated/graphql';

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

describe('MediaMentionsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IMediaMentionsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    count: jest.fn()
  };

  const context = {
    admin: true,
    requestContainer: {
      cradle: { mediaMentionsRepository: mockRepo as IMediaMentionsRepository }
    }
  } as unknown as GraphQLContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    const args = {
      page: 2,
      limit: 5,
      filters: {} as unknown as MediaMentionsFiltersInput
    };

    await MediaMentionsQuery.paginatedMediaMentions({}, args, context);

    expect(mockRepo.findPaginated).toHaveBeenCalledWith(2, 5, expect.any(Object));
  });

  it('mediaMentionsCount: should handle status filtering', async () => {
    const args = { status: MediaStatus.Published };

    await MediaMentionsQuery.mediaMentionsCount({}, args, context);

    expect(mockRepo.count).toHaveBeenCalledWith({ status: MediaStatus.Published });
  });

  it('publishedMediaMentions: should force published status', async () => {
    const args = {
      filters: { status: MediaStatus.Draft } as unknown as MediaMentionsFiltersInput
    };

    await MediaMentionsQuery.publishedMediaMentions({}, args, context);

    expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
      status: MediaStatus.Published
    }));
  });
});