import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100vh',
    bgcolor: 'adminBlue.50'
  },
  header: {
    bgcolor: 'white'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    p: '32px 28px'
  }
} satisfies Record<string, SxProps<Theme>>;
