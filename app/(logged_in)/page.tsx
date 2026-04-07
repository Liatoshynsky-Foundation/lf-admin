'use client';

import { Box } from '@mui/material';
import React from 'react';

import { fetchPreview } from '~/lib/utils/fetchPreview';
import { Header } from '~/shared/components/header/Header';
import { useStore } from '~/store';

export default function Home() {
  const pageData = { title: 'Про нас', url: '/' };
  const discardChanges = useStore((s) => s.discardChanges);

  const saveDraft = () => {};

  const onPreview = () => {
    saveDraft();
    fetchPreview({
      slug: pageData.url,
      lang: 'uk',
      draftId: '1'
    });
  };

  const onLanguageChange = () => {};
  const onSave = () => {};
  const onCancel = () => discardChanges(pageData.url);

  return (
    <Box sx={{ width: '100%', p: '32px' }}>
      <Header
        title={pageData.title}
        onPreview={onPreview}
        onLanguageChange={onLanguageChange}
        onSave={onSave}
        onCancel={onCancel}
        isSaving
      />
    </Box>
  );
}
