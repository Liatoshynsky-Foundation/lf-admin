export const styles = {
  drawerPaper: {
    backgroundColor: '#F1F2F7',
    borderRight: '1px solid #DCDDE5',
    position: 'relative',
    width: '280px',
    minWidth: '280px',
    padding: '32px 0',
    scrollbarWidth: 'none',
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'visible',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  topSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  hideBtn: {
    borderRadius: '50%',
    width: 32,
    height: 32,
    backgroundColor: '#F1F2F7',
    position: 'absolute',
    top: '60px',
    border: '1px solid #DCDDE5',
    transform: 'translateY(-50%)',
    zIndex: 1,
    '&:hover': {
      backgroundColor: '#E0E0E0'
    }
  },
  hideInClosed: (open: boolean) => ({
    display: open ? 'block' : 'none'
  }),
  subheader: {
    background: 'transparent',
    pl: '24px',
    lineHeight: '140%',
    fontFamily: 'Mulish',
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
    padding: 0
  }
};
