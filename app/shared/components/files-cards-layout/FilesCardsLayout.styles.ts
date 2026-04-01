import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  root: {
    width: '100%',
    minWidth: 0,
    pt: '8px',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: '16px',
    width: '100%'
  },
  gridItem: {
    minWidth: 0,
    display: 'flex',
    flex: {
      xs: '0 0 100%',
      sm: '0 0 calc((100% - 16px) / 2)',
      md: '0 0 calc((100% - 32px) / 3)',
      xl: '0 0 calc((100% - 48px) / 4)'
    },
    maxWidth: {
      xs: '100%',
      sm: 'calc((100% - 16px) / 2)',
      md: 'calc((100% - 32px) / 3)',
      xl: 'calc((100% - 48px) / 4)'
    },
    justifyContent: 'flex-start'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  listItem: {
    width: '100%',
    minWidth: 0
  }
};
