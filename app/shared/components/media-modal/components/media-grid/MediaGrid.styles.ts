import { SxProps, Theme } from '@mui/material';

export const mediaGridStyles = {
  container: {
    width: '100%',
    overflow: 'auto'
  } as SxProps<Theme>,

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(1, minmax(196px, 1fr))',
      sm: 'repeat(2, minmax(196px, 1fr))',
      md: 'repeat(3, minmax(196px, 1fr))',
      lg: 'repeat(4, minmax(196px, 1fr))'
    },
    gap: '16px'
  } as SxProps<Theme>
};
