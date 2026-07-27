'use client';
import { DragEndEvent } from '@dnd-kit/core';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { MusicTableSection } from '~/shared/components/artistry/MusicTableSection/MusicTableSection';
import { TitleWithQuote } from '~/shared/components/artistry/TitleWithQuote/TitleWithQuote';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useStore } from '~/store';

const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  'title-with-quote': TitleWithQuote,
  'music-table': MusicTableSection
};

export default function ArtistryReorderingPage() {
  const pageSlug = PAGE_IDS.ARTISTRY;

  const blocksOrder = useStore((s) => s.blocksOrder[pageSlug]) || ['title-with-quote', 'music-table'];
  const setBlocksOrder = useStore((s) => s.setBlocksOrder);

  const sortableBlocks = blocksOrder;

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sortableBlocks, (reordered) => {
      const pinnedBlock = sortableBlocks[0];

      if (reordered[0] !== pinnedBlock) {
        const withoutPinned = reordered.filter((id) => id !== pinnedBlock);
        setBlocksOrder(pageSlug, [pinnedBlock, ...withoutPinned]);
      } else {
        setBlocksOrder(pageSlug, reordered);
      }
    });
  };

  return (
    <EditablePageLayout headerTitle="Творчість" pageSlug={pageSlug}>
      {sortableBlocks && sortableBlocks.length > 0 && (
        <SortableList onDragEnd={handleDragEnd} id="artistry-sortable-list" items={sortableBlocks}>
          {sortableBlocks.map((blockId) => {
            const BlockComponent = BLOCKS_CONFIG[blockId];

            return (
              <SortableItemWrapper id={blockId} key={blockId}>
                {BlockComponent && <BlockComponent />}
              </SortableItemWrapper>
            );
          })}
        </SortableList>
      )}
    </EditablePageLayout>
  );
}
