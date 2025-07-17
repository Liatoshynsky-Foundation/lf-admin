import { Box } from '@mui/material';
import React from 'react';

import { CustomTextField } from '../design-system/text-field/TextField';

type QuoteBlockProps = {
  defaultMainQuote?: string;
  defaultCaption?: string;
};

export const QuoteBlock = ({ defaultMainQuote, defaultCaption }: QuoteBlockProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        title="Головна цитата"
        label="Текст підпису"
        defaultValue={defaultMainQuote}
        fullWidth
        multiline
      />
      <CustomTextField title="Підпис до цитати" label="Текст підпису" defaultValue={defaultCaption} fullWidth />
    </Box>
  );
};
