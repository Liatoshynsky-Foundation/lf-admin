export const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    p: '4px',
    borderRadius: '23px',
    bgcolor: 'blue.100',
    width: 'fit-content',
    gap: '4px'
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: '19px',
    p: '4px'
  },
  active: {
    bgcolor: 'black',
    color: 'white',
    '&:hover': {
      bgcolor: 'black'
    }
  },
  inactive: {
    bgcolor: 'transparent',
    color: 'black',
    '&:hover': {
      bgcolor: 'blue.200'
    }
  },

  gridIcon: {
    fontSize: 24,
    transform: 'scale(0.94)'
  },

  listIcon: {
    fontSize: 24
  }
};
