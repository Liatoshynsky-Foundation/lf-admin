'use client';

import { Box, TextField } from '@mui/material';
import React from 'react';

import { styles } from './RequisitesContentEditor.styles';
import { REQUISITES_MESSAGES } from '~/constants/requisites';

interface RequisitesContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const RequisitesContentEditor: React.FC<RequisitesContentEditorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <Box sx={styles.container}>
      <TextField
        label={REQUISITES_MESSAGES.CONTENT_LABEL}
        multiline
        minRows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={REQUISITES_MESSAGES.CONTENT_PLACEHOLDER}
        disabled={disabled}
        fullWidth
        slotProps={{
          inputLabel: {
            shrink: true
          }
        }}
        sx={styles.textField}
      />
    </Box>
  );
};
