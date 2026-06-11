import { SxProps, Theme } from '@mui/material';

export const sharedMenuStyles = {
  menu: {
    mt: 1,
    '& .MuiPaper-root': {
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',

      overflowY: 'auto'
    }
  },
  menuItem: {
    p: '10px 16px',
    borderRadius: '8px',
    height: 44
  },
  publishMenuPaper: {
    width: 260
  },
  navigationMenuPaper: {
    width: 205
  }
} satisfies Record<string, SxProps<Theme>>;
