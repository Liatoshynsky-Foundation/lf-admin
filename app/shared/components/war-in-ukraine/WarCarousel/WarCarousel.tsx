'use client';

import { Typography } from '@mui/material';
import React from 'react';

import { CarouselImageCard, type CarouselImageData } from '../CarouselImageCard/CarouselImageCard';
import ConfigurableList from '~/components/configurable-list/ConfigurableList';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';
import { useStore } from '~/store';

export const WarCarousel = () => {
  const pageId = PAGE_IDS.WAR_IN_UKRAINE;
  const blockId = BLOCK_IDS.WAR_CAROUSEL;

  const { block } = usePageBlock(pageId, blockId);
  const currentLocale = useStore((state) => state.locale) as 'uk' | 'en';
  const setField = useStore((state) => state.setField);
  const toggleBlockVisibility = useStore((state) => state.toggleBlockVisibility);

  const rawImages: Partial<CarouselImageData>[] = block?.images || [];

  const imagesList = rawImages.map((img, index) => ({
    ...img,
    src: img.src || '',
    alt: img.alt || { uk: '', en: '' },
    caption: img.caption || { uk: '', en: '' },
    id: img.id || `img-${index}`
  })) as CarouselImageData[];

  if (!block) return <EditBlockSkeleton />;

  const updateImages = (newImages: CarouselImageData[]) => {
    setField(pageId, blockId, 'images', newImages);
  };

  const handleAddImage = () => {
    const newImage: CarouselImageData = {
      id: crypto.randomUUID(),
      src: '',
      alt: { uk: '', en: '' },
      caption: { uk: '', en: '' }
    };
    updateImages([...imagesList, newImage]);
    return newImage;
  };

  const handleRemoveImage = (idToRemove: string | number) => {
    updateImages(imagesList.filter((img) => img.id !== idToRemove));
  };

  const handleUpdateSingleImage = (updatedImage: CarouselImageData) => {
    updateImages(imagesList.map((img) => (img.id === updatedImage.id ? updatedImage : img)));
  };

  return (
    <CollapsibleBlock
      title="Карусель фотографій"
      grip
      hidden={block.hidden}
      onToggleVisibility={() => toggleBlockVisibility(pageId, blockId)}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Фотографії каруселі:
      </Typography>

      <ConfigurableList
        items={imagesList}
        addBtnLabel="Додати фотографію"
        editable
        onCreate={handleAddImage}
        onChange={handleUpdateSingleImage}
        onDelete={handleRemoveImage}
        renderItem={({ item }) => (
          <CarouselImageCard
            key={item.id}
            image={item}
            currentLocale={currentLocale}
            onChangeImage={handleUpdateSingleImage}
          />
        )}
      />
    </CollapsibleBlock>
  );
};
