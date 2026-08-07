'use client';
import { DragEndEvent } from '@dnd-kit/core';

import { headerSectionListConfig } from '~/constants/blockSchemas';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import { FoundationFounders } from '~/shared/components/about-us/foundation-founders/FoundationFounders';
import { IntroSection } from '~/shared/components/about-us/Intro-section/IntroSection';
import { LiatoshynskyFoundation } from '~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation';
import { LiatoshynskyOffice } from '~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office';
import { ourGoalsAdapter } from '~/shared/components/about-us/our-goals/our-goals.adapter';
import OurMission from '~/shared/components/about-us/our-mission/OurMission';
import { whatWeDoAdapter } from '~/shared/components/about-us/what-we-do/what-we-do.adapter';
import { Block } from '~/shared/components/block/Block';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useStore } from '~/store';
import type { OurGoalsBlock } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';
import type { WhatWeDoBlock } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

const OurGoalsBlockView = () => (
  <Block<OurGoalsBlock>
    pageId={PAGE_IDS.ABOUT_US}
    blockId={BLOCK_IDS.OUR_GOALS}
    config={headerSectionListConfig}
    adapter={ourGoalsAdapter}
    title="Наші цілі"
  />
);

const WhatWeDoBlockView = () => (
  <Block<WhatWeDoBlock>
    pageId={PAGE_IDS.ABOUT_US}
    blockId={BLOCK_IDS.WHAT_WE_DO}
    config={headerSectionListConfig}
    adapter={whatWeDoAdapter}
    title="Що ми робимо"
  />
);

const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  foundation: LiatoshynskyFoundation,
  mission: OurMission,
  goals: OurGoalsBlockView,
  office: LiatoshynskyOffice,
  'what-we-do': WhatWeDoBlockView,
  founders: FoundationFounders
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
      <IntroSection />
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
