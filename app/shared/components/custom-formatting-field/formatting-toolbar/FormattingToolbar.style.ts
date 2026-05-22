import { alpha, SxProps, Theme } from '@mui/material';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    position: 'relative',
    zIndex: 100,
    display: 'flex',
    gap: 0.5,
    p: '2px',
    height: '34px',
    backgroundColor: 'background.paper'
  },

  toolbarGroup: {
    display: 'flex',
    gap: 0.5
  },

  toggleButton: {
    border: 'none',
    width: 30,
    height: 30,
    p: 1,
    '&.MuiToggleButton-root': {
      border: 'none'
    },

    '&:hover': {
      backgroundColor: alpha(colors.black, 0.08),
      color: 'primary.main'
    },

    '&.Mui-selected': {
      backgroundColor: 'blue.900',
      color: 'white',
      border: 'none',
      '&:hover': {
        backgroundColor: 'blue.900'
      }
    }
  },
  linkEditInputContainer: { 
    display: 'flex', 
    width: '100%', 
    alignItems: 'center', 
    px: 1 
  },

  linkEditInput: {
    flex: 1,
    typography: 'subtitle2'
  }
};
