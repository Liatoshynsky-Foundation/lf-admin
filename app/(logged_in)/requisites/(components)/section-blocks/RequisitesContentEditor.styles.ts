import { type SxProps, type Theme } from '@mui/material';

export const styles = {
  container: {
    width: '100%'
  },
  textField: {
    width: '100%',
    '& .MuiInputBase-root': {
      height: 'auto',
      minHeight: '128px',
      padding: '14px 16px',
      alignItems: 'flex-start'
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'background.default',
      '&.Mui-focused fieldset': {
        borderColor: 'text.primary',
        borderWidth: '1.5px'
      }
    },
    '& .MuiInputLabel-root': {
      color: 'adminBlue.800',
      '&.Mui-focused': {
        color: 'text.primary'
      }
    },
    '& .MuiInputBase-input': {
      fontSize: '15px',
      lineHeight: 1.6,
      color: 'text.primary',
      fontFamily: 'inherit'
    },
    '& .MuiInputBase-inputMultiline': {
      padding: 0,
      fontSize: '15px',
      lineHeight: 1.6,
      color: 'text.primary',
      fontFamily: 'inherit',
      resize: 'vertical'
    }
  }
} satisfies Record<string, SxProps<Theme>>;
