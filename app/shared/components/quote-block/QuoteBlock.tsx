import { Box } from '@mui/material';
import React from 'react';

import { CustomTextField } from '~/ds-components/text-field/TextField';

type QuoteBlockProps = {
  defaultMainQuote?: string;
  defaultCaption?: string;
  onMainQuoteChange: (newValue: string) => void;
  onCaptionChange: (newValue: string) => void;
};

export const QuoteBlock = ({
  defaultMainQuote,
  defaultCaption,
  onMainQuoteChange,
  onCaptionChange
}: QuoteBlockProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField
        title="Головна цитата"
        label="Текст підпису"
        defaultValue={defaultMainQuote}
        onChange={(e) => onMainQuoteChange(e.target.value)}
        fullWidth
        multiline
      />
      <CustomTextField
        title="Підпис до цитати"
        label="Текст підпису"
        defaultValue={defaultCaption}
        onChange={(e) => onCaptionChange(e.target.value)}
        fullWidth
      />
    </Box>
  );
};
