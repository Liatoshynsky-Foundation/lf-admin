import { SxProps } from '@mui/material';

export const styles: Record<string, SxProps> = {
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    padding: '24px',
    fontFamily: 'Mulish, sans-serif',
    '& .bn-container': {
      width: '100%'
    },
    '& .bn-editor': {
      minHeight: '400px'
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
