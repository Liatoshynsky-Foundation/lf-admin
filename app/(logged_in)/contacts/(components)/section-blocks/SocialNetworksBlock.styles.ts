import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& path': {
      stroke: 'white',
      strokeWidth: 1.5
    }
  }
} satisfies Record<string, SxProps<Theme>>;
