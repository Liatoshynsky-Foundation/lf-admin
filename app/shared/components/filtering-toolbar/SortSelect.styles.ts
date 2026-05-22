import { SxProps } from '@mui/material';

export const styles = {
  root: (variant: 'filled' | 'outlined', disabled: boolean, minWidth?: number): SxProps => {
    
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
      minWidth: minWidth ? `${minWidth}px` : '136px'
    };
  },

  label: (disabled: boolean): SxProps => ({
    fontWeight: 600,
    color: disabled ? 'blue.700' : 'black'
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

  dropdownMenu: (minWidth?: number): SxProps => ({
    '& .MuiPaper-root': {
      minWidth: minWidth ? `${minWidth}px` : undefined
    }
  }),

  divider: {
    my: 1
  },

  menuList: { 
    padding: '8px' 
  },

  sortMethodHeading: {
    color: 'adminBlue.900',
    fontSize: '12px',
    textTransform: 'uppercase',
    px: '12px',
    py: '4px'
  },

  menuItem: {
    fontWeight: 600
  }
};
