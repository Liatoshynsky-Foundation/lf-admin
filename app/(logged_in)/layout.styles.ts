import { SxProps } from '@mui/material';

export const styles: Record<string, SxProps> = {
  body: {
    margin: '0 auto',
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  container: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    minHeight: '100vh'
  }
};
