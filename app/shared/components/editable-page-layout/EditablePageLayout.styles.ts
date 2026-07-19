import { SxProps, Theme } from '@mui/material';

export const styles = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    p: '32px',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    gap: '32px'
  },
  contentWrapper: (isSaving: boolean): SxProps<Theme> => ({
    pointerEvents: isSaving ? 'none' : 'auto',
    opacity: isSaving ? 0.6 : 1,
    transition: 'opacity 0.15s ease'
  })
};