import { SxProps } from '@mui/material';


export const filterSelectStyles = {
  root: (variant: 'filled' | 'outlined', disabled: boolean): SxProps => {

    let bgColor = 'blue.200';
    
    if (disabled) {
      bgColor = 'adminBlue.50';
    } else if (variant === 'outlined') {
      bgColor = 'transparent';
    }

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '40px',
      gap: '12px',
      borderRadius: '8px',
      padding: '6px 12px 6px 16px',

      backgroundColor: bgColor,
      border: variant === 'outlined' ? 1 : 0,
      borderStyle: 'solid',
      borderColor: disabled ? 'blue.200' : 'black',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',

      fontWeight: 600,
      minWidth: '136px'
    };
  },

  label: (disabled: boolean): SxProps => ({
    fontWeight: 600,
    color: disabled ? 'blue.700' : 'black'
  }),

  chipContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: '1 1 auto',
    minWidth: 0,
    justifyContent: 'flex-end',
    width: 'auto'
  },

  selectedOptionsChip: (disabled: boolean): SxProps => ({
    backgroundColor: 'white',
    height: '28px',
    borderRadius: '20px',
    marginRight: 'auto',
    maxWidth: '260px',
    py: '8px',
    px: '4px',
    '& .MuiChip-label': {
      color: disabled ? 'blue.700' : 'black',
      typography: 'textMd',
      fontWeight: 600,
      fontStyle: 'italic',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      padding: '0 8px'
    },
    '& .MuiChip-deleteIcon': {
      color: disabled ? 'blue.700' : 'black',
      width: '16px',
      height: '16px',
      margin: '2px 9px 0 -2px',
      flexShrink: 0
    },
    '& .MuiChip-deleteIcon:hover': {
      color: disabled ? 'blue.700' : 'black'
    }
  }),

  dropdownIcon: (disabled: boolean): SxProps => ({
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: disabled ? 'blue.700' : 'black'
  }),

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
