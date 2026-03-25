import { SxProps } from '@mui/material';

export const styles: Record<string, SxProps> = {
  body: {
    margin: '0 auto',
    display: 'flex',
    gap: '20px',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    height: '100vh',
    overflow: 'hidden'
  },
  container: {
    display: 'flex',
    flexGrow: 1,
    minWidth: 0,
    minHeight: 0,
    height: '100vh',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '20px',
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }
};
