'use client';
import { Stack } from '@mui/material';
import React from 'react';

import {MediaModalResult} from '~/components/media-modal/MediaModal.types';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { ImageType, LocalizedString } from '~/types/common';

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
  const handleChangeImage = (file: File, crop?: MediaModalResult['crop']) => {
    const previewUrl = URL.createObjectURL(file);

    const updatedPhoto: ImageType = {
      ...contributor.photo,

      generatedSrc: previewUrl,
      src: file.name,
      alt: { ...contributor.photo.alt, [currentLocale]: contributor.photo.alt[currentLocale] || file.name },
      ...(crop && { crop })
    };

    onChangePhoto(updatedPhoto);
  };

  return (
    <Stack display="flex" flexDirection="row" gap="16px" width="100%">
      <ImagePreviewBlock
        imageUrl={contributor.photo.generatedSrc || '/images/oval-contributor-card.png'}
        fileName={contributor.photo.alt[currentLocale] || ''}
        initialCrop={(contributor.photo as unknown as { crop: MediaModalResult['crop'] }).crop}
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
