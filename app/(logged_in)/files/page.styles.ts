import { SxProps, Theme } from '@mui/material';

export const styles = {
  filePageWrapper: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    p: '32px'
  },
  fileTagPageWrapper: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    p: '32px'
  }
} satisfies Record<string, SxProps<Theme>>;
