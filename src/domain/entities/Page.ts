import { BlockData } from '~/store/types';
import { PageStatus } from '~/types/enums/common.enums';

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
  blocks: Record<string, BlockData>;
  createdAt: string;
  updatedAt: string;
};
