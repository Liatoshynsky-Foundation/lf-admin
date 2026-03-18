import { BasePage, LocalizedTitle } from '~/domain/entities/Page';
import { Patch } from '~/src/shared/types/pages/types';

export type PageRepository = {
  getPublishedBySlug(slug: string): Promise<BasePage | null>;
  getDraftBySlug(slug: string): Promise<BasePage | null>;
  createDraft(slug: string, blocks: unknown, source: BasePage): Promise<BasePage>;
  applyPatchToDraft(slug: string, patch: Patch): Promise<BasePage>;
  applyPatchToPublished(slug: string, patch: Patch, title: LocalizedTitle, pageType: string): Promise<BasePage>;
};
