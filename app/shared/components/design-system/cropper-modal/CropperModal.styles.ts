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
  mainTitle: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: '20px',
    lineHeight: '140%'
  },
  subTitle: {
    fontFamily: 'Mulish',
    fontWeight: '500',
    fontSize: '18px',
    lineHeight: '135%',
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
    textTransform: 'none',
    fontFamily: 'Mulish',
    fontWeight: '500',
    fontSize: '16px',
    lineHeight: '150%'
  }
};
