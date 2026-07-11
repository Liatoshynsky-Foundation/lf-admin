import { SxProps } from '@mui/material';


export const filterSelectStyles = {
  dropdownMenu: (menuMinWidth?: number): SxProps => ({
    '& .MuiPaper-root': {
	  minWidth: menuMinWidth ? `${menuMinWidth}px` : undefined
    }
  }),

  menuListWrapper: {
    padding: '0 8px'
  },

  menuItemsContainer: {
    maxHeight: '220px',
    overflowY: 'auto',

    scrollbarWidth: 'none',

    '&::-webkit-scrollbar': {
	  display: 'none'
    }
  },

  menuItem: {
    fontWeight: 600
  },

  divider: {
    my: 1
  },

  clearButton: {
    textTransform: 'none'
  }
};
