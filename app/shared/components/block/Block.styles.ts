import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  itemWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  addBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    mt: '16px'
  }
};
