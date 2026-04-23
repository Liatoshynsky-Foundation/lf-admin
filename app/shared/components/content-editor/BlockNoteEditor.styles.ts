import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    padding: '24px',
    fontFamily: 'Mulish, sans-serif',
    '& .bn-container': {
      width: '100%',
    },
    '& .bn-editor': {
      minHeight: '400px',
    },
    // Hide native file input when using custom file picker
    '&.custom-file-picker-enabled': {
      '& input[type="file"]': {
        display: 'none !important',
        pointerEvents: 'none'
      }
    }
  },
  loadingPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#999',
    fontSize: '16px',
    fontFamily: 'Mulish, sans-serif'
  }
};
