'use client';

import { Box } from '@mui/material';
import React, { useState } from 'react';

import { ImageSelectionGallery } from '~/components/image-selection-gallery/ImageSelectionGallery';
import { mockImages } from '~/components/image-selection-gallery/mockData';
import { GalleryImage } from '~/components/image-selection-gallery/types';
import { fetchPreview } from '~/lib/utils/fetchPreview';
import { Header } from '~/shared/components/header/Header';
import { useStore } from '~/store';

export default function Home() {
  const pageData = { title: 'Про нас', url: '/' };
  const discardChanges = useStore((s) => s.discardChanges);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

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

  const handleSelectImage = (image: GalleryImage | null) => {
    setSelectedImage(image);
    //console.log('Selected image:', image);
  };

  const handlePageClick = () => {
    setSelectedImage(null);
  };

  return (
    <Box onClick={handlePageClick}>
      <Header
        title={pageData.title}
        onPreview={onPreview}
        onLanguageChange={onLanguageChange}
        onSave={onSave}
        onCancel={onCancel}
        isSaving
      />

      <Box
        sx={{
          padding: '104px 40px',
          maxWidth: '912px',
          margin: '0 auto',
          backgroundColor: '#2C2C2C',
          borderRadius: '32px'
        }}
      >
        <ImageSelectionGallery
          images={mockImages}
          selectedImageId={selectedImage?.id}
          onSelectImage={handleSelectImage}
          currentlyUsedImageId="2"
        />
      </Box>
    </Box>
  );
}
