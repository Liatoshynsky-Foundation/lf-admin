import { SxProps, Theme } from '@mui/material';
import { CSSProperties } from 'react';

export const searchInputStyles = {
  padding: 8,
  height: 40,
  transition: 'width 0.6s ease',
  overflow: 'hidden'
} as CSSProperties;

export const iconWrapperStyles = {
  width: '24px',
  height: '24px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
} as SxProps<Theme>;

export const inputAdornmentStyles = {
  margin: 0,
  padding: 0
} as SxProps<Theme>;

export const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#FCFCFC'
    },
    '&:hover fieldset': {
      borderColor: '#FCFCFC'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FCFCFC'
    }
  },
  '& .MuiOutlinedInput-input': {
    color: '#FCFCFC',
    fontSize: '16px',
    fontFamily: 'Mulish',
    padding: 0,
    '&::placeholder': {
      color: '#999',
      opacity: 1
    }
  }
} as SxProps<Theme>;

export const getInputStyle = (focused: boolean): CSSProperties => ({
  ...searchInputStyles,
  width: focused ? 200 : 40,
  borderRadius: focused ? '10px' : '60px'
});
