export const styles = {
  modal: {
    maxWidth: '630px',
    maxHeight: '280px',
    overflowY: 'auto',
    alignSelf: 'center',
    justifySelf: 'center',
    borderRadius: '32px',
    outline: 'none',
    '&:focus': { outline: 'none' }
  },

  contentWrapper: {
    padding: '40px 64px',
    backgroundColor: '#FCFCFC'
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  headerTitle: {
    color: '#190D03'
  },

  mainContent: {
    marginTop: '16px',
    color: '#190D03'
  },

  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '32px'
  },

  modalBtn: {
    padding: '8px 48px'
  }
};
