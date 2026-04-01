import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  wrapper: {
    width: '100%',
    minWidth: 0
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '16px',
    width: '100%',
    flexWrap: 'nowrap'
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    minWidth: 0,
    flex: 1
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
    flexShrink: 0
  },
  bottom: {
    pt: '12px',
    width: '100%'
  }
};
