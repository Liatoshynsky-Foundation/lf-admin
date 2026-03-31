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
  dateTimePicker: {
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'Mulish',
    lineHeight: '150%',
    color: '#696C7D',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.black
    }
  },
  datetimePickerLabel: {
    fontSize: '14px',
    color: colors.yellow[500],
    lineHeight: '12px',
    fontFamily: 'Mulish',
    fontWeight: 500
  }
};
