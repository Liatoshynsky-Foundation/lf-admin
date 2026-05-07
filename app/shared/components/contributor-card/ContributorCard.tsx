'use client';
import { Stack } from '@mui/material';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { CropResult, ImageType, LocalizedString } from '~/types/common';

type ContributorCardProps = {
  contributor: {
    name: LocalizedString;
    description: LocalizedString;
    photo: ImageType;
  };
  currentLocale: keyof LocalizedString;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onChangePhoto: (photo: ImageType) => void;
};

export const ContributorCard = ({
  contributor,
  currentLocale,
  onChangeName,
  onChangeDescription,
  onChangePhoto
}: ContributorCardProps) => {
  const handleChangeImage = (url: string, crop?: CropResult | null) => {
    const updatedPhoto: ImageType = {
      ...contributor.photo,
      src: url,
      generatedSrc: url,
      alt: {
        ...contributor.photo.alt,
        [currentLocale]: contributor.photo.alt[currentLocale] || url
      },
      ...(crop ? { crop } : {})
    };

    onChangePhoto(updatedPhoto);
  };

  return (
    <Stack display="flex" flexDirection="row" gap="16px" width="100%">
      <ImagePreviewBlock
        imageUrl={contributor.photo.generatedSrc || contributor.photo.src || '/images/oval-contributor-card.png'}
        fileName={contributor.photo.alt[currentLocale] || ''}
        initialCrop={(contributor.photo as unknown as { crop: CropResult }).crop}
        onChangeImage={handleChangeImage}
        direction="column"
        buttonSpacing="8px"
        stackSpacing="24px"
        oval
      />
      <Stack direction="column" gap={2} width="100%" mt={2}>
        <CustomTextField
          label="Ім`я"
          value={contributor.name[currentLocale] || ''}
          fullWidth
          onChange={(e) => onChangeName(e.target.value)}
        />
        <CustomTextField
          label="Опис учасника"
          value={contributor.description[currentLocale] || ''}
          fullWidth
          multiline
          margin="none"
          onChange={(e) => onChangeDescription(e.target.value)}
        />
      </Stack>
    </Stack>
  );
};
