import { mainHexPalette } from '~/shared/theme/colors';

export const styles = {
  inputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    marginTop: '32px'
  },
  buttonLogin: {
    background: mainHexPalette.yellow[500],
    color: '#1A1A1A',
    fontWeight: 600,
    padding: '8px 24px',
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: mainHexPalette.yellow[600],
      boxShadow: 'none'
    }
  },
  buttonReset: {
    color: '#1A1A1A',
    fontWeight: 600,
    textTransform: 'none',
    padding: '8px 24px',
    borderColor: '#1A1A1A',
    '&:hover': {
      borderColor: '#A9A9A9',
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  }
};
