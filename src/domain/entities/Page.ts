import { PageStatus } from '~/back-shared/types/enums/common.enums';
import { BlockData } from '~/store/types';

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
