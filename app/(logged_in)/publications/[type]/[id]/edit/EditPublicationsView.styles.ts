import { SxProps, Theme } from '@mui/material';

export const styles = {
  loadingContainer: {
    p: 4
  },
  container: {
    width: '100%',
    bgcolor: 'adminBlue.50'
  },
  header: {
    bgcolor: 'white'
  },
  menuSubheader: {
    height: 26,
    display: 'flex',
    alignItems: 'center'
  },
  draftCaption: {
    color: 'red.600'
  },
  mainContent: {
    minHeight: '100vh',
    bgcolor: 'adminBlue.50',
    p: '16px 32px'
  },
  contentEditor: {
    p: '24px',
    bgcolor: 'white',
    borderRadius: '20px',
    borderColor: 'blue.200',
    '& .bn-editor': {
      maxWidth: '1136px',
      bgcolor: 'white'
    }
  },
  contentDevider: {
    my: '7px'
  }
} satisfies Record<string, SxProps<Theme>>;
