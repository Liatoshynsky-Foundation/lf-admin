'use client';
import { Stack } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { styles } from './ContributorCard.styles';
import { FoundationTeamErrors } from '~/constants/errors';
import { DEFAULT_IMAGE_PLACEHOLDER } from '~/constants/files';
import { CROP_RATIOS } from '~/constants/publications';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { hasMemberImage } from '~/lib/utils/hasMemberImage';
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
  const hasImage = hasMemberImage(contributor.photo);
  const isAltEmpty = !proseToText(contributor.photo.alt[currentLocale] as ProseDoc)?.trim();
  const showAltError = showValidationErrors && hasImage && isAltEmpty;

  const handleChangeImage = (url: string, crop?: CropResult | null) => {
    const updatedPhoto: Omit<ImageType, 'caption'> = {
      ...contributor.photo,
      src: url,
      generatedSrc: url,
      ...(crop ? { crop } : {})
    };

    onChangePhoto(updatedPhoto);
  };

  return (
    <Stack sx={styles.cardContainer}>
      <ImagePreviewBlock
        key={currentLocale}
        imageUrl={contributor.photo.generatedSrc || contributor.photo.src || DEFAULT_IMAGE_PLACEHOLDER}
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
        elipse
        imageFit={!contributor.photo.generatedSrc && !contributor.photo.src ? 'fill' : 'cover'}
        altTextErrorState={showAltError}
        altTextError={showAltError ? FoundationTeamErrors.MISSING_ALT : undefined}
        alternativeTextRequired={hasImage}
      />
      <Stack sx={styles.textFieldsContainer}>
        <CustomTextField
          fieldType="formatting"
          label="Ім`я"
          value={contributor.name[currentLocale]}
          onChange={(value) => onChangeName(value)}
        />
        <CustomTextField
          fieldType="formatting"
          label="Опис"
          value={contributor.description[currentLocale]}
          onChange={(value) => onChangeDescription(value)}
        />
      </Stack>
    </Stack>
  );
};
