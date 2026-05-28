import { alpha } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  cropHeader: {
    display: 'grid',
    gap: '4px',
    alignItems: 'start'
  },

  cropHeaderTitle: {
    typography: 'h6',
    fontWeight: 700,
    color: 'white'
  },

  cropHeaderSubtitle: {
    typography: 'subtitle1',
    lineHeight: '1.5',
    color: 'blue.300'
  },

  headerIconButton: {
    color: 'white',
    '&:hover': {
      backgroundColor: alpha(colors.white, 0.08)
    },
    '&.Mui-disabled': {
      color: alpha(colors.blue[300], 0.6)
    }
  },

  footerBackButton: {
    padding: '8px 24px'
  }
};


