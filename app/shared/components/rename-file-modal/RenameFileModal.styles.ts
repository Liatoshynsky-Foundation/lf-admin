import { SxProps, Theme } from '@mui/material/styles';

export const renameFileModalStyles: Record<string, SxProps<Theme>> = {
  paper: {
    width: '572px',
    maxWidth: '100%',
    borderRadius: '24px',
    padding: '28px 24px 28px 32px',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    boxSizing: 'border-box'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },

  inputContainer: {
    width: '452px',
    maxWidth: '100%'
  },

  actions: {
    display: 'flex',
    gap: '16px'
  },

  saveButton: {
    width: '120px'
  },

  cancelButton: {
    width: '131px'
  }
};
