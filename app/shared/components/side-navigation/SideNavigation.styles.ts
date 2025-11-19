export const styles = {
  drawerPaper: {
    backgroundColor: '#F1F2F7',
    border: 'border-right: 1px solid #DCDDE5',
    position: 'fixed',
    maxWidth: '280px',
    padding: '16px 24px',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    height: '100vh',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  topSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  hideBtn: {
    fontSize: 0,
    borderRadius: '50%',
    width: 40,
    height: 40,
    backgroundColor: '#f0f0f0',
    alignSelf: 'center'
  },
  hideInClosed: (open: boolean) => ({
    display: open ? 'block' : 'none'
  }),
  subheader: {
    background: 'transparent',
    padding: '0',
    lineHeight: '140%',
    fontFamily: 'Mulish',
    position: 'relative'
  },
  divider: {
    my: '16px'
  }
};
