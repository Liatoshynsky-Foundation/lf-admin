import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

export const styles: Record<string, SxProps<Theme>> = {
  input: {
    '& .MuiOutlinedInput-root': { borderRadius: '8px' },
    '& .MuiAutocomplete-endAdornment': { display: 'none' }
  },

  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  createOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#7a1f1f'
  },

  optionText: {
    fontSize: '14px'
  }
};
