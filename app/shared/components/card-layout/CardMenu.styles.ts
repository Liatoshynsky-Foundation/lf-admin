import { SxProps, Theme } from '@mui/material';

const styles: Record<string, SxProps<Theme>> = {
  menuItem: {
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: 'adminBlue.100'
    }
  }
};

export default styles;
