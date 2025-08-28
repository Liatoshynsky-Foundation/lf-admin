export const styles = {
  modal: {
    width: '912px',
    maxHeight: '90vh',
    overflowY: 'auto',
    alignSelf: 'center',
    justifySelf: 'center',
    padding: '40px',
    backgroundColor: '#232529',
    borderRadius: '32px',
    outline: 'none',
    '&:focus': { outline: 'none' }
  },
  modalContent: { outline: 'none', border: 'none' },
  topSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },
  textSection: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    color: 'white',
    gap: '8px'
  },
  mainTitle: {},
  subTitle: {
    color: '#C1C9D6'
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    py: '10px'
  },
  buttons: {
    borderColor: 'white',
    borderRadius: '28px',
    textTransform: 'none'
  }
};
