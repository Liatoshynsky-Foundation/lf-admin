import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  container: {
    width: 'calc(100% + 20px)',
    height: '104px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #190D0333',
    p: '32px 24px',
    ml: '-20px'
  },
  contentStack: {
    width: '100%'
  },
  children: {
    borderInline: '1px solid rgba(0,0,0,0.2)',
    width: '100%',
    height: '40px',
    mx: '12px',
    px: '16px',
    gap: '16px'
  },
  rightHeader: {},
  discardButton: {},
  proceedButton: {
    '&:hover, &:active, &:focus': {
      color: '#000',
      backgroundColor: '#E0A01F'
    }
  }
};
