'use client';
import { Box } from '@mui/material';

import { FoundationFounders } from '~/components/about-us/foundation-founders/FoundationFounders';
import { IntroSection } from '~/components/about-us/Intro-section/IntroSection';
import { LiatoshynskyFoundation } from '~/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation';
import { LiatoshynskyOffice } from '~/components/about-us/Liatoshynsky-office/Liatoshynsky-office';
import OurGoals from '~/components/about-us/our-goals/OurGoals';
import OurMission from '~/components/about-us/our-mission/OurMission';
import WhatWeDo from '~/components/about-us/what-we-do/WhatWeDo';
import { Header } from '~/components/header/Header';
import { PAGE_IDS } from '~/constants/pageBlocks';
import { usePageEditor } from '~/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';

export default function Page() {
  const pageSlug = PAGE_IDS.ABOUT_US;
  const discardChanges = useStore((s) => s.discardChanges);

  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Header
        title="Про нас"
        onPreview={preview}
        onSave={save}
        onCancel={() => discardChanges(pageSlug)}
        isSaving={editorLoading || saveLoading}
      />
      <IntroSection />
      <LiatoshynskyFoundation />
      <OurMission />
      <OurGoals />
      <LiatoshynskyOffice />
      <WhatWeDo />
      <FoundationFounders />
    </Box>
  );
}
