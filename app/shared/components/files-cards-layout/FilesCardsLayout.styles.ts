import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  listItem: {
    width: '100%',
    minWidth: 0
  },
  gridItem: {
    minWidth: 0
  }
};
