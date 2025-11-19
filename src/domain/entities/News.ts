import { NewsStatus } from '~/types/enums/common.enums';

export type LocalizedContent = {
  uk: any;
  en: any;
};

export type NewsMeta = {
  views: number;
};

export type News = {
  id: string;
  publishedAt: Date | null;
  newsDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  title: LocalizedContent;
  description?: LocalizedContent;
  content: LocalizedContent;
  slug: string;
  coverImage: string;
  status: NewsStatus;
  meta: NewsMeta;
};
