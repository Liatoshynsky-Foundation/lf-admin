import { Box } from '@mui/material';
import { ParagraphsBlock } from 'app/types/accordionBlocks';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';

export const FoundationBlock = ({ mainText, paragraphs, onMainTextChange, onParagraphsChange }: ParagraphsBlock) => {
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
    </Box>
  );
};
