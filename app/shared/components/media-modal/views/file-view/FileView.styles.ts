import type { SxProps, Theme } from '@mui/material';

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '300px',
    gap: '16px'
  } as SxProps<Theme>,

  fileName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#E5E7EB',
    textAlign: 'center',
    wordBreak: 'break-word',
    maxWidth: '80%',
    marginTop: '8px'
  } as SxProps<Theme>
};
