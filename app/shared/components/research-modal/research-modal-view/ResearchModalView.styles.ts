import { SxProps, Theme } from '@mui/material';

import { mainHexPalette } from '~/shared/theme/colors';

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
  dialogTitle: {
    typography: 'h6',
    lineHeight: 1.2,
    p: 0
  },
  dialogContent: {
    p: '24px 0 0 0',
    '&::-webkit-scrollbar': { display: 'none' },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  contentContainer: {
    p: '24px 0'
  },
  charCounter: {
    display: 'block',
    textAlign: 'right',
    mt: '4px',
    color: 'text.secondary'
  },
  fileSectionTitle: {
    color: 'text.primary',
    fontWeight: 600
  },
  fileLabel: {
    color: 'text.secondary'
  },
  addFileButton: {
    textTransform: 'none',
    borderRadius: '20px',
    color: mainHexPalette.blue[700],
    backgroundColor: mainHexPalette.blue[100],
    border: 'none',
    '&:hover': {
      backgroundColor: mainHexPalette.blue[200]
    },
    '&.Mui-disabled': {
      backgroundColor: mainHexPalette.blue[100],
      color: mainHexPalette.blue[500]
    }
  },
  dialogActions: {
    width: '100%',
    p: '16px'
  },
  cancelButton: {
    textTransform: 'none',
    width: '100%'
  },
  saveButton: {
    width: '100%',
    borderRadius: '28px'
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '12px'
  },
  fileRowDivider: {
    flex: '1 1 auto',
    minWidth: '20px',
    borderBottom: `1px solid ${mainHexPalette.blue[200]}`
  }
};