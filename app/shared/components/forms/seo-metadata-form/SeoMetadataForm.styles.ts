export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    borderRadius: '20px',
    backgroundColor: 'white',
    border: '1px solid',
    borderColor: 'blue.300',
    width: '48%',
    minWidth: 0,
    px: 4,
    py: 3
  },

  textField: {
    '& .MuiOutlinedInput-root': {
      alignItems: 'center',
      '&.MuiInputBase-multiline': {
        alignItems: 'flex-start',
        height: 'auto',
        paddingTop: '12px',
        paddingBottom: '12px'
      }
    }
  },

  formFieldsContainer: {
    flexDirection: 'column',
    gap: '20px',
    width: '100%',

    '& .MuiFormControl-root, & .MuiTextField-root': {
      marginTop: 0,
      marginBottom: 0
    }
  },

  sectionTitle: {
    lineHeight: '1.2',
    color: 'black',
    verticalAlignment: 'middle',
    height: '17px'
  },

  photoBlock: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '16px'
  },

  photoBlockHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    height: '20px'
  },

  photoBlockTitle: {
    color: 'blue.800',
    letterSpacing: '0.17px'
  },

  photoBlockHeaderDivider: {
    flexGrow: 1
  },

  ogImageHint: {
    lineHeight: '1.4',
    fontStyle: 'italic',
    color: 'blue.800'
  },

  divider: {
    borderColor: 'blue.200'
  },

  indexingCheckboxContainer: {
    display: 'flex',
    alignItems: 'center'
  },

  indexingCheckbox: {
    '& .MuiFormControlLabel-label': {
      color: 'blue.800',
      typography: 'subtitle1',
      lineHeight: '1.5'
    }
  },
  
  infoIcon: { 
    borderWidth: '1px', 
    width: '16px', 
    height: '16px' 
  }
};
