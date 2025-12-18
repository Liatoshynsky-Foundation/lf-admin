import { FilterQuery, Model, Types } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { News } from '~/domain/entities/News';
import { CreateNewsInput, NewsFilters, NewsRepository as INewsRepository } from '~/domain/repositories/newsRepository';
import dbConnect from '~/infrastructure/db/connect';
import { NewsStatus } from '~/types/enums/common.enums';

type DbNews = {
  _id: Types.ObjectId;
  publishedAt: Date | null;
  newsDate?: Date | null;
  title: News['title'];
  description?: News['description'];
  content: News['content'];
  slug: string;
  coverImage: News['coverImage'];
  status: NewsStatus;
  meta: News['meta'];
  createdAt: Date | string;
  updatedAt: Date | string;
};

type NewsRepoDeps = Readonly<{
  NewsModel: Model<News>;
}>;

const dateToIso = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  return date instanceof Date ? date.toISOString() : date;
};

const toEntity = (doc: DbNews): News => ({
  id: doc._id.toString(),
  publishedAt: doc.publishedAt,
  newsDate: doc.newsDate ?? null,
  title: doc.title,
  description: doc.description,
  content: doc.content,
  slug: doc.slug,
  coverImage: doc.coverImage,
  status: doc.status,
  meta: doc.meta,
  createdAt: dateToIso(doc.createdAt) as unknown as News['createdAt'],
  updatedAt: dateToIso(doc.updatedAt) as unknown as News['updatedAt']
});

const buildNewsQuery = (filters?: Omit<NewsFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): FilterQuery<any> => {
  const query: Record<string, unknown> = {};

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.slug) {
    query.slug = filters.slug;
  }

  return query;
};

const getNewsSort = (filters?: NewsFilters): Record<string, 1 | -1> => {
  const sortBy = filters?.sortBy ?? 'createdAt';
  const sortOrder = filters?.sortOrder ?? 'desc';
  return {
    [sortBy]: sortOrder === 'asc' ? 1 : -1
  };
};

export const NewsRepository = ({ NewsModel }: NewsRepoDeps): INewsRepository => {
  const baseRepo = createBaseRepository<News, DbNews, NewsFilters>({
    model: NewsModel as unknown as Model<DbNews>,
    toEntity,
    buildQuery: buildNewsQuery,
    getDefaultSort: getNewsSort
  });

  return {
    findBySlug: baseRepo.findBySlug,
    findById: baseRepo.findById,
    findAll: baseRepo.findAll,
    update: baseRepo.update,
    delete: baseRepo.delete,
    count: baseRepo.count,

    create: async (input: CreateNewsInput): Promise<News> => {
      await dbConnect();

      const newsData = {
        ...input,
        meta: {
          views: input.meta?.views ?? 0
        }
      };

      const newNews = await new NewsModel(newsData).save();
      return toEntity(newNews.toObject() as unknown as DbNews);
    },

    incrementViews: async (id: string): Promise<News | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const updated = await NewsModel.findByIdAndUpdate(
        id,
        { $inc: { 'meta.views': 1 } },
        { new: true }
      ).lean<DbNews>();

      return updated ? toEntity(updated) : null;
    }
  };
};
