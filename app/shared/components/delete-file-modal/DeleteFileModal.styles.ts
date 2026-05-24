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
  filename: {
    fontWeight: 700,
    color: 'blue.800'
  },
  usageList: {
    marginTop: '12px',
    marginBottom: 0,
    paddingLeft: '24px',
    color: 'blue.800'
  },
  usageItem: {
    textDecoration: 'underline',
    textUnderlineOffset: '2px'
  },
  actions: {
    padding: 0,
    paddingTop: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '16px'
  },
  deleteBtn: {
    backgroundColor: 'red.600',
    color: 'white',
    '&:hover': {
      backgroundColor: 'red.700'
    }
  },
  okBtn: {
    backgroundColor: 'yellow.500',
    color: 'black',
    '&:hover': {
      backgroundColor: 'yellow.600'
    }
  }
};
