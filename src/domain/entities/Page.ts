import { LocalizedString } from './BaseContent';
import { BlockData } from '~/store/types';
import { PageCategories, PageStatus } from '~/types/enums/common.enums';


export type LocalizedTitle = {
  uk: string;
  en: string;
};

export type PageCoverImage = {
  src: string;
  alt: LocalizedString;
};

export type BasePage = {
  id: string;
  slug: string;
  title: LocalizedTitle;
  status: PageStatus;
  pageType: string;
  category: PageCategories;
  coverImage: PageCoverImage;
  blocks: Record<string, BlockData>;
  blocksOrder: string[];
  createdAt: string;
  updatedAt: string;
};
