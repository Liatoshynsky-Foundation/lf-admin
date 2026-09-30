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
    boxSizing: 'border-box'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '40px',
    width: '100%'
  },

  inputContainer: {
    width: '452px',
    maxWidth: '100%',
    paddingTop: '24px',
  },

  actions: {
    display: 'flex',
    gap: '16px',
    paddingTop: '40px',
  },

  saveButton: {
    width: '120px'
  },

  cancelButton: {
    width: '131px'
  },
  renameFileIcon: {
    color: 'black',
    p: 0
  },
  renameFileText: {
    lineHeight: '1.4'
  }
};
