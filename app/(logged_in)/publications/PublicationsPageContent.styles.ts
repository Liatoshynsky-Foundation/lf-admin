import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'stretch',
    width: '100%'
  },
  cardWrapper: {
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
  }
};
