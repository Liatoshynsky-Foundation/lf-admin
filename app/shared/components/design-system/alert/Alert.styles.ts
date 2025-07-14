import { AlertColor } from '@mui/material/Alert';

const alertColors = {
  errorMain: 'rgba(205, 54, 54, 1)',
  errorLight: 'rgba(250, 238, 238, 1)',
  errorDark: 'rgba(82, 22, 22, 1)',
  error: 'rgba(230, 60, 20, 1)',
  warningMain: 'rgba(227, 178, 28, 1)',
  warningLight: 'rgba(249, 240, 210, 1)',
  warningDark: 'rgba(91, 71, 11, 1)',
  warning: 'rgba(181, 133, 23, 1)',
  infoMain: 'rgba(51, 161, 216, 1)',
  infoLight: 'rgba(214, 236, 247, 1)',
  infoDark: 'rgba(20, 64, 86, 1)',
  successMain: 'rgba(87, 154, 64, 1)',
  successLight: 'rgba(226, 242, 220, 1)',
  successDark: 'rgba(44, 77, 32, 1)',
  white: 'rgba(254, 254, 254, 1)',
  textDark: 'rgba(25, 13, 3, 1)',
  shadow: 'rgba(0, 0, 0, 0.08)'
};

export const styles = {
  alert: {
    position: 'relative',
    fontSize: '18px',
    lineHeight: '135%',
    fontFamily: 'Mulish',
    borderWidth: 1,
    borderRadius: '12px',
    boxShadow: `0 1px 3px ${alertColors.shadow}`,
    minWidth: '320px'
  },

  colorSchemes: {
    error: {
      border: alertColors.errorMain,
      filled: {
        color: alertColors.white,
        backgroundColor: alertColors.errorMain
      },
      outlined: {
        color: alertColors.errorDark,
        backgroundColor: alertColors.errorLight
      }
    },
    warning: {
      border: alertColors.warningMain,
      filled: {
        color: alertColors.white,
        backgroundColor: alertColors.warningMain
      },
      outlined: {
        color: alertColors.warningDark,
        backgroundColor: alertColors.warningLight
      }
    },
    info: {
      border: alertColors.infoMain,
      filled: {
        color: alertColors.white,
        backgroundColor: alertColors.infoMain
      },
      outlined: {
        color: alertColors.infoDark,
        backgroundColor: alertColors.infoLight
      }
    },
    success: {
      border: alertColors.successMain,
      filled: {
        color: alertColors.white,
        backgroundColor: alertColors.successMain
      },
      outlined: {
        color: alertColors.successDark,
        backgroundColor: alertColors.successLight
      }
    }
  },

  getColorStyles: (severity: AlertColor, variant: 'filled' | 'outlined') => {
    const scheme = styles.colorSchemes[severity];

    return {
      borderColor: scheme.border,
      ...scheme[variant]
    };
  },

  getIconColor: (severity: AlertColor, variant: 'filled' | 'outlined') => {
    if (variant === 'filled') {
      return alertColors.white;
    }
    const outlinedIconColors = {
      error: alertColors.error,
      warning: alertColors.warning,
      info: alertColors.infoDark,
      success: alertColors.successDark
    };

    return outlinedIconColors[severity];
  },

  icon: (severity: AlertColor, variant: 'filled' | 'outlined') => ({
    margin: '2px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    color: styles.getIconColor(severity, variant),

    '& svg': {
      width: '26px',
      height: '26px'
    }
  }),

  title: {
    fontFamily: 'Mulish',
    fontWeight: 500,
    fontSize: '22px',
    lineHeight: '135%',
    margin: 0,
    marginBottom: '4px'
  },

  description: {
    fontFamily: 'Mulish',
    margin: 0,
    fontSize: '16px',
    lineHeight: '150%'
  },

  closeButton: (variant: 'filled' | 'outlined') => ({
    background: 'transparent',
    fontFamily: 'Mulish',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '140%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    alignSelf: 'flex-start',
    marginTop: '2px',
    color: variant === 'outlined' ? alertColors.textDark : alertColors.white,

    '& span': {
      margin: '0 12px 0 0'
    },

    '& svg': {
      width: '20px',
      height: '20px'
    }
  }),

  action: {
    padding: 0,
    marginTop: '6px',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexShrink: 0
  }
};
