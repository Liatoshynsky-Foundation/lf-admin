import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%'
  },
  horizontalDivider: {
    flexGrow: 1,
    height: '1px',
    bgcolor: 'blue.200'
  },
  button: {
    borderRadius: '28px',
    p: '8px 24px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s',
  }
};
