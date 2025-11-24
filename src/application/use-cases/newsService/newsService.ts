import { createBaseService } from '../baseService/baseService';
import { newsServiceErrors } from '~/back-constants/errors';
import { generateUniqueSlug } from '~/back-shared/utils';
import { News } from '~/domain/entities/News';
import { CreateNewsInput, NewsFilters, NewsRepository, UpdateNewsInput } from '~/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';

type Repo = NewsRepository;

export type CreateNewsServiceInput = Omit<CreateNewsInput, 'status' | 'publishedAt' | 'slug'> & {
  status?: NewsStatus;
  publishedAt?: Date | null;
};

export type UpdateNewsServiceInput = Omit<UpdateNewsInput, 'slug'>;

export type PublishNewsInput = {
  id: string;
  publishedAt?: Date;
};

export const NewsService = ({ newsRepository }: { newsRepository: Repo }) => {
  const baseService = createBaseService<News, NewsFilters>({
    repository: newsRepository,
    entityName: 'News'
  });

  return {
    getNewsById: baseService.getById,
    getAllNews: baseService.getAll,
    getNewsCount: baseService.getCount,
    deleteNews: baseService.delete,

    updateNews: async (id: string, input: UpdateNewsServiceInput): Promise<News> => {
      const updateData: UpdateNewsInput = { ...input };

      if (input.title) {
        const news = await newsRepository.findById(id);
        if (!news) {
          throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
        }

        const titleForSlug =
          typeof input.title === 'object' && 'uk' in input.title
            ? (input.title.uk as string)
            : typeof input.title === 'string'
              ? input.title
              : '';

        if (titleForSlug) {
          const newSlug = await generateUniqueSlug(titleForSlug, {
            checkExists: async (slug: string) => {
              const existing = await newsRepository.findBySlug(slug);
              return existing !== null && existing.id !== id;
            }
          });

          updateData.slug = newSlug;
        }
      }

      return baseService.update(id, updateData);
    },

    getPaginatedNews: async (
      page: number = 1,
      limit: number = 10,
      filters?: Omit<NewsFilters, 'limit' | 'skip'>
    ): Promise<{ news: News[]; total: number; page: number; totalPages: number }> => {
      const result = await baseService.getPaginated(page, limit, filters);
      return {
        news: result.items,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      };
    },

    createNews: async (input: CreateNewsServiceInput): Promise<News> => {
      const titleForSlug =
        typeof input.title === 'object' && 'uk' in input.title
          ? (input.title.uk as string)
          : typeof input.title === 'string'
            ? input.title
            : '';

      if (!titleForSlug) {
        throw new Error(newsServiceErrors.TITLE_REQUIRED_FOR_SLUG);
      }

      const slug = await generateUniqueSlug(titleForSlug, {
        checkExists: async (slug: string) => {
          const existing = await newsRepository.findBySlug(slug);
          return existing !== null;
        }
      });

      const newsData: CreateNewsInput = {
        ...input,
        slug,
        status: input.status ?? NewsStatus.Draft,
        publishedAt: input.publishedAt ?? null,
        meta: {
          views: 0
        }
      };

      return newsRepository.create(newsData);
    },

    getNewsBySlug: async (slug: string): Promise<News | null> => {
      return newsRepository.findBySlug(slug);
    },

    getPublishedNews: async (filters?: Omit<NewsFilters, 'status'>): Promise<News[]> => {
      return newsRepository.findAll({
        ...filters,
        status: NewsStatus.Published
      });
    },

    publishNews: async (input: PublishNewsInput): Promise<News> => {
      const { id, publishedAt } = input;

      const news = await newsRepository.findById(id);
      if (!news) {
        throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
      }

      const updateData: UpdateNewsInput = {
        status: NewsStatus.Published,
        publishedAt: publishedAt ?? new Date()
      };

      const updated = await newsRepository.update(id, updateData);
      if (!updated) {
        throw new Error(newsServiceErrors.FAILED_TO_PUBLISH(id));
      }

      return updated;
    },

    unpublishNews: async (id: string): Promise<News> => {
      const news = await newsRepository.findById(id);
      if (!news) {
        throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
      }

      const updated = await newsRepository.update(id, {
        status: NewsStatus.Draft,
        publishedAt: null
      });

      if (!updated) {
        throw new Error(newsServiceErrors.FAILED_TO_UNPUBLISH(id));
      }

      return updated;
    },

    archiveNews: async (id: string): Promise<News> => {
      const news = await newsRepository.findById(id);
      if (!news) {
        throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
      }

      const updated = await newsRepository.update(id, {
        status: NewsStatus.Archived
      });

      if (!updated) {
        throw new Error(newsServiceErrors.FAILED_TO_ARCHIVE(id));
      }

      return updated;
    },

    hideNews: async (id: string): Promise<News> => {
      const news = await newsRepository.findById(id);
      if (!news) {
        throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
      }

      const updated = await newsRepository.update(id, {
        status: NewsStatus.Hidden
      });

      if (!updated) {
        throw new Error(newsServiceErrors.FAILED_TO_HIDE(id));
      }

      return updated;
    },

    incrementViews: async (id: string): Promise<News> => {
      const updated = await newsRepository.incrementViews(id);
      if (!updated) {
        throw new Error(newsServiceErrors.NEWS_NOT_FOUND(id));
      }
      return updated;
    }
  };
};
