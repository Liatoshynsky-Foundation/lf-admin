'use client';

import { Box } from '@mui/material';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';

interface FoundationBlockProps {
  mainText: string;
  paragraphs: { text: string }[];
  imageUrl: string;
  fileName?: string;
  onMainTextChange: (val: string) => void;
  onParagraphChange: (index: number, val: string) => void;
  onImageChange: (file: File) => void;
}

export const FoundationBlock = ({
  mainText,
  paragraphs,
  imageUrl,
  fileName,
  onMainTextChange,
  onParagraphChange,
  onImageChange
}: FoundationBlockProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        title="Основний текст секції"
        label="Текст"
        value={mainText}
        onChange={(e) => onMainTextChange(e.target.value)}
        fullWidth
        multiline
      />

      {paragraphs.map((paragraph, i) => (
        <CustomTextField
          key={i}
          title={`Текст ${i + 1} абзацу`}
          label="Текст"
          value={paragraph.text}
          onChange={(e) => onParagraphChange(i, e.target.value)}
          fullWidth
          multiline
        />
      ))}

      <ImagePreviewBlock
        imageUrl={imageUrl}
        fileName={fileName}
        cropWidth={350}
        cropHeight={300}
        onChangeImage={onImageChange}
        title="Основне зображення"
      />
    </Box>
  );
};
