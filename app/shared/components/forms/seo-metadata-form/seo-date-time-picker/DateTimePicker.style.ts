

export const styles = {
  wrapper: { width: '100%' },
  container: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  separator: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '10%',
    color: 'blue.500'
  },
  popper: {
    '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
      backgroundColor: 'yellow.500',
      color: 'black'
    },
    '& .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover': {
      backgroundColor: 'yellow.500'
    }
  },
  day: {
    '&.MuiPickersDay-root.Mui-selected': {
      backgroundColor: 'yellow.500',
      color: 'black'
    }
  },
  textField: {
    width: { sm: '180px', xl: '223px' },
    '& .MuiPickersOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline': {
      borderWidth: '1px'
    }
  },
  dateTimePickerInput: {
    borderRadius: '8px',
    color: 'adminBlue.800',
  },
  datetimePickerLabel: {
    typography: 'subtitle2',
    color: 'adminBlue.800',
  }
};
