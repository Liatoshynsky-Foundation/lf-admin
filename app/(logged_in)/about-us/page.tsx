'use client';
import { DragEndEvent } from '@dnd-kit/core';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { FoundationFounders } from '~/shared/components/about-us/foundation-founders/FoundationFounders';
import { LiatoshynskyFoundation } from '~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation';
import { LiatoshynskyOffice } from '~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office';
import OurGoals from '~/shared/components/about-us/our-goals/OurGoals';
import OurMission from '~/shared/components/about-us/our-mission/OurMission';
import WhatWeDo from '~/shared/components/about-us/what-we-do/WhatWeDo';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useStore } from '~/store';


export const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  'foundation': LiatoshynskyFoundation,
  'mission': OurMission,
  'goals': OurGoals,
  'office': LiatoshynskyOffice,
  'what-we-do': WhatWeDo,
  'founders': FoundationFounders
};

export default function Page() {
  const pageSlug = PAGE_IDS.ABOUT_US;

  const blocksOrder = useStore((s) => s.blocksOrder[pageSlug]);
  const setBlocksOrder = useStore((s) => s.setBlocksOrder);

  const sortableBlocks = blocksOrder?.filter((blockId) => blockId !== 'intro');

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sortableBlocks, (reordered) => {
      setBlocksOrder(pageSlug, ['intro', ...reordered]);
    });
  };

  return (
    <EditablePageLayout headerTitle="Про нас" pageSlug={pageSlug}>
      {sortableBlocks && sortableBlocks.length > 0 && (
        <SortableList onDragEnd={handleDragEnd} id="1" items={sortableBlocks}>
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
