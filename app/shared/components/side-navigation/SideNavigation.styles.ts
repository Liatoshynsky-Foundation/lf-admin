import { SxProps } from '@mui/material';

export const styles = {
  wrapper: (width: number): SxProps => ({
    height: '100vh',
    width: width,
    flexShrink: 0
  }),

  drawerPaper: (width: number, open: boolean): SxProps => ({
    backgroundColor: 'adminBlue.100',
    borderRight: '1px solid',
    borderColor: 'adminBlue.300',
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    width: width,
    maxWidth: '280px',
    padding: '0',
    pt: open ? '32px' : '40px',
    pb: '32px',
    height: '100vh',
    overflow: 'visible',
    boxSizing: 'border-box',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }),

  navigationContent: {
    flex: 1,
    minHeight: 0,
    overflowY: 'scroll',
    overflowX: 'visible',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },

  topSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  hideBtn: (left: number): SxProps => ({
    borderRadius: '50%',
    width: 32,
    height: 32,
    backgroundColor: 'adminBlue.100',
    position: 'absolute',
    top: '90px',
    left: left,
    border: '1px solid',
    borderColor: 'adminBlue.300',
    transform: 'translateY(-50%)',
    zIndex: 1,
    '&:hover': {
      backgroundColor: 'adminBlue.200'
    }
  }),

  hideInClosed: (open: boolean) => ({
    display: open ? 'block' : 'none'
  }),

  subheader: {
    background: 'transparent',
    pl: '24px',
    my: '16px',
    lineHeight: '1.4',
    position: 'relative'
  },

  divider: {
    my: '16px'
  },

  logoBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexDirection: 'column',
    borderRadius: '8px',
    padding: 0,
    cursor: 'pointer'
  },

  logoTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  spacer: (open: boolean): SxProps => ({
    height: open ? 40 : 64
  }),

  list: {
    p: 0
  }
};
