import { Box, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type TextFieldProps } from '@mui/material/TextField';
import React from 'react';

import { styles } from './TextField.styles';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'title'> {
  title?: string;
}

const StyledTextField = styled(TextField)(() => ({
  ...styles.customTextFieldStyles
}));

export const CustomTextField: React.FC<CustomTextFieldProps> = ({ title, ...props }) => {
  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" sx={styles.titleStyles}>
          {title}
        </Typography>
      )}
      <StyledTextField {...props} />
    </Box>
  );
};
