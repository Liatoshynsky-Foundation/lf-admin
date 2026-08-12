'use client';

import { Stack } from '@mui/material';
import React from 'react';

import { CROP_RATIOS } from '~/constants/publications';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { getEventValue } from '~/src/shared/utils/formHelpers';
import { CropResult } from '~/types/common';

export type CarouselImageData = {
  id: string | number;
  src: string;
  alt: Record<'uk' | 'en', string>;
  caption?: Record<'uk' | 'en', string>;
  crop?: CropResult | null;
};

type CarouselImageProps = {
  image: CarouselImageData;
  currentLocale: 'uk' | 'en';
  onChangeImage: (updatedImage: CarouselImageData) => void;
};

export const CarouselImageCard = ({ image, currentLocale, onChangeImage }: CarouselImageProps) => {
  const handleTextChange = (
    field: 'alt' | 'caption',
    e: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const textValue = getEventValue(e);

    onChangeImage({
      ...image,
      [field]: {
        uk: image[field]?.uk || '',
        en: image[field]?.en || '',
        [currentLocale]: textValue
      }
    });
  };

  const handleChangeFile = (url: string, crop?: CropResult | null) => {
    onChangeImage({
      ...image,
      src: url,
      alt: {
        uk: image.alt?.uk || '',
        en: image.alt?.en || '',
        [currentLocale]: image.alt?.[currentLocale] || 'Carousel image'
      },
      crop: crop ?? null
    });
  };

  return (
    <Stack display="flex" flexDirection="row" gap="16px" width="100%">
      <ImagePreviewBlock
        key={`preview-${image.id}-${image.crop ? 'cropped' : 'raw'}`}
        imageUrl={image.src || '/images/light-logo.svg'}
        fileName={image.alt?.[currentLocale] || 'image'}
        initialCrop={image.crop ?? undefined}
        aspectRatio={CROP_RATIOS.CAROUSEL_BIG}
        onChangeImage={handleChangeFile}
        direction="column"
        buttonSpacing="8px"
        stackSpacing="24px"
      />
      <Stack direction="column" gap={2} width="100%" mt={2}>
        <CustomTextField
          fullWidth
          title="Альтернативний текст"
          label="Для людей з вадами зору"
          value={image.alt?.[currentLocale] || ''}
          onChange={(e) => handleTextChange('alt', e)}
        />
        <CustomTextField
          fullWidth
          title="Підпис під фото"
          label="Наприклад: Зруйнований будинок у Бучі"
          value={image.caption?.[currentLocale] || ''}
          onChange={(e) => handleTextChange('caption', e)}
        />
      </Stack>
    </Stack>
  );
};
