import { Box } from '@mui/material';
import React from 'react';

import { CustomTextField } from '../design-system/text-field/TextField';

export const QuoteBlock: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <CustomTextField title="Головна цитата" label="Текст підпису" fullWidth multiline />
      <CustomTextField title="Підпис до цитати" label="Текст підпису" fullWidth />
    </Box>
  );
};
