'use client';

import { Box } from '@mui/material';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';
import { Paragraph } from '~/types/accordionBlocks';

interface FoundationBlockProps {
  mainText: string;
  paragraphs: Paragraph[];
  imageUrl: string;
  fileName?: string;
  onMainTextChange: (val: string) => void;
  onParagraphsChange: (index: number, val: string) => void;
  onImageChange: (file: File) => void;
}

export const FoundationBlock = ({
  mainText,
  paragraphs,
  imageUrl,
  fileName,
  onMainTextChange,
  onParagraphsChange,
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
      {paragraphs.map((paragraph, index) => (
        <CustomTextField
          key={paragraph.id}
          title={`Текст ${index + 1} абзацу`}
          label="Текст абзацу"
          value={paragraph.text}
          onChange={(e) => onParagraphsChange(index, e.target.value)}
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
