import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },

  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    mx: '32px',
    mt: '16px',
    mb: '32px',
    width: 'calc(100% - 64px)'
  },

  seoBlock: {
    backgroundColor: colors.white,
    padding: '24px',
    '& .MuiAccordionSummary-content': { margin: '0 0 24px' },
    '& .MuiAccordion-heading': { '& .MuiButtonBase-root': { padding: 0 } }
  },

  seoBlockChildren: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: 0
  },

  textField: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderRadius: '8px',
        borderColor: colors.blue[500],
        borderWidth: '1px',
        borderStyle: 'solid'
      },
      '&:hover fieldset': {
        borderColor: 'rgba(25, 13, 3, 0.5)'
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.black,
        borderWidth: '1px'
      },
      '&.Mui-disabled fieldset': {
        borderColor: 'rgba(25, 13, 3, 0.25)'
      },
      '&.Mui-error fieldset': {
        borderColor: '#E63C14'
      }
    },
    '& .MuiInputLabel-root': {
      color: colors.blue[800]
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: colors.blue[800]
    },
    '& .MuiInputBase-root': {
      height: '48px'
    }
  },

  textFieldInput: {
    padding: '0 16px'
  },

  datePickerTextField: {
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#190D03'
    },
    '& .MuiInputLabel-root:not(.MuiInputLabel-shrunk)': {
      top: '-3px'
    },
    width: '238px',
    '& .MuiPickersOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiPickersOutlinedInput-notchedOutline': {
      borderColor: '#190D03',
      borderWidth: '1px'
    }
  },

  datePickerInput: {
    borderRadius: '8px',
    height: '48px'
  }
};
