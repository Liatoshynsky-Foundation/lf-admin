export const styles = {
  container: {
    border: '0.5px solid #190D0333',
    background: '#190D030A',
    borderRadius: '16px',
    padding: '20px 24px',
    maxWidth: '400px',
    '& > *:nth-child(n+2):nth-last-child(n+2)': {
      marginBottom: '24px'
    }
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '140%',
    letterSpacing: '0px',
    fontFamily: 'Mulish',
    textAlign: 'center',
    color: '#190D03',
    marginBottom: '11px'
  },
  subtitle: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '160%',
    letterSpacing: '0px',
    fontFamily: 'Mulish',
    marginTop: '0px',
    textAlign: 'center',
    color: '#474D5A'
  },
  textField: {
    backgroundColor: 'transparent',
    width: '100%'
  },
  passwordField: {
    borderRadius: '8px'
  },
  button: {
    width: '100%',
    borderRadius: '999px',
    backgroundColor: '#190D03',
    padding: '14px 32px',
    fontFamily: 'Mulish',
    fontWeight: 600,
    fontStyle: 'normal',
    fontSize: '18px',
    lineHeight: '155%',
    letterSpacing: '0px',
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
    color: '#E53D11',
    textAlign: 'center',
    marginTop: '0px',
    fontSize: '1rem'
  }
};
