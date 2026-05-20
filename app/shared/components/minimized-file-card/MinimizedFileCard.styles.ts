import { alpha } from '@mui/material';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: '11px 16px',
    borderRadius: '16px',
    borderColor: 'blue.300',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    '&:hover': {
      backgroundColor: 'adminBlue.100'
    },
    '&:active': {
      backgroundColor: 'adminBlue.100',
      borderColor: 'blue.700'
    }
  },
  content: {
    gap: '8px'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.7
    }
  },
  fileName: {
    lineHeight: '1.5'
  },
  date: {
    color: 'blue.700',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: '1'
  },

  menuButton: {
    backgroundColor: 'transparent',
    '&:hover': { 
      backgroundColor: alpha(colors.black, 0.08)
    }
  },
  
  menuButtonActive: {
    backgroundColor: alpha(colors.black, 0.08)
  }
};
