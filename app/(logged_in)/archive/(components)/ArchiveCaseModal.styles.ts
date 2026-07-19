import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '20px',
      p: '24px',
      width: 713
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 13px) scale(1)'
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)'
    }
  },
  datePicker: {
    width: '100%',
    '& .MuiPickersInputBase-root': {
      borderRadius: '8px',
      height: 48
    }
  },
  dialogTitle: {
    typography: 'h6',
    lineHeight: 1.2,
    p: 0
  },
  dialogContent: {
    p: '24px 0 0 0',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  contentContainer: {
    p: '24px 0'
  },
  shortTextField: {
    width: '154px'
  },
  sectionStack: {
    mt: 2
  },
  fileItemWrapper: {},
  dialogActions: {
    width: '100%',
    p: '0px'
  },
  cancelButton: {
    textTransform: 'none',
    width: '100%'
  },
  saveButton: {
    width: '100%',
    borderRadius: '28px'
  }
};
