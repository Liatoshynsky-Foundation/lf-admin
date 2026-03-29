import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  menu: {
    mt: 1,
    '& .MuiPaper-root': {
      borderRadius: '8px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.06), 0px 0px 4px rgba(0, 0, 0, 0.04)',
      minWidth: '260px'
    },
    '& .MuiMenuItem-root': {
      height: '42px',
      textAlign: 'center',
      borderRadius: '8px',
      fontWeight: 500,
      lineHeight: '150%',
      fontSize: '16px'
    }
  }
};
