import { Box, type SxProps, TextField, type Theme, Typography } from '@mui/material';
import { type TextFieldProps } from '@mui/material/TextField';
import React from 'react';

import { styles } from './TextField.styles';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'title'> {
  title?: string;
  titleSx?: SxProps<Theme>;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({ title, titleSx, sx, ...props }) => {
  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" sx={{ ...styles.titleStyles, ...titleSx }}>
          {title}
        </Typography>
      )}
      <TextField sx={{ ...styles.textField, ...sx }} {...props} />
    </Box>
  );
};
