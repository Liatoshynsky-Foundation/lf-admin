import type { PageSection } from './pageSection.types';
import { ensureIds } from '~/lib/utils/ensureIds';
import { normalizeLocalizedJSON } from '~/lib/utils/localizedJson';
import {
  MANAGED_PAGE_SECTION_BLOCK_KIND,
  type ManagedPageSectionBlock
} from '~/types/store/pages/managedPageSectionBlock';

export const isManagedPageSectionBlock = (value: unknown): value is ManagedPageSectionBlock =>
  typeof value === 'object' && value !== null && (value as { kind?: unknown }).kind === MANAGED_PAGE_SECTION_BLOCK_KIND;

export const sectionToBlock = (section: PageSection, hidden = false): ManagedPageSectionBlock => ({
  kind: MANAGED_PAGE_SECTION_BLOCK_KIND,
  title: normalizeLocalizedJSON(section.title),
  items: ensureIds(section.items),
  hidden
});

export const blockToSection = (blockId: string, block: ManagedPageSectionBlock): PageSection => ({
  id: blockId,
  title: normalizeLocalizedJSON(block.title),
  items: ensureIds(block.items)
});

export const pickManagedSectionIds = (blocksOrder: string[], blocks: Record<string, unknown> | undefined): string[] =>
  blocksOrder.filter((blockId) => isManagedPageSectionBlock(blocks?.[blockId]));

export const sectionsFromStore = (blocksOrder: string[], blocks: Record<string, unknown> | undefined): PageSection[] =>
  pickManagedSectionIds(blocksOrder, blocks).flatMap((blockId) => {
    const block = blocks?.[blockId];
    if (!isManagedPageSectionBlock(block)) return [];
    return [blockToSection(blockId, block)];
  });

export const mergeBlocksOrderWithManagedSections = (
  blocksOrder: string[],
  blocks: Record<string, unknown> | undefined,
  managedSectionIds: string[]
): string[] => {
  const staticIds = blocksOrder.filter((blockId) => !isManagedPageSectionBlock(blocks?.[blockId]));
  return [...staticIds, ...managedSectionIds];
};
