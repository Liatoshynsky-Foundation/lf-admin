'use client';
import { Box, Stack } from '@mui/material';
import { ParagraphsBlock } from 'app/types/accordionBlocks';
import React, { useState } from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';

export const ContributorCard = ({ mainText, paragraphs, onMainTextChange, onParagraphsChange }: ParagraphsBlock) => {
  const [imageUrl, setImageUrl] = useState('/images/oval-contributor-card.png');
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const handleChangeImage = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);
    setFileName(file.name);
  };

  return (
    <Stack display="flex" flexDirection="row" gap="16px" width="100%">
      <ImagePreviewBlock
        imageUrl={imageUrl}
        fileName={fileName}
        cropWidth={150}
        cropHeight={130}
        onChangeImage={handleChangeImage}
        direction="column"
        buttonSpacing="8px"
        stackSpacing="24px"
      />
       <Stack direction="column" gap={2} width="100%" mt={2}>
      <CustomTextField
        label="Ім'я"
        defaultValue={mainText}
        onChange={(e) => onMainTextChange && onMainTextChange(e.target.value)}
        fullWidth
      />
    <CustomTextField
        label="Опис учасника"
        defaultValue={mainText}
        onChange={(e) => onMainTextChange && onMainTextChange(e.target.value)}
        fullWidth
        multiline
        margin="none"
      />
      </Stack>
    </Stack>
  );
};
