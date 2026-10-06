'use client';

import { useCallback, useMemo } from 'react';

import {
  isManagedPageSectionBlock,
  mergeBlocksOrderWithManagedSections,
  sectionsFromStore,
  sectionToBlock
} from '~/shared/components/page-sections/pageSection.mapper';
import type { PageSection } from '~/shared/components/page-sections/pageSection.types';
import { createPageSection } from '~/shared/components/page-sections/pageSection.utils';
import { useStore } from '~/store';

export const useManagedPageSections = (pageSlug: string) => {
  const blocks = useStore((state) => state.blocks[pageSlug]) as Record<string, unknown> | undefined;
  const blocksOrder = useStore((state) => state.blocksOrder[pageSlug]);
  const replacePageBlocks = useStore((state) => state.replacePageBlocks);

  const sections = useMemo(() => sectionsFromStore(blocksOrder ?? [], blocks), [blocks, blocksOrder]);

  const persistSections = useCallback(
    (nextSections: PageSection[]) => {
      const originalBlocks = (useStore.getState().blocks[pageSlug] ?? {}) as Record<string, unknown>;
      const currentOrder = useStore.getState().blocksOrder[pageSlug] ?? [];
      const nextBlocks = { ...originalBlocks };

      Object.keys(nextBlocks).forEach((blockId) => {
        if (isManagedPageSectionBlock(nextBlocks[blockId])) {
          delete nextBlocks[blockId];
        }
      });

      nextSections.forEach((section) => {
        const existing = originalBlocks[section.id];
        const hidden = isManagedPageSectionBlock(existing) ? existing.hidden : false;
        nextBlocks[section.id] = sectionToBlock(section, hidden);
      });

      replacePageBlocks(
        pageSlug,
        nextBlocks,
        mergeBlocksOrderWithManagedSections(
          currentOrder,
          originalBlocks,
          nextSections.map((section) => section.id)
        )
      );
    },
    [pageSlug, replacePageBlocks]
  );

  const addSection = useCallback(() => {
    persistSections([...sections, createPageSection()]);
  }, [persistSections, sections]);

  const updateSection = useCallback(
    (nextSection: PageSection) => {
      persistSections(sections.map((section) => (section.id === nextSection.id ? nextSection : section)));
    },
    [persistSections, sections]
  );

  const removeSection = useCallback(
    (sectionId: string) => {
      persistSections(sections.filter((section) => section.id !== sectionId));
    },
    [persistSections, sections]
  );

  const reorderSections = useCallback(
    (reordered: PageSection[]) => {
      persistSections(reordered);
    },
    [persistSections]
  );

  return {
    sections,
    addSection,
    updateSection,
    removeSection,
    reorderSections
  };
};
