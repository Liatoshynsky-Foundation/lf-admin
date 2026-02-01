import { NewsStatus } from '~/types/enums/common.enums';

export type LocalizedContent = {
  uk: unknown;
  en: unknown;
};

export type NewsMeta = {
  views: number;
};

export type NewsImageBlock = {
  src: string;
  alt: LocalizedContent;
  caption: LocalizedContent;
  isTmp?: boolean;
};

export type News = {
  id: string;
  publishedAt?: Date;
  newsDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  title: LocalizedContent;
  description?: LocalizedContent;
  content: LocalizedContent;
  slug: string;
  coverImage: NewsImageBlock;
  status: NewsStatus;
  meta: NewsMeta;
};
