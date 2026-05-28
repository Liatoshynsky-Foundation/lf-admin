import { alpha } from '@mui/material';

import { mainHexPalette as colors } from '~/shared/theme/colors';

export const styles = {
  container: {
    border: '0.5px solid',
    borderColor: alpha(colors.black, 0.2),
    background: 'blue.100',
    borderRadius: '16px',
    padding: '20px 24px',
    maxWidth: '400px',
    '& > *:nth-child(n+2):nth-last-child(n+2)': {
      marginBottom: '24px'
    }
  },
  title: {
    textAlign: 'center',
    marginBottom: '11px'
  },
  subtitle: {
    fontWeight: 400,
    marginTop: '0px',
    textAlign: 'center',
    color: 'adminBlue.800'
  },
  button: {
    fontWeight: 600,
    textTransform: 'none'
  },
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: 'calc(100vh - 120px)',
    width: '100%'
  },
  errorText: {
    color: 'error.main',
    textAlign: 'center',
    marginTop: '0px'
  }
};
