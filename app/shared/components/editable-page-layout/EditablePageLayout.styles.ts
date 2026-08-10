import { SxProps, Theme } from '@mui/material';

export const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    p: '32px',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    gap: '32px'
  }
} satisfies Record<string, SxProps<Theme>>;