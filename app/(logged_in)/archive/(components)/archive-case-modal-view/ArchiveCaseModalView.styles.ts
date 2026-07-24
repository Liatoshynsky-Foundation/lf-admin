import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '20px',
      p: '16px 24px',
      width: 889,
      height: 715
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 13px) scale(1)'
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)'
    }
  },
  dialogHeaderBox: {
    display: 'flex',
    p: 0,
    alignItems: 'center',
    justifyContent: 'space-between'
  }, 
  dialogTitle: {
    typography: 'h6',
    lineHeight: 1.2,
    p: 0
  },
  dialogContent: {
    p: '24px 0 84px 0',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    overflowY: 'scroll',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  contentContainer: {
    pt: '24px'
  },
  shortTextField: {
    width: '154px'
  },
  sectionStack: {
    mt: 2
  },
  dialogActions: {
    width: '100%',
    p: '24px',
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: 'white'
  },
  cancelButton: {
    textTransform: 'none',
    width: '100%'
  },
  saveButton: {
    width: '100%',
    borderRadius: '28px'
  },
  multilineTextField: {
    '& .MuiInputBase-root': {
      height: 'auto',
      p: '12px 16px'
    }
  }
};
