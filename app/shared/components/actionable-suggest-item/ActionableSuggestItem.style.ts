import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%',
  },
  inputRoot: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
  datePicker: {
    minWidth: '164px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
  iconButton: {
    color: '#1a1512',
    padding: '8px',
  },
};
