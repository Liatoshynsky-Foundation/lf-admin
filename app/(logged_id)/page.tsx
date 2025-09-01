'use client';

import { Box } from '@mui/material';
import React from 'react';

import { fetchPreview } from '~/lib/utils/fetchPreview';
import Team from '~/shared/components/accordion-blocks/team/Team';
import { Header } from '~/shared/components/header/Header';

export default function Home() {
  const pageData = { title: 'Про нас', url: '/' };

  const saveDraft = () => {};

  const onPreview = () => {
    saveDraft();
    fetchPreview({
      slug: pageData.url,
      lang: 'uk',
      draftId: 1
    });
  };

  const onLanguageChange = () => {};
  const onSave = () => {};

  return (
    <Box>
      <Header
        title={pageData.title}
        onPreview={onPreview}
        onLanguageChange={onLanguageChange}
        onSave={onSave}
        isSaving
      />
      <Team
        introText="Вступний текст секції"
        sectionTitle="Заголовок секції"
        contributors={[
          { name: 'Тетяна Гоман', description: 'Опис учасника' },
          { name: 'Тетяна Гоман', description: 'Опис учасника' }
        ]}
      />
    </Box>
  );
}
