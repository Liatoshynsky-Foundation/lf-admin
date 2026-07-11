import { SxProps, Theme } from '@mui/material';

import { tableDividerColor } from '../table-layout/TableLayout.styles';

const styles: Record<string, SxProps<Theme>> = {
  menu: {
    '& .MuiMenu-list': {
      padding: '8px'
    }
  },
  menuGroupTitle: {
    pointerEvents: 'none',
    typography: 'subtitle2',
    paddingTop: '4px',
    paddingBottom: '4px',
  },

  menuItem: {
    height: '44px',
    '&:hover': {
      borderRadius: '8px',
      backgroundColor: 'adminBlue.100'
    }
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'start',
    gap: '12px',
    width: '100%',
    minWidth: '100px',
    justifyContent: 'space-between',
  },
  menuItemEndIcon: {
    width: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  menuItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    flexShrink: 0,
  },
  menuItemText: {
    whiteSpace: 'nowrap'
  },

  divider: {
    height: '1px',
    backgroundColor: tableDividerColor,
    my: '8px',
    mx: '-8px'
  },
};

export default styles;
