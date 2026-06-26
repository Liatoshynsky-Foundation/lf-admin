'use client';
import { Stack } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { CROP_RATIOS } from '~/constants/publications';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { proseToText } from '~/lib/utils/prose';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { CropResult, ImageType, LocalizedJSON, LocalizedString, ProseDoc } from '~/types/common';

type ContributorCardProps = {
  contributor: {
    name: LocalizedJSON;
    description: LocalizedJSON;
    photo: ImageType;
  };
  currentLocale: keyof LocalizedString;
  onChangeName: (name: JSONContent) => void;
  onChangeDescription: (description: JSONContent) => void;
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
        fileName={proseToText(contributor.photo.alt[currentLocale] as ProseDoc)}
        initialCrop={(contributor.photo as unknown as { crop: CropResult }).crop}
        aspectRatio={CROP_RATIOS.TEAM_AVATAR}
        onChangeImage={handleChangeImage}
        direction="column"
        buttonSpacing="8px"
        stackSpacing="24px"
        oval
      />
      <Stack direction="column" gap={2} width="100%" mt={2}>
        <CustomTextField
          fieldType="formatting"
          label="Ім`я"
          value={contributor.name[currentLocale]}
          onChange={(value) => onChangeName(value)}
        />
        <CustomTextField
          fieldType="formatting"
          label="Опис учасника"
          value={contributor.description[currentLocale]}
          onChange={(value) => onChangeDescription(value)}
        />
      </Stack>
    </Stack>
  );
};
