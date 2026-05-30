export const linkStyles = {
  mb: '0',
  justifyContent: 'center',
  '& .MuiListItemText-root': {
    textAlign: 'center',
    pl: 0
  },
  '& .MuiListItemText-primary': {
    textAlign: 'center'
  }
};

export const styles = {
  listBox: {
    display: 'flex'
  },
  collapse: {
    transition: 'ease-in 0.3s',
    '& .MuiListItemText-root': {
      pl: '32px'
    }
  },
  floatingSubmenu: {
    zIndex: 1000,
    maxHeight: 'calc(100vh - 16px)',
    overflowY: 'auto'
  }
};
