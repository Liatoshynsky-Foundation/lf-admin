'use client';

import { Box } from '@mui/material';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { styles } from './RequisitesContentEditor.styles';
import { REQUISITES_MESSAGES } from '~/constants/requisites';
import { CustomFormattingField } from '~/shared/components/custom-formatting-field/CustomFormattingField';

interface RequisitesContentEditorProps {
  value?: JSONContent;
  onChange: (value: JSONContent) => void;
}

export const RequisitesContentEditor: React.FC<RequisitesContentEditorProps> = ({
  value,
  onChange
}) => {
  return (
    <Box sx={styles.container}>
      <CustomFormattingField
        label={REQUISITES_MESSAGES.CONTENT_LABEL}
        value={value}
        onChange={onChange}
      />
    </Box>
  );
};
