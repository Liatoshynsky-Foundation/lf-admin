'use client';

import { Box } from '@mui/material';
import React from 'react';

import {MediaModalResult} from '~/components/media-modal/MediaModal.types';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';

interface FoundationBlockProps {
  mainText: string;
  paragraphs: { text: string }[];
  imageUrl: string;
  fileName?: string;
  initialCrop?: MediaModalResult['crop'];
  onMainTextChange: (val: string) => void;
  onParagraphChange: (index: number, val: string) => void;
  onImageChange: (file: File, crop?: MediaModalResult['crop']) => void;
}

export const FoundationBlock = ({
  mainText,
  paragraphs,
  imageUrl,
  fileName,
  initialCrop,
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
        initialCrop={initialCrop}
        onChangeImage={onImageChange}
        title="Основне зображення"
      />
    </Box>
  );
};
