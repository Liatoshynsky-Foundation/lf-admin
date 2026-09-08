'use client';
import { DragEndEvent } from '@dnd-kit/core';

import {
  foundationBlockConfig,
  headerQuoteConfig,
  headerSectionListConfig,
  missionBlockConfig
} from '~/constants/blockSchemas';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';
import FoundationFoundersRedirect from '~/shared/components/about-us/foundation-founders-redirect/FoundationFoundersRedirect';
import { IntroSection } from '~/shared/components/about-us/intro-section/IntroSection';
import { foundationAdapter } from '~/shared/components/about-us/liatoshynsky-foundation/foundation.adapter';
import { officeAdapter } from '~/shared/components/about-us/liatoshynsky-office/office.adapter';
import { ourGoalsAdapter } from '~/shared/components/about-us/our-goals/our-goals.adapter';
import { missionAdapter } from '~/shared/components/about-us/our-mission/mission.adapter';
import { whatWeDoAdapter } from '~/shared/components/about-us/what-we-do/what-we-do.adapter';
import { Block } from '~/shared/components/block/Block';
import { EditablePageLayout } from '~/shared/components/editable-page-layout/EditablePageLayout';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { useStore } from '~/store';
import type { FoundationInfo } from '~/types/store/pages/about-us/blocks/liatoshynskyFoundationBlock';
import type { LiatoshynskyOfficeBlock } from '~/types/store/pages/about-us/blocks/liatoshynskyOfficeBlock';
import type { OurMissionBlock } from '~/types/store/pages/about-us/blocks/missionBlock';
import type { OurGoalsBlock } from '~/types/store/pages/about-us/blocks/ourGoalsBlock';
import type { WhatWeDoBlock } from '~/types/store/pages/about-us/blocks/whatWeDoBlock';

const OurMissionBlockView = () => (
  <Block<OurMissionBlock>
    pageId={PAGE_IDS.ABOUT_US}
    blockId={BLOCK_IDS.OUR_MISSION}
    config={missionBlockConfig}
    adapter={missionAdapter}
    title="Наша місія"
  />
);

const LiatoshynskyFoundationBlockView = () => (
  <Block<FoundationInfo>
    pageId={PAGE_IDS.ABOUT_US}
    blockId={BLOCK_IDS.LIATOSHYNSKY_FOUNDATION}
    config={foundationBlockConfig}
    adapter={foundationAdapter}
    title="Фундація Лятошинського"
  />
);

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

const LiatoshynskyOfficeBlockView = () => (
  <Block<LiatoshynskyOfficeBlock>
    pageId={PAGE_IDS.ABOUT_US}
    blockId={BLOCK_IDS.LIATOSHYNSKY_OFFICE}
    config={headerQuoteConfig}
    adapter={officeAdapter}
    title="Кабінет Лятошинського"
  />
);

const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  foundation: LiatoshynskyFoundationBlockView,
  mission: OurMissionBlockView,
  goals: OurGoalsBlockView,
  office: LiatoshynskyOfficeBlockView,
  'what-we-do': WhatWeDoBlockView,
  founders: FoundationFoundersRedirect
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
