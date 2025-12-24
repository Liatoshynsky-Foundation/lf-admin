'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { SvgImage } from '../svg-image/SvgImage';
import { ImageCard } from './ImageCard';
import { galleryStyles } from './ImageSelectionGallery.styles';
import { GalleryImage, ImageSelectionGalleryProps } from './types';

export const ImageSelectionGallery = ({
  images,
  selectedImageId = null,
  onSelectImage,
  currentlyUsedImageId = null
}: ImageSelectionGalleryProps) => {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedImageId);

  useEffect(() => {
    setLocalSelectedId(selectedImageId);
  }, [selectedImageId]);

  const handleSelectImage = (image: GalleryImage) => {
    setLocalSelectedId(image.id);
    onSelectImage(image);
  };

  const selectedImage = images.find((img) => img.id === localSelectedId);

  return (
    <Box sx={galleryStyles.container}>
      <Box sx={galleryStyles.header}>
        <Typography sx={galleryStyles.title}>Завантажені файли</Typography>

        <Box sx={galleryStyles.actionsContainer}>
          <Box sx={galleryStyles.searchButton}>
            <SvgImage src="/icons/search.svg" width={20} height={20} alt="search" />
          </Box>

          <Box sx={galleryStyles.filterButton}>
            <SvgImage src="/icons/filters.svg" width={20} height={20} alt="filter" />
            <Typography sx={galleryStyles.filterText}>Фільтри</Typography>
          </Box>
        </Box>
      </Box>

      {images.length > 0 ? (
        <>
          <Box sx={galleryStyles.gridContainer}>
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={image.id === localSelectedId}
                isCurrentlyUsed={image.id === currentlyUsedImageId}
                onClick={() => handleSelectImage(image)}
              />
            ))}
          </Box>

          <Box sx={galleryStyles.fileNameContainer}>
            {selectedImage && <Typography sx={galleryStyles.fileNameText(true)}>{selectedImage.name}</Typography>}
          </Box>
        </>
      ) : (
        <Box sx={galleryStyles.emptyState}>
          <Typography variant="body1">Немає завантажених файлів</Typography>
        </Box>
      )}
    </Box>
  );
};
