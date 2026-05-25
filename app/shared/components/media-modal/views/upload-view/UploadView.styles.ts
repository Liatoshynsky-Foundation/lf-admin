import { alpha } from '@mui/material';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export const styles = {
  root: {
    boxSizing: 'border-box',
    height: '100%',
    minHeight: 0,
    pt: '24px'
  },

  dropzone: (isDragging: boolean, hasError: boolean) => ({
    all: 'unset',
    boxSizing: 'border-box',

    width: '100%',
    height: '100%',
    minHeight: 0,

    borderRadius: '32px',
    border: '2px dashed',
    borderColor: alpha(colors.blue[300], 0.7),
    display: 'grid',
    placeItems: 'center',
    padding: {
      xs: '24px',
      sm: '32px'
    },
    cursor: 'pointer',
    outline: 'none',

    ...(isDragging && {
      borderColor: alpha(colors.white, 0.85),
      backgroundColor: alpha(colors.white, 0.04)
    }),

    ...(hasError && {
      borderColor: alpha(colors.red[500], 0.7)
    }),

    '&:focus-visible': {
      boxShadow: `0 0 0 3px ${alpha(colors.white, 0.16)}`
    }
  }),

  center: {
    display: 'grid',
    gap: '20px',
    justifyItems: 'center',
    textAlign: 'center'
  },

  iconWrap: (hasError: boolean) => ({
    color: hasError ? 'error.main' : 'blue.300',
    '& svg': {
      width: '164px',
      height: 'auto',
      display: 'block'
    }
  }),

  text: {
    fontWeight: 600,
    lineHeight: '1.5',
    color: 'white'
  },

  textError: {
    color: 'error.main'
  }
};
