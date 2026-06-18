'use client';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { styles } from './page.styles';
import { PAGE_IDS } from '~/constants/pageBlocks';
import { FoundationFounders } from '~/shared/components/about-us/foundation-founders/FoundationFounders';
import { IntroSection } from '~/shared/components/about-us/Intro-section/IntroSection';
import { LiatoshynskyFoundation } from '~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation';
import { LiatoshynskyOffice } from '~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office';
import OurGoals from '~/shared/components/about-us/our-goals/OurGoals';
import OurMission from '~/shared/components/about-us/our-mission/OurMission';
import WhatWeDo from '~/shared/components/about-us/what-we-do/WhatWeDo';
import { Header } from '~/shared/components/header/Header';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { SortableList } from '~/shared/components/sortable-list/SortableList';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useSortableDragEnd } from '~/shared/hooks/use-sortable-drag-end/useSortableDragEnd';
import { useStore } from '~/store';
import { useGetPageQuery } from '~/types/graphql/generated/graphql';


const BLOCKS_CONFIG: Record<string, () => React.JSX.Element> = {
  'foundation': LiatoshynskyFoundation,
  'mission': OurMission,
  'goals': OurGoals,
  'office': LiatoshynskyOffice,
  'what-we-do': WhatWeDo,
  'founders': FoundationFounders
};

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);

  const pageSlug = PAGE_IDS.ABOUT_US;
  const setLocale = useStore((s) => s.setLocale);
  const discardChanges = useStore((s) => s.discardChanges);

  const { data, loading: queryLoading } = useGetPageQuery({
    variables: { slug: pageSlug }
  });

  const setPageData = useStore((state) => state.setPageData);

  useEffect(() => {
    if (data?.pageBlocks) {
      setPageData(pageSlug, data.pageBlocks.blocks, data.pageBlocks.blocksOrder, true);
    }
  }, [data, setPageData, pageSlug]);


  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);
  const blocksOrder = useStore((s) => s.blocksOrder[pageSlug]);
  const setBlocksOrder = useStore((s) => s.setBlocksOrder);

  const sortableBlocks = blocksOrder?.filter((blockId) => blockId !== 'intro');

  const { handleDragEnd } = useSortableDragEnd(sortableBlocks, (reordered) => {
    setBlocksOrder(pageSlug, ['intro', ...reordered]);
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || queryLoading) {
    return null;
  }

  return (
    <Box sx={styles.pageContainer}>
      <Header
        title="Про нас"
        onPreview={preview}
        onSave={save}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={editorLoading || saveLoading}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
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
    </Box>
  );
}
