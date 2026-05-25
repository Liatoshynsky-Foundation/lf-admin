import type { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    p: '24px',
    textAlign: 'center'
  } satisfies SxProps<Theme>,

  icon: {
    mb: '4px'
  } satisfies SxProps<Theme>,

  title: {
    color: 'black'
  } satisfies SxProps<Theme>,

  description: {
    color: 'black',
    maxWidth: '480px',
    whiteSpace: 'pre-line'
  } satisfies SxProps<Theme>,

  actionButton: {
    mt: '8px',
    '&:hover': {
      boxShadow: 'none'
    }
  } satisfies SxProps<Theme>
};
