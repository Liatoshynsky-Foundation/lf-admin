import { Box, type SxProps, TextField, type Theme, Typography } from '@mui/material';
import { type TextFieldProps } from '@mui/material/TextField';
import React from 'react';

import { CustomFormattingField } from '../../custom-formatting-field/CustomFormattingField';
import { type Props as CustomFormattingFieldProps } from '../../custom-formatting-field/CustomFormattingField';
import { styles } from './TextField.styles';

interface StyledInput extends Omit<TextFieldProps, 'title'> {
  title?: string;
  fieldType?: 'styled';
  titleSx?: SxProps<Theme>;
}

interface FormattingInput extends CustomFormattingFieldProps {
  title?: string;
  fieldType: 'formatting';
  titleSx?: SxProps<Theme>;
}

export type Props = StyledInput | FormattingInput;

const StyledTextField = styled(TextField)(() => ({
  ...styles.customTextFieldStyles
}));

export const CustomTextField: React.FC<Props> = (allProps) => {
  const { title, titleSx, ...props } = allProps;

  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" sx={{ ...styles.titleStyles, ...titleSx }}>
          {title}
        </Typography>
      )}

      {props.fieldType === 'formatting' ? <CustomFormattingField {...props} />:  <StyledTextField {...props} /> }
    </Box>
  );
};
