import { alpha } from '@mui/material';

import { mainHexPalette, shadowColors } from '~/shared/theme/colors';

export const linkStyles = {
  mb: '0',
  justifyContent: 'center',
  '& .MuiListItemText-root': {
    textAlign: 'center',
    pl: 0
  },
  '& .MuiListItemText-primary': {
    textAlign: 'center'
  }
};

export const styles = {
  listBox: {
    display: 'flex'
  },
  collapse: {
    transition: 'ease-in 0.3s',
    '& .MuiListItemText-root': {
      pl: '32px'
    }
  },
  floatingSubmenu: {
    maxHeight: 'calc(100vh - 16px)',
    width: '223px',
    padding: '8px',
    overflowY: 'auto',
    backgroundColor: mainHexPalette.white,
    borderRadius: '8px',
    boxShadow: `0 4px 8px 0 ${alpha(shadowColors.popup, 0.06)}, 0 0 4px 0 ${alpha(shadowColors.popup, 0.04)}`
  },
  subItem: {
    margin: 0,
    padding: '10px 16px',
    alignItems: 'flex-start',
    '& .MuiListItemText-root': {
      margin: 0
    }
  }
};
