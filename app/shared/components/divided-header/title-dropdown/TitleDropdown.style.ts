import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: { display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' },

  typography: {
    fontWeight: 700,
    lineHeight: 1.4
  },
  separator: {
    fontWeight: 700,
    lineHeight: 1.4,
    color: 'blue.500'
  },
  iconButton: {
    ml: '-4px',
    color: 'text.primary'
  }
};
