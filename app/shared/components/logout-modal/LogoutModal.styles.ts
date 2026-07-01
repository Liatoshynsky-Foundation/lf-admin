export const styles = {
  dialogPaper: {
    width: '572px',
    maxWidth: '100%',
    borderRadius: '24px',
    padding: '28px 24px 28px 32px'
  },
  closeIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
    cursor: 'pointer',
    color: 'black'
  },
  title: {
    padding: 0,
    paddingBottom: '16px',
    typography: 'h6',
    color: 'black'
  },
  content: {
    padding: 0
  },
  description: {
    color: 'blue.800'
  },
  actions: {
    padding: 0,
    paddingTop: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '16px'
  },
  logoutBtn: {
    backgroundColor: 'yellow.500',
    color: 'black',
    '&:hover': {
      backgroundColor: 'yellow.600'
    }
  }
};
