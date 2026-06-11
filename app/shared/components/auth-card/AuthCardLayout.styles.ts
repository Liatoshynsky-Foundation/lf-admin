import { SxProps, Theme } from '@mui/material';

export const styles = {
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#F5F6F8'
  },
  container: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 24px',
    maxWidth: '432px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: '100%'
  },
  titleAndSubtitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  title: {
    textAlign: 'center'
  },
  subtitle: {
    fontWeight: 400,
    textAlign: 'center',
    color: 'adminBlue.800'
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  }
} satisfies Record<string, SxProps<Theme>>;
