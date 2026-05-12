import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    gap: 0.5,
    p: '2px',
    height: '34px',
    backgroundColor: 'background.paper'
  },
  toggleButton: {
    border: 'none',
    width: 30,
    height: 30,
    p: 1,
    '&.MuiToggleButton-root': {
      border: 'none'
    },

    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      color: 'primary.main'
    },

    '&.Mui-selected': {
      backgroundColor: '#3f3f3f',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: '#3f3f3f',
      }
    },

  }
};
