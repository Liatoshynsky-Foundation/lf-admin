import { BasePage, LocalizedTitle } from '~/domain/entities/Page';
import { Patch } from '~/src/shared/types/pages/types';
import { PageCategory } from '~/types/enums/common.enums';

export type PageRepository = {
  getPublishedBySlug(slug: string): Promise<BasePage | null>;
  getDraftBySlug(slug: string): Promise<BasePage | null>;
  createDraft(slug: string, blocks: unknown, blocksOrder: string[], source: BasePage): Promise<BasePage>;
  applyPatchToDraft(slug: string, blocksOrder: string[], patch: Patch): Promise<BasePage>;
  applyPatchToPublished(slug: string, patch: Patch, blocksOrder: string[], title: LocalizedTitle, pageType: string): Promise<BasePage>;
  findPages(category?: PageCategory): Promise<BasePage[]>;
};
