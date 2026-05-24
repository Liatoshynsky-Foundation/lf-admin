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
    bgcolor: '#1a1512',
    color: '#ffffff',
    borderRadius: '9999px',
    px: 3,
    py: 1,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s',
    '&:hover': {
      bgcolor: '#000000'
    }
  }
};
