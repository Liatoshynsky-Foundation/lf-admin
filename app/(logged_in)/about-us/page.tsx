'use client';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { JSX, useEffect, useState } from 'react';

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
import { SortableBoard } from '~/shared/components/sortable-board/SortableBoard';
import { SortableContainer } from '~/shared/components/sortable-container/SortableContainer';
import { SortableItemWrapper } from '~/shared/components/sortable-item-wrapper/SortableItemWrapper';
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';


const BLOCKS_CONFIG: Record<string, JSX.Element> = {
  'intro': <IntroSection />,
  'foundation': <LiatoshynskyFoundation />,
  'mission': <OurMission />,
  'goals': <OurGoals />,
  'office': <LiatoshynskyOffice />,
  'what-we-do': <WhatWeDo />,
  'founders': <FoundationFounders />
};

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);

  const pageSlug = PAGE_IDS.ABOUT_US;
  const setLocale = useStore((s) => s.setLocale);
  const discardChanges = useStore((s) => s.discardChanges);

  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);

  const [blocksOrder, setBlocksOrder] = useState([
    'intro', 'foundation', 'mission', 'goals', 'office', 'what-we-do', 'founders'
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocksOrder((currentBlocksOrder) => {
        const oldIndex = currentBlocksOrder.indexOf(active.id as string);
        const newIndex = currentBlocksOrder.indexOf(over.id as string);

        return arrayMove(currentBlocksOrder, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
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
      <SortableBoard onDragEnd={handleDragEnd} >
        <SortableContainer id='1' items={blocksOrder}>
          {blocksOrder.map((blockId) => (
            <SortableItemWrapper id={blockId} key={blockId}>
              {BLOCKS_CONFIG[blockId]}
            </SortableItemWrapper>
          ))}
        </SortableContainer>
      </SortableBoard>
    </Box>
  );
}
