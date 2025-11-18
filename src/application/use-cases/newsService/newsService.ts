import { News } from '~/domain/entities/News';
import { CreateNewsInput, NewsFilters, NewsRepository, UpdateNewsInput } from '~/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';

type Repo = NewsRepository;

export type CreateNewsServiceInput = Omit<CreateNewsInput, 'status' | 'publishedAt'> & {
  status?: NewsStatus;
  publishedAt?: Date | null;
};

export type UpdateNewsServiceInput = UpdateNewsInput;

export type PublishNewsInput = {
  id: string;
  publishedAt?: Date;
};

export const NewsService = ({ newsRepository }: { newsRepository: Repo }) => ({
  createNews: async (input: CreateNewsServiceInput): Promise<News> => {
    const existingNews = await newsRepository.findBySlug(input.slug);

    if (existingNews) {
      throw new Error(`News with slug "${input.slug}" already exists`);
    }

    const newsData: CreateNewsInput = {
      ...input,
      status: input.status ?? NewsStatus.Draft,
      publishedAt: input.publishedAt ?? null,
      meta: {
        views: 0
      }
    };

    return newsRepository.create(newsData);
  },

  getNewsById: async (id: string): Promise<News | null> => {
    return newsRepository.findById(id);
  },

  getNewsBySlug: async (slug: string): Promise<News | null> => {
    return newsRepository.findBySlug(slug);
  },

  getAllNews: async (filters?: NewsFilters): Promise<News[]> => {
    return newsRepository.findAll(filters);
  },

  getPublishedNews: async (filters?: Omit<NewsFilters, 'status'>): Promise<News[]> => {
    return newsRepository.findAll({
      ...filters,
      status: NewsStatus.Published
    });
  },

  updateNews: async (id: string, input: UpdateNewsServiceInput): Promise<News> => {
    if (input.slug) {
      const existingNews = await newsRepository.findBySlug(input.slug);
      if (existingNews && existingNews.id !== id) {
        throw new Error(`News with slug "${input.slug}" already exists`);
      }
    }

    const updated = await newsRepository.update(id, input);
    if (!updated) {
      throw new Error(`News with id "${id}" not found`);
    }

    return updated;
  },

  publishNews: async (input: PublishNewsInput): Promise<News> => {
    const { id, publishedAt } = input;

    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error(`News with id "${id}" not found`);
    }

    const updateData: UpdateNewsInput = {
      status: NewsStatus.Published,
      publishedAt: publishedAt ?? new Date()
    };

    const updated = await newsRepository.update(id, updateData);
    if (!updated) {
      throw new Error(`Failed to publish news with id "${id}"`);
    }

    return updated;
  },

  unpublishNews: async (id: string): Promise<News> => {
    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error(`News with id "${id}" not found`);
    }

    const updated = await newsRepository.update(id, {
      status: NewsStatus.Draft,
      publishedAt: null
    });

    if (!updated) {
      throw new Error(`Failed to unpublish news with id "${id}"`);
    }

    return updated;
  },

  archiveNews: async (id: string): Promise<News> => {
    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error(`News with id "${id}" not found`);
    }

    const updated = await newsRepository.update(id, {
      status: NewsStatus.Archived
    });

    if (!updated) {
      throw new Error(`Failed to archive news with id "${id}"`);
    }

    return updated;
  },

  hideNews: async (id: string): Promise<News> => {
    const news = await newsRepository.findById(id);
    if (!news) {
      throw new Error(`News with id "${id}" not found`);
    }

    const updated = await newsRepository.update(id, {
      status: NewsStatus.Hidden
    });

    if (!updated) {
      throw new Error(`Failed to hide news with id "${id}"`);
    }

    return updated;
  },

  deleteNews: async (id: string): Promise<boolean> => {
    const deleted = await newsRepository.delete(id);
    if (!deleted) {
      throw new Error(`News with id "${id}" not found or could not be deleted`);
    }
    return deleted;
  },

  getNewsCount: async (filters?: Omit<NewsFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number> => {
    return newsRepository.count(filters);
  },

  incrementViews: async (id: string): Promise<News> => {
    const updated = await newsRepository.incrementViews(id);
    if (!updated) {
      throw new Error(`News with id "${id}" not found`);
    }
    return updated;
  },

  getPaginatedNews: async (
    page: number = 1,
    limit: number = 10,
    filters?: Omit<NewsFilters, 'limit' | 'skip'>
  ): Promise<{ news: News[]; total: number; page: number; totalPages: number }> => {
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      newsRepository.findAll({
        ...filters,
        limit,
        skip
      }),
      newsRepository.count(filters)
    ]);

    return {
      news,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
});
