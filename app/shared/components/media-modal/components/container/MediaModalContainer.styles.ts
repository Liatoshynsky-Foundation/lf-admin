import { alpha } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  dialog: {
    '& .MuiBackdrop-root': {
      backgroundColor: alpha(colors.black, 0.6)
    }
  },

  paper: {
    width: {
      xs: 'calc(100vw - 24px)',
      sm: '912px'
    },
    height: {
      xs: 'calc(100vh - 24px)',
      sm: '787px'
    },
    borderRadius: '32px',
    p: {
      xs: '24px',
      sm: '40px'
    },

    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'hidden',

    backgroundColor: 'charcoalGray',
    color: 'white'
  },

  header: {
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'start',
    gap: '16px',
    minHeight: '40px'
  },

  headerLeft: {
    minWidth: 0
  },
  headerCenter: {
    justifySelf: 'center'
  },

  headerRight: {
    justifySelf: 'end',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '24px'
  },

  closeIcon: {
    color: 'white',
    '&:hover': {
      backgroundColor: alpha(colors.white, 0.08)
    }
  },

  body: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto'
  },

  footer: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },

  footerBottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap'
  },

  footerLeft: {
    minWidth: 0
  },

  footerRight: {
    display: 'flex',
    gap: '16px'
  }
};
