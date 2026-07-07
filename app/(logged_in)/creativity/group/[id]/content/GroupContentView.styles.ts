import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    bgcolor: 'adminBlue.50'
  },
  header: {
    bgcolor: 'white'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    p: '32px 28px'
  },
  optionalContentText: {
    color: 'adminBlue.800',
    fontStyle: 'italic'
  },
  navigationMenuPaper: {
    mt: '8px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    border: '1px solid',
    borderColor: 'blue.200'
  },
  menuSubheader: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    bgcolor: 'transparent'
  },
  menuItemLanguage: {
    minWidth: 160,
    py: '10px',
    px: '16px'
  },
  publishMenuPaper: {
    mt: '8px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    border: '1px solid',
    borderColor: 'blue.200',
    minWidth: 220
  },
  publishMenuItem: {
    py: '10px',
    px: '16px'
  },
  infoDialogPaper: {
    borderRadius: '12px',
    p: 1
  },
  infoDialogTitle: {
    fontWeight: 600
  },
  infoDialogActions: {
    px: 3,
    pb: 2
  },
  infoDialogButton: {
    borderRadius: '8px'
  }
} satisfies Record<string, SxProps<Theme>>;
