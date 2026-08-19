'use client';

import { Box } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import {MediaModalResult} from '~/components/media-modal/MediaModal.types';
import { CROP_RATIOS } from '~/constants/publications';
import { CustomTextField } from '~/ds-components/text-field/TextField';
import { ImagePreviewBlock } from '~/shared/components/design-system/photo-block/PhotoBlock';

interface FoundationBlockProps {
  mainText: JSONContent;
  paragraphs: { text: JSONContent }[];
  imageUrl: string;
  fileName?: string;
  initialCrop?: MediaModalResult['crop'];
  imageAlt?: string;
  onMainTextChange: (val: JSONContent) => void;
  onParagraphChange: (index: number, val: JSONContent) => void;
  onImageChange: (url: string, crop?: MediaModalResult['crop']) => void;
  onAltChange?: (val: string) => void;
}

export const FoundationBlock = ({
  mainText,
  paragraphs,
  imageUrl,
  fileName,
  initialCrop,
  imageAlt,
  onMainTextChange,
  onParagraphChange,
  onImageChange,
  onAltChange
}: FoundationBlockProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        fieldType='formatting'
        title="Основний текст секції"
        label="Текст"
        value={mainText}
        onChange={(value) => onMainTextChange(value)}
      />

      {paragraphs.map((paragraph, i) => (
        <CustomTextField
          fieldType='formatting'
          key={i}
          title={`Текст ${i + 1} абзацу`}
          label="Текст"
          value={paragraph.text}
          onChange={(value) => onParagraphChange(i, value)}
        />
      ))}

      <ImagePreviewBlock
        imageUrl={imageUrl}
        fileName={fileName}
        initialCrop={initialCrop}
        onChangeImage={onImageChange}
        title="Основне зображення"
        aspectRatio={CROP_RATIOS.FUNDATION_PROFILE_SMALL}
        showAlternativeText
        altText={imageAlt}
        onChangeAltText={(value) => onAltChange?.(value)}
      />
    </Box>
  );
};
