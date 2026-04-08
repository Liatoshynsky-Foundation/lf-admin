import { createMockContext } from '~/interfaces/graphql/resolvers/testUtils';
import { INewsRepository } from '~/src/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';
import { NewsFiltersInput } from '~/types/graphql/generated/graphql';

jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(() => ({
    index: jest.fn(),
  }));

  (mockSchema as unknown as Record<string, unknown>).Types = {
    ObjectId: String,
  };

  return {
    Schema: mockSchema,
    Types: {
      ObjectId: jest.fn().mockImplementation(() => 'mocked-id'),
    },
    model: jest.fn().mockReturnValue({
      index: jest.fn(),
    }),
    models: {},
  };
});

jest.mock('~/infrastructure/models/imageCrop.model', () => ({
  ImageCropModel: {
    findOneAndUpdate: jest.fn(),
    index: jest.fn(),
  },
}));

import { NewsQuery } from './newsQuery';

describe('NewsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<INewsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn()
  };

  const context = createMockContext(true, 'newsRepository', mockRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('allNews & Complex Filtering', () => {
    it('should map full filters input including slug and status', async () => {
      const args = {
        filters: {
          slug: 'test-slug',
          status: NewsStatus.Published,
          limit: 10,
          skip: 0
        } as unknown as NewsFiltersInput
      };

      await NewsQuery.allNews({}, args, context);

      expect(mockRepo.findAll).toHaveBeenCalledWith({
        slug: 'test-slug',
        status: NewsStatus.Published,
        limit: 10,
        skip: 0,
        sort: undefined
      });
    });

    it('publishedNews: should force published status even if filters provide another', async () => {
      const args = {
        filters: {
          slug: 'test-slug',
          status: NewsStatus.Draft
        } as unknown as NewsFiltersInput
      };

      await NewsQuery.publishedNews({}, args, context);

      expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'test-slug',
        status: NewsStatus.Published
      }));
    });
  });

  describe('paginatedNews', () => {
    it('should pass page and limit parameters correctly', async () => {
      const args = {
        page: 2,
        limit: 5,
        filters: { slug: 'search' } as unknown as NewsFiltersInput
      };

      await NewsQuery.paginatedNews({}, args, context);

      expect(mockRepo.findPaginated).toHaveBeenCalledWith(
        2,
        5,
        expect.objectContaining({ slug: 'search' })
      );
    });
  });

  it('should throw when admin missing', async () => {
    const invalidContext = createMockContext(false, 'newsRepository', mockRepo);
    await expect(NewsQuery.allNews({}, { filters: {} as NewsFiltersInput }, invalidContext))
      .rejects.toThrow();
  });
});