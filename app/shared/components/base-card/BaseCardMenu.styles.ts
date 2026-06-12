import { SxProps, Theme } from '@mui/material';

const styles: Record<string, SxProps<Theme>> = {
  menu: {
    '& .MuiPaper-root': {
      padding: '0px'
    }
  },
  menuItem: {
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: 'adminBlue.100'
    }
  }
};

export default styles;
