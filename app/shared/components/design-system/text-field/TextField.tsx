import { Box, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type TextFieldProps } from '@mui/material/TextField';
import React from 'react';

import { CustomFormattingField } from '../../custom-formatting-field/CustomFormattingField';
import { type Props as CustomFormattingFieldProps } from '../../custom-formatting-field/CustomFormattingField';
import { styles } from './TextField.styles';

interface StyledInput extends Omit<TextFieldProps, 'title'> {
  title?: string;
  fieldType?: 'styled';
}

interface FormattingInput extends CustomFormattingFieldProps {
  title?: string;
  fieldType: 'formatting';
}

export type Props = StyledInput | FormattingInput;

const StyledTextField = styled(TextField)(() => ({
  ...styles.customTextFieldStyles
}));

export const CustomTextField: React.FC<Props> = (allProps) => {
  const { title, ...props } = allProps;

  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" sx={styles.titleStyles}>
          {title}
        </Typography>
      )}

      {props.fieldType === 'formatting' ? <CustomFormattingField {...props} />:  <StyledTextField {...props} /> }
    </Box>
  );
};
