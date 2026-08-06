'use client';

import { DragEndEvent } from '@dnd-kit/core';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { PrincipleOfHope } from '~/shared/components/war-in-ukraine/PrincipleOfHope/PrincipleOfHope';
import { VolunteerDonation } from '~/shared/components/war-in-ukraine/VolunteerDonation/VolunteerDonation';
import { WarCarousel } from '~/shared/components/war-in-ukraine/WarCarousel/WarCarousel';
import { WarInfo } from '~/shared/components/war-in-ukraine/WarInfo/WarInfo';
import { YermolenkoLinks } from '~/shared/components/war-in-ukraine/YermolenkoLinks/YermolenkoLinks';
import { useStore } from '~/store';

const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  'principle-of-hope': PrincipleOfHope,
  'war-carousel': WarCarousel,
  'yermolenko-links': YermolenkoLinks,
  'volunteer-donation': VolunteerDonation
};

export default function WarInUkraineReorderingPage() {
  const pageSlug = PAGE_IDS.WAR_IN_UKRAINE;

  const defaultOrder = ['war-info', 'principle-of-hope', 'war-carousel', 'yermolenko-links', 'volunteer-donation'];

  const blocksOrder = useStore((s) => s.blocksOrder[pageSlug]) || defaultOrder;
  const setBlocksOrder = useStore((s) => s.setBlocksOrder);

  const sortableBlocks = blocksOrder.filter((blockId) => blockId !== 'war-info');

  const handleDragEnd = (event: DragEndEvent) => {
    handleSortableDragEnd(event, sortableBlocks, (reordered) => {
      setBlocksOrder(pageSlug, ['war-info', ...reordered]);
    });
  };

  return (
    <EditablePageLayout headerTitle="Війна в Україні" pageSlug={pageSlug}>
      
      <WarInfo />

      {sortableBlocks && sortableBlocks.length > 0 && (
        <SortableList onDragEnd={handleDragEnd} id="war-in-ukraine-sortable-list" items={sortableBlocks}>
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