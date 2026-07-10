import { SxProps, Theme } from '@mui/material';

import { tableDividerColor } from '../table-layout/TableLayout.styles';

const styles: Record<string, SxProps<Theme>> = {
  menu: {
    margin: '8px',
    '& .MuiMenu-list': {
      padding: '8px'
    }
  },
  menuItem: {
    '&:hover': {
      borderRadius: '8px',
      backgroundColor: 'adminBlue.200'
    }
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'start',
    gap: '12px',
    width: '100%',
    minWidth: '100px'

  },
  menuItemIcon: {
    display: 'flex',
    alignItems: 'center',
    width: '25px',
  },
  menuItemText: {
    whiteSpace: 'nowrap'
  },
  divider: {
    height: '1px',
    backgroundColor: tableDividerColor,
    my: '8px'
  }
};

export default styles;