'use client';

import { Box } from '@mui/material';
import React, { useState } from 'react';

import { fetchPreview } from '~/lib/utils/fetchPreview';
import Button from '~/shared/components/design-system/button/Button';
import { Header } from '~/shared/components/header/Header';
import { MediaModal } from '~/shared/components/media-modal/MediaModal';
import { useStore } from '~/store';

export default function Home() {
  const pageData = { title: 'Про нас', url: '/' };
  const discardChanges = useStore((s) => s.discardChanges);
  const [modalOpen, setModalOpen] = useState(false);

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
    <Box>
      <Header
        title={pageData.title}
        onPreview={onPreview}
        onLanguageChange={onLanguageChange}
        onSave={onSave}
        onCancel={onCancel}
        isSaving
      />

      <Box sx={{ padding: '32px', textAlign: 'center' }}>
        <Button variant="filled" color="primary" label="Відкрити медіа галерею" onClick={() => setModalOpen(true)} />
      </Box>

      <MediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={() => {
          setModalOpen(false);
        }}
      />
    </Box>
  );
}
