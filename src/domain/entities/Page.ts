import { BlockData } from '~/store/types';

export type LocalizedTitle = {
  uk: string;
  en: string;
};

export type BasePage = {
  id: string;
  slug: string;
  title: LocalizedTitle;
  status: 'draft' | 'published';
  pageType: string;
  blocks: Record<string, BlockData>;
  createdAt: string;
  updatedAt: string;
};
