'use client';
import { Stack } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { styles } from './ContributorCard.styles';
import { CROP_RATIOS } from '~/constants/publications';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { proseToText, textToProse } from '~/lib/utils/prose';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { useStore } from '~/store';
import { CropResult, ImageType, LocalizedJSON, LocalizedString, ProseDoc } from '~/types/common';

type ContributorCardProps = {
  contributor: {
    name: LocalizedJSON;
    description: LocalizedJSON;
    photo: Omit<ImageType, 'caption'>;
  };
  currentLocale: keyof LocalizedString;
  onChangeName: (name: JSONContent) => void;
  onChangeDescription: (description: JSONContent) => void;
  onChangePhoto: (photo: Omit<ImageType, 'caption'>) => void;
};

export const ContributorCard = ({
  contributor,
  currentLocale,
  onChangeName,
  onChangeDescription,
  onChangePhoto
}: ContributorCardProps) => {
  const showValidationErrors = useStore((state) => state.showValidationErrors);

  const isNameEmpty = !proseToText(contributor.name[currentLocale] as ProseDoc)?.trim();
  const isDescriptionEmpty = !proseToText(contributor.description[currentLocale] as ProseDoc)?.trim();
  const isAltEmpty = !proseToText(contributor.photo.alt[currentLocale] as ProseDoc)?.trim();

  const handleChangeImage = (url: string, crop?: CropResult | null) => {
    const updatedPhoto: Omit<ImageType, 'caption'> = {
      ...contributor.photo,
      src: url,
      generatedSrc: url,
      alt: {
        ...contributor.photo.alt,
        [currentLocale]: isAltEmpty ? textToProse(url) : contributor.photo.alt[currentLocale]
      },
      ...(crop ? { crop } : {})
    };

    onChangePhoto(updatedPhoto);
  };

  return (
    <Stack sx={styles.cardContainer}>
      <ImagePreviewBlock
        imageUrl={contributor.photo.generatedSrc || contributor.photo.src || '/images/light-logo.svg'}
        initialCrop={contributor.photo.crop}
        aspectRatio={CROP_RATIOS.TEAM_AVATAR}
        onChangeImage={handleChangeImage}
        altText={proseToText(contributor.photo.alt[currentLocale] as ProseDoc)}
        onChangeAltText={(text) => {
          onChangePhoto({
            ...contributor.photo,
            alt: {
              ...contributor.photo.alt,
              [currentLocale]: textToProse(text)
            }
          });
        }}
        direction="row"
        buttonSpacing="8px"
        stackSpacing="30px"
        showAlternativeText={true}
        altTextErrorState={showValidationErrors && isAltEmpty}
        elipse
        imageFit={(!contributor.photo.generatedSrc && !contributor.photo.src) ? 'fill' : 'cover'}
      />
      <Stack sx={styles.textFieldsContainer}>
        <CustomTextField
          fieldType="formatting"
          label="Ім`я"
          value={contributor.name[currentLocale]}
          onChange={(value) => onChangeName(value)}
          error={showValidationErrors && isNameEmpty}
        />
        <CustomTextField
          fieldType="formatting"
          label="Опис"
          value={contributor.description[currentLocale]}
          onChange={(value) => onChangeDescription(value)}
          error={showValidationErrors && isDescriptionEmpty}
        />
      </Stack>
    </Stack>
  );
};
