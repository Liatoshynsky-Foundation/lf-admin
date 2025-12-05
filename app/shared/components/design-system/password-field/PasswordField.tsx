'use client';

import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  OutlinedInputProps
} from '@mui/material';
import React from 'react';

import { autofillFix, overwrites } from './PasswordField.styles';
import VisibilityOn from '~/public/icons/eye.svg';
import VisibilityOff from '~/public/icons/eye-closed.svg';

interface PasswordFieldProps extends OutlinedInputProps {
  helperText: string | null;
}

const PasswordField = ({ helperText, sx, ...props }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Box sx={autofillFix}>
      <FormControl variant="outlined" fullWidth>
        <InputLabel htmlFor="outlined-adornment-password" sx={overwrites.label}>
          Пароль
        </InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'hide the password' : 'display the password'}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                onMouseUp={handleMouseUpPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOn /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          sx={{ ...sx, ...overwrites.input }}
          {...props}
        />
        {helperText && <FormHelperText sx={overwrites.helperText}>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default PasswordField;
