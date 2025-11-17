import { NewsStatus } from '~/types/enums/common.enums';

export type LocalizedContent = {
  uk: string;
  en: string;
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
  subtitle?: LocalizedContent;
  content: LocalizedContent;
  slug: string;
  coverImage: string;
  status: NewsStatus;
  meta: NewsMeta;
};
