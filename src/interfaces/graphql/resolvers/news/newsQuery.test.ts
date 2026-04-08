import { NewsQuery } from './newsQuery';
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { INewsRepository } from '~/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';
import { NewsFiltersInput } from '~/types/graphql/generated/graphql';

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

describe('NewsQuery Resolvers', () => {
  const mockRepo: jest.Mocked<Partial<INewsRepository>> = {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn()
  };

  const context = {
    admin: true,
    requestContainer: {
      cradle: { newsRepository: mockRepo as INewsRepository }
    }
  } as unknown as GraphQLContext;

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
        filters: { status: NewsStatus.Draft } as unknown as NewsFiltersInput
      };

      await NewsQuery.publishedNews({}, args, context);

      expect(mockRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
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
    const invalidContext = { admin: false } as unknown as GraphQLContext;
    const args = { filters: {} as unknown as NewsFiltersInput };

    await expect(NewsQuery.allNews({}, args, invalidContext)).rejects.toThrow();
  });

  describe('newsCount', () => {
    it('should call count with provided status', async () => {
      await NewsQuery.newsCount({}, { status: NewsStatus.Archived }, context);
      expect(mockRepo.count).toHaveBeenCalledWith({ status: NewsStatus.Archived });
    });

    it('should call count without status if none provided', async () => {
      await NewsQuery.newsCount({}, { status: undefined }, context);
      expect(mockRepo.count).toHaveBeenCalledWith(undefined);
    });
  });
});