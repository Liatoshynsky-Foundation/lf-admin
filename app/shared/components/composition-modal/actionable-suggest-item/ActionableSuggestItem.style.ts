import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%'
  },
  inputRoot: {
    flex: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px'
    }
  },
  datePicker: {
    flex: 1,
    '& .MuiPickersInputBase-root': {
      borderRadius: '8px',
      height: 48,
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5
    }
  },
  iconButton: {
    color: '#1a1512',
    padding: '8px'
  }
};
