import { LocalizedImage } from './BaseContent';
import { BlockData } from '~/store/types';
import { PageCategories, PageStatus } from '~/types/enums/common.enums';

export type LocalizedTitle = {
  uk: string;
  en: string;
};

export type BasePage = {
  id: string;
  slug: string;
  title: LocalizedTitle;
  status: PageStatus;
  pageType: string;
  category: PageCategories;
  coverImage: LocalizedImage;
  blocks: Record<string, BlockData>;
  createdAt: string;
  updatedAt: string;
};
