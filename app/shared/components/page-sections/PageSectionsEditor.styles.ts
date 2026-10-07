import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  sectionSlot: {
    '&:not(:last-child)': {
      mb: '16px'
    }
  },
  addSectionRow: {
    display: 'flex',
    justifyContent: 'center'
  }
};
