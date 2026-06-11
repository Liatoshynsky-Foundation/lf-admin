import { SxProps } from '@mui/material';

export const styles = {
  body: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  container: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    flexDirection: 'column'
  }
} satisfies Record<string, SxProps>;
