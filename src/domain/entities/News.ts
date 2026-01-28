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
  publishedAt: string | null;
  newsDate?: string | null;
  createdAt: string;
  updatedAt: string;
  title: LocalizedContent;
  description?: LocalizedContent;
  content: LocalizedContent;
  slug: string;
  coverImage: NewsImageBlock;
  status: NewsStatus;
  meta: NewsMeta;
};
