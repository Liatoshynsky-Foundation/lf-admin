'use client';
import { Box } from '@mui/material';

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
import { usePageEditor } from '~/shared/hooks/use-page-editor/usePageEditor';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';

export default function Page() {
  const pageSlug = PAGE_IDS.ABOUT_US;
  const setLocale = useStore((s) => s.setLocale);
  const discardChanges = useStore((s) => s.discardChanges);

  const { preview, loading: editorLoading } = usePageEditor(pageSlug);
  const { save, loading: saveLoading } = useSavePageBlocks(pageSlug);

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
      <LiatoshynskyFoundation />
      <OurMission />
      <OurGoals />
      <LiatoshynskyOffice />
      <WhatWeDo />
      <FoundationFounders />
    </Box>
  );
}
