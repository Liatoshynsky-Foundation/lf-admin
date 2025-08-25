'use client';
import { Box } from '@mui/material';
import React from 'react';

import { EntrySection } from '~/shared/components/about-us/Entry-section/EntrySection';
import { LiatoshynskyFoundation } from '~/shared/components/about-us/Liatoshynsky-foundation/LiatoshynskyFoundation';
import { LiatoshynskyOffice } from '~/shared/components/about-us/Liatoshynsky-office/Liatoshynsky-office';
import OurMission from '~/shared/components/about-us/our-mission/OurMission';
import { Header } from '~/shared/components/header/Header';
import { useStore } from '~/store';

const Page = () => {
  const setLocale = useStore((state) => state.setLocale);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Header
        title="Про нас"
        onPreview={() => {}}
        onSave={() => {}}
        isSaving={false}
        onLanguageChange={(lang: 'uk' | 'en') => setLocale(lang)}
      />
      <EntrySection />
      <LiatoshynskyFoundation />
      <OurMission />
      <LiatoshynskyOffice />
    </Box>
  );
};

export default Page;
