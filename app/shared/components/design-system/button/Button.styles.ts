export const colors = {
  blue: {
    50: '#F8F8FA',
    100: '#F1F2F7',
    200: '#E6E7ED',
    300: '#DCDDE5',
    400: '#C3C4CE',
    500: '#ADAEBA',
    600: '#989CAB',
    700: '#868A9C',
    800: '#696C7D',
    900: '#4E5061'
  },
  yellow: {
    100: '#FFF8E9',
    200: '#FFEABA',
    300: '#FFE099',
    400: '#FFD26A',
    500: '#FCBD28',
    600: '#E0A01F',
    700: '#BF7D13',
    800: '#8A570C',
    900: '#673E0F'
  },
  brown: {
    50: '#F7F5F1',
    100: '#EDE8DF',
    200: '#D3CAC0',
    300: '#B8AEA2',
    400: '#9F9185',
    500: '#87756B',
    600: '#6E5A51',
    700: '#574139',
    800: '#412B21',
    900: '#2D1611'
  },
  white: '#FDFDFD',
  black: '#190D03',

  primaryFilledHovered: 'rgb(52,41,33)',
  primaryFilled: '#5D554E',
  primaryOutlinedHovered: 'rgba(25, 13, 3, 0.08)',
  primaryOutlinedPressed: 'rgba(25, 13, 3, 0.1)',
  secondaryFilledHovered: 'rgba(184, 174, 162, 0.2)',
  secondaryHovered: '#2B2017',
  secondaryPressed: '#625A53'
};

export const typographyStyles = {
  primary: {
    small: {
      fontFamily: 'Mulish',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '140%'
    },
    medium: {
      fontFamily: 'Mulish',
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '150%'
    },
    large: {
      fontFamily: 'Mulish',
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '155%'
    }
  },
  secondary: {
    small: {
      fontFamily: 'Mulish',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '140%'
    },
    medium: {
      fontFamily: 'Mulish',
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '150%'
    },
    large: {
      fontFamily: 'Mulish',
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '155%'
    }
  },
  tertiary: {
    small: {
      fontFamily: 'Mulish',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '140%'
    },
    medium: {
      fontFamily: 'Mulish',
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '150%'
    },
    large: {
      fontFamily: 'Mulish',
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '155%'
    }
  }
};

const focusVisible = '&.Mui-focusVisible, &:focus-visible';

export const buttonBaseStyles = {
  borderRadius: '28px',
  textTransform: 'none',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  '&:not(:disabled):hover': {
    boxShadow: 'none'
  }
};

export const sizeStyles = {
  small: {
    padding: '4px 12px',
    height: '32px'
  },
  medium: {
    padding: '8px 24px',
    height: '40px'
  },
  large: {
    padding: '14px 32px',
    height: '56px'
  }
};

export const variantStyles = {
  primary: {
    filled: {
      backgroundColor: colors.black,
      color: colors.white,
      '&:hover': {
        backgroundColor: colors.primaryFilledHovered
      },
      [focusVisible]: {
        backgroundColor: colors.black
      },
      '&:active': {
        backgroundColor: colors.black
      },
      '&:disabled': {
        backgroundColor: colors.blue[300],
        color: colors.blue[700]
      }
    },

    outlined: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.black}`,
      color: colors.black,
      '&:hover': {
        backgroundColor: colors.primaryOutlinedHovered
      },
      [focusVisible]: {
        backgroundColor: colors.white
      },
      '&:active': {
        backgroundColor: colors.white
      },
      '&:disabled': {
        border: `1px solid ${colors.blue[700]}`,
        color: colors.blue[700]
      }
    },

    text: {
      backgroundColor: 'transparent',
      color: colors.black,
      '&:hover': {
        backgroundColor: colors.primaryOutlinedHovered
      },
      [focusVisible]: {
        backgroundColor: colors.primaryOutlinedPressed
      },
      '&:active': {
        backgroundColor: colors.white
      },
      '&:disabled': {
        backgroundColor: colors.blue[300],
        color: colors.blue[700]
      }
    }
  },

  secondary: {
    filled: {
      backgroundColor: colors.white,
      color: colors.black,
      '&:hover': {
        boxShadow: `inset 0 0 0 1000px ${colors.secondaryFilledHovered}`
      },
      [focusVisible]: {
        backgroundColor: colors.brown[200]
      },
      '&:active': {
        backgroundColor: colors.brown[200]
      },
      '&:disabled': {
        backgroundColor: colors.blue[300],
        color: colors.blue[700]
      }
    },

    outlined: {
      backgroundColor: 'transparent',
      border: `1px solid ${colors.white}`,
      color: colors.white,
      '&:hover': {
        backgroundColor: colors.secondaryHovered
      },
      [focusVisible]: {
        backgroundColor: colors.secondaryPressed
      },
      '&:active': {
        backgroundColor: colors.secondaryPressed
      },
      '&:disabled': {
        border: `1px solid ${colors.blue[700]}`,
        color: colors.blue[700]
      }
    },

    text: {
      backgroundColor: 'transparent',
      color: colors.white,
      '&:hover': {
        backgroundColor: colors.secondaryHovered
      },
      [focusVisible]: {
        backgroundColor: colors.secondaryPressed
      },
      '&:active': {
        backgroundColor: colors.secondaryPressed
      },
      '&:disabled': {
        color: colors.blue[700]
      }
    }
  },

  tertiary: {
    filled: {
      backgroundColor: colors.yellow[500],
      color: colors.black,
      '&:hover': {
        backgroundColor: colors.black,
        color: colors.white
      },
      [focusVisible]: {
        backgroundColor: colors.black,
        color: colors.white
      },
      '&:active': {
        backgroundColor: colors.black,
        color: colors.white
      },
      '&:disabled': {
        backgroundColor: colors.blue[300],
        color: colors.blue[700]
      }
    }
  }
};
