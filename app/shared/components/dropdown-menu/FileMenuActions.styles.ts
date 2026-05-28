import { alpha } from '@mui/material';

import { mainHexPalette as colors} from '~/shared/theme/colors';

export const styles = {
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '8px 12px',
    borderRadius: '8px',
    width: '242px',
    boxSizing: 'border-box',
    '&:hover': {
      backgroundColor: alpha(colors.black, 0.06)
    }
  },
  
  menuText: {
    color: 'black'
  },

  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    color: 'black'
  }
};
