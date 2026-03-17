import mongoose, { Model } from 'mongoose';

import { createBaseRepository } from '../baseRepository/baseRepository';
import { News } from '~/domain/entities/News';
import { CreateNewsInput, INewsRepository,NewsFilters } from '~/domain/repositories/newsRepository';
import dbConnect from '~/infrastructure/db/connect';
import {buildBaseQuery, createToEntity, getBaseSort} from '~/infrastructure/repositories/helpers';
import { NewsStatus } from '~/types/enums/common.enums';

export type DbNews = {
  _id: { toString(): string };
  publishedAt: string | null;
  newsDate?: string | null;
  title: News['title'];
  adminTitle: News['adminTitle'];
  description: News['description'];
  keywords: News['keywords'];
  allowIndexation: News['allowIndexation'];
  content: News['content'];
  slug: string;
  coverImage: News['coverImage'];
  status: NewsStatus;
  meta: News['meta'];
  createdAt: string;
  updatedAt: string;
};

type NewsRepoDeps = Readonly<{
  NewsModel: Model<DbNews>;
}>;

const toEntity = (doc: DbNews): News =>
  createToEntity<News, DbNews>(doc, {
    adminTitle: doc.adminTitle,
    title: doc.title,
    description: doc.description,
    keywords: doc.keywords,
    allowIndexation: doc.allowIndexation,
    slug: doc.slug,
    content: doc.content,
    coverImage: doc.coverImage,
    status: doc.status,
    meta: doc.meta,
    newsDate: doc.newsDate ?? undefined,
    publishedAt: doc.publishedAt ?? undefined,
  });

export const NewsRepository = ({ NewsModel }: NewsRepoDeps): INewsRepository => {
  const baseRepo = createBaseRepository<News, DbNews, NewsFilters>({
    model: NewsModel as Model<DbNews>,
    toEntity,
    buildQuery: buildBaseQuery,
    getDefaultSort: getBaseSort
  });

  return {
    ...baseRepo,
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

      if (!mongoose.Types.ObjectId.isValid(id)) return null;

      const updated = await NewsModel.findByIdAndUpdate(
        id,
        { $inc: { 'meta.views': 1 } },
        { new: true }
      ).lean<DbNews>();

      return updated ? toEntity(updated) : null;
    }
  };
};
