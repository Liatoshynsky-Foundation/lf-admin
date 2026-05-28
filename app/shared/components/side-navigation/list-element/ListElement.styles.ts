import { alpha } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  listItem: {
    px: 0,
    borderRadius: '8px',
    justifyContent: 'center',
    minHeight: '40px',
    my: '16px',
    mx: '16px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: '8px',
    '&.Mui-selected': {
      backgroundColor: alpha(colors.black, 0.12)
    }
  },
  listItemIcon: {
    minWidth: '24px'
  },
  listItemText: {
    typography: 'textMd'
  }
};
