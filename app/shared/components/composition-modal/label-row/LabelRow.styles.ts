import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%'
  },
  horizontalDivider: {
    flexGrow: 1,
    height: '1px',
    bgcolor: 'blue.200'
  }
};
