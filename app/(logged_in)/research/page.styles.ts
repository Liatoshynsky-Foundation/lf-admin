import { SxProps, Theme } from '@mui/material';

export const styles = {
  pageContainer: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    px: { xs: '16px', lg: '24px', xl: '32px' },
    py: '32px'
  }
} satisfies Record<string, SxProps<Theme>>;