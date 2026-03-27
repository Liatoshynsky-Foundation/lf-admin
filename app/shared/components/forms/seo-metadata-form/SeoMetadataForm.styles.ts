const colors = {
  blue: { 300: '#C6C8D3', 200: '#D9DCE8', 800: '#52545A' },
  adminBlue: { 500: '#ADAEBA' },
  black: '#190D03',
  slateGray: '#5E6A79',
  darkGrafite: '#474D5A',
  yellow: { 500: '#FCBD28' },
  white: '#FCFCFC'
};

export const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '28px',
    borderRadius: '20px',
    backgroundColor: colors.white,
    border: `1px solid ${colors.blue[300]}`,
    maxWidth: '560px',
    width: '48%',
    minHeight: '794px',
    mt: 4,
    px: 4,
    py: 3
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderRadius: '8px',
        borderColor: colors.adminBlue[500],
        borderWidth: '1px'
      },
      '&:hover fieldset': {
        borderColor: colors.adminBlue[500]
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.adminBlue[500],
        borderWidth: '1px'
      }
    },
    '& .MuiInputLabel-root': {
      color: colors.blue[800]
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: colors.blue[800]
    }
  },
  formFields: {
    direction: 'column',
    spacing: 2.5,
    width: '100%',
    minHeight: '324px'
  },
  sectionTitle: {
    fontFamily: 'Mulish',
    fontSize: '24px',
    fontWeight: 700,
    fontStyle: 'bold',
    lineHeight: '120%',
    color: colors.black,
    verticalAlignment: 'center',
    letterSpacing: 0,
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
    fontFamily: 'Mulish',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '130%',
    color: colors.blue[800],
    letterSpacing: '0.17px'
  },
  photoBlockHeaderDivider: {
    flexGrow: 1
  },
  ogImageHint: {
    fontFamily: 'Mulish',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '140%',
    fontStyle: 'italic',
    color: colors.darkGrafite
  },
  divider: {
    colors: colors.blue[200]
  },
  indexingCheckboxContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  indexingCheckbox: {
    '&.Mui-checked': {
      color: colors.yellow[500]
    }
  },
  dateTimePicker: {
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Mulish',
    lineHeight: '150%',
    color: '#696C7D'
  },
  datetimePickerLabel: {
    fontSize: '14px',
    color: colors.blue[800],
    lineHeight: '12px',
    fontFamily: 'Mulish',
    fontWeight: 500
  }
};
