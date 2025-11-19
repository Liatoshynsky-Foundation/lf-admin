import { Model, Types } from 'mongoose';

import { News } from '~/domain/entities/News';
import {
  CreateNewsInput,
  NewsFilters,
  NewsRepository as INewsRepository,
  UpdateNewsInput
} from '~/domain/repositories/newsRepository';
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
  coverImage: string;
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

export const NewsRepository = ({ NewsModel }: NewsRepoDeps): INewsRepository => {
  return {
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

    findById: async (id: string): Promise<News | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const doc = await NewsModel.findById(id).lean<DbNews>();
      return doc ? toEntity(doc) : null;
    },

    findBySlug: async (slug: string): Promise<News | null> => {
      await dbConnect();

      const doc = await NewsModel.findOne({ slug }).lean<DbNews>();
      return doc ? toEntity(doc) : null;
    },

    findAll: async (filters?: NewsFilters): Promise<News[]> => {
      await dbConnect();

      const query: Record<string, unknown> = {};

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.slug) {
        query.slug = filters.slug;
      }

      const sortBy = filters?.sortBy ?? 'createdAt';
      const sortOrder = filters?.sortOrder ?? 'desc';
      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === 'asc' ? 1 : -1
      };

      const queryBuilder = NewsModel.find(query).sort(sort);

      if (filters?.skip) {
        queryBuilder.skip(filters.skip);
      }

      if (filters?.limit) {
        queryBuilder.limit(filters.limit);
      }

      const docs = await queryBuilder.lean<DbNews[]>();
      return docs.map(toEntity);
    },

    update: async (id: string, input: UpdateNewsInput): Promise<News | null> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return null;
      }

      const updated = await NewsModel.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true
      }).lean<DbNews>();

      return updated ? toEntity(updated) : null;
    },

    delete: async (id: string): Promise<boolean> => {
      await dbConnect();

      if (!Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await NewsModel.findByIdAndDelete(id);
      return result !== null;
    },

    count: async (filters?: Omit<NewsFilters, 'limit' | 'skip' | 'sortBy' | 'sortOrder'>): Promise<number> => {
      await dbConnect();

      const query: Record<string, unknown> = {};

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.slug) {
        query.slug = filters.slug;
      }

      return NewsModel.countDocuments(query);
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
