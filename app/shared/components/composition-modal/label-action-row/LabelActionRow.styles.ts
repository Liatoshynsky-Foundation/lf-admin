import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  button: {
    borderRadius: '28px',
    p: '8px 24px',
    height: '40px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s',
  }
};
