import { SxProps, Theme } from '@mui/material';

export const styles = {
  pageContainer: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }
} satisfies Record<string, SxProps<Theme>>;