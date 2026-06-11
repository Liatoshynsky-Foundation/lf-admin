import { mainHexPalette } from '~/shared/theme/colors';

export const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  inputsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  buttonSubmit: {
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
  passwordHintText: {
    fontSize: '12px',
    color: '#666'
  },
  passwordHintContainer: {
    mt: -1,
    mb: 2
  }
};
