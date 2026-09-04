import { SxProps, Theme } from '@mui/material';

export const styles = {
  options: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 40px)',
    gap: 1,
    p: '10px 16px'
  }
} satisfies Record<string, SxProps<Theme>>;
