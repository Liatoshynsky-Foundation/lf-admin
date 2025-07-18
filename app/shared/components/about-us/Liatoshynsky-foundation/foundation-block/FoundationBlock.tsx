'use client';
import { Box } from '@mui/material';
import { ParagraphsBlock } from 'app/types/accordionBlocks';
import React, { useState } from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';

export const FoundationBlock = ({ mainText, paragraphs, onMainTextChange, onParagraphsChange }: ParagraphsBlock) => {
  const [imageUrl, setImageUrl] = useState('/images/image.png');
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  const handleChangeImage = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);
    setFileName(file.name);
  };

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        title="Основний текст секції"
        label="Текст"
        defaultValue={mainText}
        onChange={(e) => onMainTextChange && onMainTextChange(e.target.value)}
        fullWidth
        multiline
      />
      {paragraphs.map((text, index) => (
        <CustomTextField
          key={index}
          title={`Текст ${index + 1} абзацу`}
          label="Текст абзацу"
          defaultValue={text}
          onChange={(e) => onParagraphsChange && onParagraphsChange(index, e.target.value)}
          fullWidth
          multiline
        />
      ))}
      <ImagePreviewBlock
        imageUrl={imageUrl}
        fileName={fileName}
        cropWidth={350}
        cropHeight={300}
        onChangeImage={handleChangeImage}
      />
    </Box>
  );
};
