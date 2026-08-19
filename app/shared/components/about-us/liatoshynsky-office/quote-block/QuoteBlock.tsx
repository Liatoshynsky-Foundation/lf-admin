import { Box } from '@mui/material';
import { DescriptiveTextBlock } from 'app/types/accordionBlocks';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';

export const QuoteBlock = ({ title, description, onTitleChange, onDescriptionChange }: DescriptiveTextBlock) => {
  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        fieldType="formatting"
        title="Головна цитата"
        label="Текст підпису"
        value={title}
        onChange={(value) => onTitleChange?.(value)}
      />

      <CustomTextField
        fieldType="formatting"
        title="Підпис до цитати"
        label="Текст підпису"
        value={description}
        onChange={(value) => onDescriptionChange?.(value)}
      />

    </Box>
  );
};
