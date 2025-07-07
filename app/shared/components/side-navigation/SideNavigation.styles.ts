export const styles = {
  drawerPaper: {
    '& .MuiDrawer-paper': {
      backgroundColor: '#F3F2F2',
      border: 'none',
      maxWidth: '280px',
      padding: '16px 24px',
      overflowY: 'scroll',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
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
  })
};
