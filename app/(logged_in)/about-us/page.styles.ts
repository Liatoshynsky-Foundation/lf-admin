import { SxProps, Theme } from '@mui/material';

export const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    p: '32px',
    width: '100%',
    gap: '32px'
  }
} satisfies Record<string, SxProps<Theme>>;
