import { SxProps, Theme } from '@mui/material/styles';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  autocomplete: (maxWidth: number | string): SxProps<Theme> => ({
    width: '100%',
    maxWidth,
    '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"]': {
      pr: '12px',
      pl: '16px'
    }
  }),

  startAdornment: {
    mr: '2px'
  } as SxProps<Theme>,

  listItem: { py: 1 } as SxProps<Theme>,

  input: {
    borderRadius: '8px',
    height: '40px',
    bgcolor: 'white',
    '& .MuiOutlinedInput-input::placeholder': {
      color: colors.black,
      opacity: 1
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.blue[500]
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.blue[600]
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.blue[800]
    }
  } as SxProps<Theme>,

  clearButton: {
    border: 'none',
    background: 'transparent',
    color: colors.blue[700],
    cursor: 'pointer',
    fontSize: '13px',
    px: '4px'
  } as SxProps<Theme>
};
