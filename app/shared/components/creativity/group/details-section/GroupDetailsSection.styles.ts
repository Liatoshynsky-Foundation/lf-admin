import { SxProps, Theme } from '@mui/material';

export const styles = {
  mainContainer: { display: 'flex', flexDirection: 'column', gap: 3 },
  headerRow: { display: 'flex', alignItems: 'center', gap: 2 },
  typographyTitle: {
    fontWeight: 500,
    lineHeight: '130%',
    letterSpacing: '0.17px'
  },
  divider: { flexGrow: 1 },
  topRow: { display: 'flex', gap: 2, width: '50%' },
  bottomRow: { display: 'flex', gap: 2 },

  datesContainer: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: 1, 
    flex: 3.5 
  },
  dashWrapper: { 
    height: '48px', 
    display: 'flex', 
    alignItems: 'center',
    color: 'text.primary'
  },

  selectField: {
    '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInput-underline:hover:not(.Mui-disabled):before':
      {
        borderBottom: 'none'
      }
  },
  numberField: {
    '& input[type=number]': {
      MozAppearance: 'textfield'
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0
    }
  },
  datePickerInput: {
    '& .MuiPickersInputBase-root': {
      borderRadius: '8px',
      height: 48
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: 'black'
    },
    '& .MuiInputLabel-root:not(.MuiInputLabel-shrunk)': {
      top: '-3px'
    },
    '& .MuiInputAdornment-root': {
      display: 'none'
    },
    width: '100%',
    borderRadius: '8px',
    '& .MuiPickersOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline': {
      borderColor: 'black',
      borderWidth: '1px'
    }
  },
  readOnlyInput: {
    '& input': {
      textAlign: 'left',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }
  }
} satisfies Record<string, SxProps<Theme>>;
