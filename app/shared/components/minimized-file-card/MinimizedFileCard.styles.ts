export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: '11px 16px',
    borderRadius: '16px',
    borderColor: '#C6C8D3',
    backgroundColor: '#FCFCFC',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    '&:hover': {
      backgroundColor: '#F1F2F7'
    },
    '&:active': {
      backgroundColor: '#F1F2F7',
      borderColor: '#63666E'
    }
  },
  content: {
    gap: '8px'
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.7
    }
  }
};
