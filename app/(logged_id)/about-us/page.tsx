'use client';
import { Box } from '@mui/material';

import { PAGE_IDS } from '~/constants/pageBlocks';
import { IntroSection } from '~/shared/components/about-us/Intro-section/IntroSection';
import { LiatoshynskyFoundation } from '~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation';
import { LiatoshynskyOffice } from '~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office';
import OurGoals from '~/shared/components/about-us/our-goals/OurGoals';
import OurMission from '~/shared/components/about-us/our-mission/OurMission';
import WhatWeDo from '~/shared/components/about-us/what-we-do/WhatWeDo';
import { Header } from '~/shared/components/header/Header';
import { useSavePageBlocks } from '~/shared/hooks/use-save-page/UseSavePage';
import { useStore } from '~/store';

const Page = () => {
  const pageSlug = PAGE_IDS.ABOUT_US;
  const setLocale = useStore((s) => s.setLocale);

  const { save, loading: isSaving } = useSavePageBlocks(pageSlug);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Header
        title="Про нас"
        onPreview={() => {}}
        onSave={save}
        isSaving={isSaving}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
      <IntroSection />
      <LiatoshynskyFoundation />
      <OurMission />
      <OurGoals />
      <LiatoshynskyOffice />
      <WhatWeDo />
    </Box>
  );
};

export default Page;
