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
    fontSize: '32px',
    fontWeight: '700',
    color: '#190D03',
    lineHeight: '140%',
    fontFamily: 'Mulish'
  },

  mainContent: {
    fontSize: '18px',
    fontWeight: '400',
    color: '#190D03',
    lineHeight: '160%',
    marginTop: '16px',
    fontFamily: 'Mulish'
  },

  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '32px'
  },

  goBackBtn: {
    padding: '8px 48px',
    border: '1px solid #190D03',
    borderRadius: '28px',
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: '500',
    color: '#190D03',
    lineHeight: '150%',
    textTransform: 'none'
  },

  discardChangesBtn: {
    padding: '8px 48px',
    borderRadius: '28px',
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: '500',
    color: '#FCFCFC',
    backgroundColor: '#190D03',
    lineHeight: '150%',
    textTransform: 'none'
  }
};
