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
  formFields: {
    direction: 'column',
    spacing: 2.5,
    width: '100%',
    minHeight: '324px'
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderRadius: '8px',
        borderColor: '#ADAEBA', // default
        borderWidth: '1px'
      },

      '&:hover fieldset': {
        borderColor: 'rgba(25, 13, 3, 0.5)' // hover
      },

      '&.Mui-focused fieldset': {
        borderColor: '#190D03', // focused
        borderWidth: '1px'
      },

      '&.Mui-error fieldset': {
        borderColor: '#E63C14' // error
      },

      '&.Mui-disabled fieldset': {
        borderColor: 'rgba(25, 13, 3, 0.25)' // disabled
      }
    },

    '& .MuiInputLabel-root': {
      color: colors.blue[800]
    },

    '& .MuiInputLabel-root.Mui-focused': {
      color: colors.blue[800]
    }
  }
};
