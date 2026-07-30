import { MediaMentionsQuery } from './mediaMentionQuery';
import type { IMediaMentionsRepository } from '~/domain/repositories/mediaMentionsRepository';
import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';
import { MediaStatus, SortOrder } from '~/types/enums/common.enums';
import { type MediaMentionsFiltersInput, MediaMentionsSortBy } from '~/types/graphql/generated/graphql';

jest.mock('mongoose');
jest.mock('~/infrastructure/models/imageCrop.model');

describe('MediaMentionsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<IMediaMentionsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    count: jest.fn()
  };

  const context = createMockContext(true, 'mediaMentionsRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allMediaMentions: should map complex sort array accurately', async () => {
    const args = {
      filters: {
        sort: [{ field: MediaMentionsSortBy.AdminTitle, order: SortOrder.Desc }]
      } as unknown as MediaMentionsFiltersInput
    };

    await MediaMentionsQuery.allMediaMentions({}, args, context);

    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: [{ sortBy: 'adminTitle', sortOrder: SortOrder.Desc }]
      })
    );
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

    expect(mockRepo.count).toHaveBeenCalledWith({ statuses: [MediaStatus.Published] });
  });

  it('publishedMediaMentions: should force published status', async () => {
    const args = {
      filters: { statuses: [MediaStatus.Draft] } as unknown as MediaMentionsFiltersInput
    };

    await MediaMentionsQuery.publishedMediaMentions({}, args, context);

    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        statuses: [MediaStatus.Published]
      })
    );
  });

  it('mediaMentionById: should find media mention by id', async () => {
    const id = 'test-id';
    await MediaMentionsQuery.mediaMentionById({}, { id }, context);

    expect(mockRepo.findById).toHaveBeenCalledWith(id);
  });

  it('mediaMentionBySlug: should find media mention by slug', async () => {
    const slug = 'test-slug';
    await MediaMentionsQuery.mediaMentionBySlug({}, { slug }, context);

    expect(mockRepo.findBySlug).toHaveBeenCalledWith(slug);
  });

  it('mediaMentionsCount: should handle undefined status', async () => {
    await MediaMentionsQuery.mediaMentionsCount({}, {}, context);

    expect(mockRepo.count).toHaveBeenCalledWith(undefined);
  });
});
