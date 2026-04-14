import { createTheme } from '@mui/material/styles';

import {
  badgeColors,
  buttonColors,
  buttonGroupColors,
  checkboxColors,
  chipsColors,
  mainHexPallete,
  menuItemColors,
  selectorColors,
  tabsColors,
  textFieldColors,
  toolbarColors
} from './colors';

const fontFamilies = {
  body: 'var(--font-mulish), Arial, sans-serif',
  display: 'var(--font-oswald), Arial, sans-serif'
};

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
    ultra: true;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    displayXl: React.CSSProperties;
    displayLg: React.CSSProperties;
    displayMd: React.CSSProperties;
    bodyLg: React.CSSProperties;
    bodyMd: React.CSSProperties;
    bodySm: React.CSSProperties;
    textMd: React.CSSProperties;
    textSm: React.CSSProperties;

    // Legacy Variants (Backward Compatibility)
    /** @deprecated Use one of the semantic variants instead */
    customBold32: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customMedium22Tight: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customRegular20Tight: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customBold20Tight: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customMedium18Tight: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customMedium18Loose: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customSemiBold18: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customRegular16: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customBold16: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customMedium16: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customItalic16: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customItalic14: React.CSSProperties;
    /** @deprecated Use one of the semantic variants instead */
    customMedium14Tight: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    displayXl?: React.CSSProperties;
    displayLg?: React.CSSProperties;
    displayMd?: React.CSSProperties;
    bodyLg?: React.CSSProperties;
    bodyMd?: React.CSSProperties;
    bodySm?: React.CSSProperties;
    textMd?: React.CSSProperties;
    textSm?: React.CSSProperties;

    // Legacy options
    customBold32?: React.CSSProperties;
    customMedium22Tight?: React.CSSProperties;
    customRegular20Tight?: React.CSSProperties;
    customBold20Tight?: React.CSSProperties;
    customMedium18Tight?: React.CSSProperties;
    customMedium18Loose?: React.CSSProperties;
    customSemiBold18?: React.CSSProperties;
    customRegular16?: React.CSSProperties;
    customBold16?: React.CSSProperties;
    customMedium16?: React.CSSProperties;
    customItalic16?: React.CSSProperties;
    customItalic14?: React.CSSProperties;
    customMedium14Tight?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayXl: true;
    displayLg: true;
    displayMd: true;
    bodyLg: true;
    bodyMd: true;
    bodySm: true;
    textMd: true;
    textSm: true;

    // Legacy overrides for <Typography variant="..." /> component
    customBold32: true;
    customMedium22Tight: true;
    customRegular20Tight: true;
    customBold20Tight: true;
    customMedium18Tight: true;
    customMedium18Loose: true;
    customSemiBold18: true;
    customRegular16: true;
    customBold16: true;
    customMedium16: true;
    customItalic16: true;
    customItalic14: true;
    customMedium14Tight: true;
  }
}

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
  }
}

declare module '@mui/material/ButtonGroup' {
  interface ButtonGroupPropsColorOverrides {
    tertiary: true;
  }
}

export const buttonSizeStyles = {
  small: {
    height: '32px',
    padding: '4px 12px',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.4'
  },
  medium: {
    height: '40px',
    padding: '8px 24px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '1.5'
  },
  large: {
    height: '56px',
    padding: '14px 32px',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: '1.55'
  }
};

const baseTextStyles = {
  fontFamily: fontFamilies.body,
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '1.5'
};

export const createAdminTheme = () =>
  createTheme({
    breakpoints: {
      values: {
        ultra: 1920,
        xxl: 1728,
        xl: 1448,
        lg: 1280,
        md: 1024,
        sm: 768,
        xs: 0
      }
    },

    palette: {
      primary: {
        main: buttonColors.primary.filledEnabledBg,
        contrastText: buttonColors.primary.filledNormalText
      },
      secondary: {
        main: buttonColors.secondary.filledEnabledBg,
        contrastText: buttonColors.secondary.filledNormalText
      },
      tertiary: {
        main: buttonColors.tertiary.enabledBg,
        contrastText: buttonColors.tertiary.normalText
      },
      warning: {
        main: mainHexPallete.yellow[500],
        dark: mainHexPallete.burgundy[700]
      },
      error: {
        main: buttonColors.error.enabledBg,
        contrastText: buttonColors.error.normalText
      },
      text: {
        primary: mainHexPallete.black,
        secondary: mainHexPallete.blue[800],
        disabled: mainHexPallete.blue[200]
      },
      background: {
        default: mainHexPallete.white
      },
      ...mainHexPallete
    },

    typography: {
      fontFamily: fontFamilies.body,
      fontSize: 16,

      displayXl: {
        fontFamily: fontFamilies.display,
        fontSize: '236px',
        fontWeight: 500,
        lineHeight: 1
      },
      displayLg: {
        fontFamily: fontFamilies.display,
        fontSize: '132px',
        fontWeight: 500,
        lineHeight: 1
      },
      displayMd: {
        fontFamily: fontFamilies.display,
        fontSize: '114px',
        fontWeight: 500,
        lineHeight: 1
      },

      h1: {
        fontFamily: fontFamilies.display,
        fontSize: '116px',
        fontWeight: 700,
        letterSpacing: '-2px',
        lineHeight: 1
      },
      h2: {
        fontFamily: fontFamilies.display,
        fontSize: '64px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        '@media (max-width:767px)': {
          fontSize: '40px'
        }
      },
      h3: {
        fontFamily: fontFamilies.display,
        fontSize: '64px',
        fontWeight: 400,
        lineHeight: 1.2
      },
      h4: {
        fontFamily: fontFamilies.body,
        fontSize: '32px',
        fontWeight: 700,
        lineHeight: 1.4
      },
      h5: {
        fontFamily: fontFamilies.display,
        fontSize: '28px',
        fontWeight: 700,
        lineHeight: 1.6
      },
      h6: {
        fontFamily: fontFamilies.body,
        fontSize: '24px',
        fontWeight: 700,
        lineHeight: 1.4
      },

      bodyLg: {
        fontFamily: fontFamilies.body,
        fontSize: '24px',
        fontWeight: 400,
        lineHeight: 1.6
      },
      bodyMd: {
        fontFamily: fontFamilies.body,
        fontSize: '20px',
        fontWeight: 400,
        lineHeight: 1.6
      },
      bodySm: {
        fontFamily: fontFamilies.body,
        fontSize: '18px',
        fontWeight: 400,
        lineHeight: 1.6
      },

      textMd: baseTextStyles,
      textSm: {
        ...baseTextStyles,
        fontSize: '14px',
        letterSpacing: '0.17px',
        lineHeight: 1.3
      },
      caption: {
        fontFamily: fontFamilies.body,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 1.4
      },

      // Legacy Variants
      customBold32: {
        fontFamily: fontFamilies.body,
        fontWeight: 700,
        fontSize: '32px',
        lineHeight: '140%',
        letterSpacing: '0px'
      },
      customMedium22Tight: {
        fontFamily: fontFamilies.body,
        fontWeight: 500,
        fontSize: '22px',
        lineHeight: '135%'
      },
      customRegular20Tight: {
        fontFamily: fontFamilies.body,
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '140%'
      },
      customBold20Tight: {
        fontFamily: fontFamilies.body,
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '140%'
      },
      customMedium18Tight: {
        fontFamily: fontFamilies.body,
        fontWeight: 500,
        fontSize: '18px',
        lineHeight: '135%'
      },
      customMedium18Loose: {
        fontFamily: fontFamilies.body,
        fontWeight: 500,
        fontSize: '18px',
        lineHeight: '155%'
      },
      customSemiBold18: {
        fontFamily: fontFamilies.body,
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '155%'
      },
      customBold16: {
        fontFamily: fontFamilies.body,
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '100%'
      },
      customRegular16: {
        fontFamily: fontFamilies.body,
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '150%'
      },
      customMedium16: {
        fontFamily: fontFamilies.body,
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: '150%'
      },
      customItalic16: {
        fontFamily: fontFamilies.body,
        fontStyle: 'italic',
        fontSize: '16px',
        lineHeight: '140%'
      },
      customItalic14: {
        fontFamily: fontFamilies.body,
        fontStyle: 'italic',
        fontSize: '14px',
        lineHeight: '140%'
      },
      customMedium14Tight: {
        fontFamily: fontFamilies.body,
        fontWeight: '500',
        fontSize: '14px',
        lineHeight: '130%'
      }
    },

    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            displayXl: 'h2',
            displayLg: 'h2',
            displayMd: 'h2',
            bodyLg: 'p',
            bodyMd: 'p',
            bodySm: 'p',
            textMd: 'p',
            textSm: 'p',

            //Legacy variants
            customBold32: 'p',
            customMedium22Tight: 'p',
            customRegular20Tight: 'p',
            customBold20Tight: 'p',
            customMedium18Tight: 'p',
            customMedium18Loose: 'p',
            customSemiBold18: 'p',
            customRegular16: 'p',
            customBold16: 'p',
            customMedium16: 'p',
            customItalic16: 'p',
            customItalic14: 'p'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '28px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none'
            },
            whiteSpace: 'nowrap',
            fontFamily: fontFamilies.body
          }
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              backgroundColor: buttonColors.primary.filledEnabledBg,
              color: buttonColors.primary.filledNormalText,
              '&:hover': {
                backgroundColor: buttonColors.primary.filledHoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.primary.filledFocusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.primary.filledPressedBg
              },
              '&:disabled': {
                backgroundColor: buttonColors.primary.filledDisabledBg,
                color: buttonColors.primary.disabledText
              }
            }
          },
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              backgroundColor: buttonColors.primary.outlinedEnabledBg,
              border: `1px solid ${buttonColors.primary.outlinedNormalBorder}`,
              color: buttonColors.primary.outlinedNormalText,
              '&:hover': {
                backgroundColor: buttonColors.primary.outlinedHoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.primary.outlinedFocusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.primary.outlinedPressedBg
              },
              '&:disabled': {
                border: `1px solid ${buttonColors.primary.outlinedDisabledBorder}`,
                color: buttonColors.primary.disabledText
              }
            }
          },
          {
            props: { variant: 'text', color: 'primary' },
            style: {
              backgroundColor: 'transparent',
              color: mainHexPallete.black,
              '&:hover': {
                backgroundColor: buttonColors.primary.outlinedHoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.primary.outlinedFocusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.primary.outlinedPressedBg
              },
              '&:disabled': {
                backgroundColor: 'transparent',
                color: buttonColors.primary.disabledText
              }
            }
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: {
              backgroundColor: buttonColors.secondary.filledEnabledBg,
              color: buttonColors.secondary.filledNormalText,
              '&:hover': {
                backgroundColor: buttonColors.secondary.filledHoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.secondary.filledFocusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.secondary.filledPressedBg
              },
              '&:disabled': {
                backgroundColor: buttonColors.secondary.filledDisabledBg,
                color: buttonColors.secondary.disabledText
              }
            }
          },
          {
            props: { variant: 'outlined', color: 'secondary' },
            style: {
              backgroundColor: buttonColors.secondary.outlinedEnabledBg,
              border: `1px solid ${buttonColors.secondary.outlinedNormalBorder}`,
              color: buttonColors.secondary.outlinedNormalText,
              '&:hover': {
                backgroundColor: buttonColors.secondary.outlinedHoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.secondary.outlinedFocusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.secondary.outlinedPressedBg
              },
              '&:disabled': {
                backgroundColor: buttonColors.secondary.outlinedDisabledBg,
                border: `1px solid ${buttonColors.secondary.outlinedDisabledBorder}`,
                color: buttonColors.secondary.disabledText
              }
            }
          },
          {
            props: { variant: 'text', color: 'secondary' },
            style: {
              backgroundColor: 'transparent',
              color: mainHexPallete.white,
              '&:hover': {
                backgroundColor: buttonColors.secondary.outlinedHoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.secondary.outlinedFocusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.secondary.outlinedPressedBg
              },
              '&:disabled': {
                backgroundColor: 'transparent',
                color: buttonColors.secondary.disabledText
              }
            }
          },
          {
            props: { variant: 'contained', color: 'tertiary' },
            style: {
              backgroundColor: buttonColors.tertiary.enabledBg,
              color: buttonColors.tertiary.normalText,
              '&:hover': {
                backgroundColor: buttonColors.tertiary.hoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.tertiary.focusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.tertiary.pressedBg
              },
              '&:disabled': {
                backgroundColor: buttonColors.tertiary.disabledBg,
                color: buttonColors.tertiary.disabledText
              }
            }
          },
          {
            props: { variant: 'contained', color: 'error' },
            style: {
              backgroundColor: buttonColors.error.enabledBg,
              color: buttonColors.error.normalText,
              '&:hover': {
                backgroundColor: buttonColors.error.hoveredBg
              },
              '&:focus-visible': {
                backgroundColor: buttonColors.error.focusedBg
              },
              '&:active': {
                backgroundColor: buttonColors.error.pressedBg
              },
              '&:disabled': {
                backgroundColor: buttonColors.error.disabledBg,
                color: buttonColors.error.disabledText
              }
            }
          },
          {
            props: { size: 'small' },
            style: buttonSizeStyles.small
          },
          {
            props: { size: 'medium' },
            style: buttonSizeStyles.medium
          },
          {
            props: { size: 'large' },
            style: buttonSizeStyles.large
          }
        ]
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            height: '48px',
            ...baseTextStyles,

            '& .MuiInputBase-input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px white inset',
              WebkitTextFillColor: textFieldColors.outline.defaultValue,
              caretColor: textFieldColors.outline.defaultValue,
              transition: 'background-color 5000s ease-in-out 0s'
            },

            '&.Mui-disabled .MuiInputBase-input': {
              color: textFieldColors.outline.disabledValue,
              WebkitTextFillColor: textFieldColors.outline.disabledValue
            }
          }
        }
      },
      MuiInput: {
        styleOverrides: {
          root: {
            color: textFieldColors.standard.defaultValue,

            '&:before': {
              borderBottom: `1px solid ${textFieldColors.standard.defaultUnderline}`
            },
            '&:hover:not(.Mui-disabled):before': {
              borderBottom: `1px solid ${textFieldColors.standard.hoveredUnderline}`
            },
            '&.Mui-focused:after': {
              borderBottom: `2px solid ${textFieldColors.standard.focusedUnderline}`
            },
            '&.Mui-error:before, &.Mui-error:after': {
              borderBottom: `2px solid ${textFieldColors.standard.errorUnderline}`
            },
            '&.Mui-error:hover:not(.Mui-disabled):before': {
              borderBottom: `2px solid ${textFieldColors.standard.errorUnderline}`
            },
            '&.Mui-disabled:before': {
              borderBottom: `1px solid ${textFieldColors.standard.disabledUnderline}`,
              borderBottomStyle: 'solid'
            }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '0 16px',
            color: textFieldColors.outline.defaultValue,

            '& .MuiOutlinedInput-input': {
              padding: 0
            },

            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: textFieldColors.outline.defaultOutline
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: textFieldColors.outline.hoveredOutline
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: textFieldColors.outline.focusedOutline,
              borderWidth: '1px'
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: textFieldColors.outline.errorOutline
            },
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: textFieldColors.outline.disabledOutline
            },

            '&.Mui-focused .MuiInputBase-input': {
              color: textFieldColors.outline.focusedValue,
              WebkitTextFillColor: textFieldColors.outline.focusedValue
            },
            '&.Mui-error .MuiInputBase-input': {
              color: textFieldColors.outline.errorValue,
              WebkitTextFillColor: textFieldColors.outline.errorValue
            }
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            ...baseTextStyles,
            color: textFieldColors.outline.defaultLabel,

            '&:not(.Mui-disabled):hover': {
              color: textFieldColors.outline.hoveredLabel
            },
            '&.Mui-focused': {
              color: textFieldColors.outline.focusedLabel
            },
            '&.Mui-error': {
              color: textFieldColors.outline.errorLabel
            },
            '&.Mui-disabled': {
              color: textFieldColors.outline.disabledLabel
            }
          }
        }
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            margin: '4px 0 0',
            fontSize: '14px',
            fontFamily: baseTextStyles.fontFamily,

            color: textFieldColors.outline.defaultTextInfo,

            '&.Mui-error': {
              color: textFieldColors.outline.errorTextInfo
            },
            '&.Mui-disabled': {
              color: textFieldColors.outline.disabledTextInfo
            }
          }
        }
      },
      MuiButtonGroup: {
        styleOverrides: {
          root: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            padding: '2px',
            fontFamily: fontFamilies.body,
            position: 'relative',
            overflow: 'hidden',
            width: 'fit-content',
            border: 'none',
            lineHeight: '1.5',

            '& .MuiButtonGroup-grouped': {
              border: 'none',
              borderRadius: '9999px',
              minWidth: 'auto',
              padding: '4px 22px',
              '&:not(:last-of-type)': {
                borderRight: 'none'
              }
            }
          }
        },
        variants: [
          {
            props: { color: 'primary' },
            style: {
              backgroundColor: buttonGroupColors.primary.groupBackground,

              '& .MuiButtonGroup-grouped': {
                color: buttonGroupColors.primary.buttonText
              },

              '& .MuiButtonGroup-grouped.MuiButton-contained': {
                backgroundColor: buttonGroupColors.primary.selectedButton,
                color: buttonGroupColors.primary.selectedButtonText,
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: buttonGroupColors.primary.selectedButton,
                  boxShadow: 'none'
                }
              }
            }
          },
          {
            props: { color: 'secondary' },
            style: {
              backgroundColor: buttonGroupColors.secondary.groupBackground,

              '& .MuiButtonGroup-grouped': {
                color: buttonGroupColors.secondary.buttonText
              },

              '& .MuiButtonGroup-grouped.MuiButton-contained': {
                backgroundColor: buttonGroupColors.secondary.selectedButton,
                color: buttonGroupColors.secondary.selectedButtonText,
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: buttonGroupColors.secondary.selectedButton,
                  boxShadow: 'none'
                }
              }
            }
          },
          {
            props: { color: 'tertiary' },
            style: {
              backgroundColor: buttonGroupColors.tertiary.groupBackground,

              '& .MuiButtonGroup-grouped': {
                color: buttonGroupColors.tertiary.buttonText
              },

              '& .MuiButtonGroup-grouped.MuiButton-contained': {
                backgroundColor: buttonGroupColors.tertiary.selectedButton,
                color: buttonGroupColors.tertiary.selectedButtonText,
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: buttonGroupColors.tertiary.selectedButton,
                  boxShadow: 'none'
                }
              }
            }
          }
        ]
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            marginTop: '4px',
            borderRadius: '8px',
            boxShadow: `
            0px 4px 8px rgba(0, 0, 0, 0.06),
            0px 0px 4px rgba(0, 0, 0, 0.04)
          `
          }
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            ...baseTextStyles,
            gap: '4px',

            color: menuItemColors.defaultText,

            '&.Mui-disabled': {
              color: menuItemColors.disabledText,
              backgroundColor: 'transparent',
              pointerEvents: 'none'
            },

            '&:hover': {
              backgroundColor: menuItemColors.hoveredBg
            },

            '&:active': {
              backgroundColor: menuItemColors.activeBg
            },

            '&.Mui-selected': {
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: menuItemColors.hoveredBg
              }
            }
          }
        }
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: checkboxColors.defaultIcon,

            '&:hover': {
              backgroundColor: checkboxColors.hoveredRipple,

              '&:not(.Mui-checked)': {
                color: checkboxColors.hoveredIcon
              }
            },

            '&.Mui-focusVisible': {
              backgroundColor: checkboxColors.focusedRipple,
              color: checkboxColors.focusedIcon
            },

            '&.Mui-checked': {
              color: checkboxColors.selectedIcon,

              '&:hover': {
                backgroundColor: checkboxColors.hoveredRipple
              }
            },

            '&.Mui-disabled': {
              color: checkboxColors.disabledIcon
            }
          }
        }
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: '12px',
            fontWeight: 500
          }
        },
        variants: [
          {
            props: { color: 'default', variant: 'standard' },
            style: {
              '& .MuiBadge-badge': {
                backgroundColor: 'transparent',
                color: badgeColors.standardDefaultValue
              }
            }
          },
          {
            props: { color: 'primary', variant: 'standard' },
            style: {
              '& .MuiBadge-badge': {
                backgroundColor: badgeColors.standardPrimaryBg,
                color: badgeColors.standardPrimaryValue
              }
            }
          },
          {
            props: { color: 'primary', variant: 'dot' },
            style: {
              '& .MuiBadge-badge': {
                backgroundColor: badgeColors.dotPrimaryBg
              }
            }
          },
          {
            props: { color: 'secondary', variant: 'standard' },
            style: {
              '& .MuiBadge-badge': {
                backgroundColor: 'transparent',
                color: badgeColors.standardSecondaryValue
              }
            }
          },
          {
            props: { color: 'error', variant: 'standard' },
            style: {
              '& .MuiBadge-badge': {
                backgroundColor: badgeColors.standardErrorBg,
                color: badgeColors.standardErrorValue
              }
            }
          },
          {
            props: { color: 'error', variant: 'dot' },
            style: {
              '& .MuiBadge-badge': {
                backgroundColor: badgeColors.dotErrorBg
              }
            }
          }
        ]
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...baseTextStyles,
            color: chipsColors.normalText,
            borderRadius: '20px'
          },

          deleteIcon: {
            color: 'inherit',
            '&:hover': {
              color: 'inherit',
              opacity: 0.7
            }
          }
        },
        variants: [
          {
            props: { variant: 'filled' },
            style: {
              backgroundColor: chipsColors.filledDefaultBg,
              border: 'none',

              '&:hover': {
                backgroundColor: chipsColors.filledHoveredBg
              },
              '&:active': {
                backgroundColor: chipsColors.filledPressedBg
              },
              '&.Mui-disabled': {
                backgroundColor: chipsColors.filledDisabledBg,
                opacity: 1
              }
            }
          },
          {
            props: { variant: 'outlined' },
            style: {
              backgroundColor: 'transparent',
              border: `1px solid ${chipsColors.outlineNormalBorder}`,

              '&:hover': {
                backgroundColor: chipsColors.outlineHoveredBg
              },
              '&:active': {
                backgroundColor: chipsColors.outlinePressedBg
              },
              '&.Mui-disabled': {
                borderColor: chipsColors.outlineDisabledBorder,
                color: chipsColors.outlineDisabledText,
                opacity: 1
              }
            }
          }
        ]
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: toolbarColors.default,
            borderRadius: '4px',
            border: `1px solid ${toolbarColors.border}`,

            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              borderRadius: 0,

              '&:not(:first-of-type)': {
                borderLeft: `1px solid ${toolbarColors.border}`
              },

              '&:first-of-type': {
                borderTopLeftRadius: 'inherit',
                borderBottomLeftRadius: 'inherit'
              },
              '&:last-of-type': {
                borderTopRightRadius: 'inherit',
                borderBottomRightRadius: 'inherit'
              }
            }
          }
        }
      },

      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: toolbarColors.textColor,

            '&:hover': {
              backgroundColor: toolbarColors.hovered
            },
            '&.Mui-selected': {
              backgroundColor: toolbarColors.focused,
              color: 'inherit',
              '&:hover': {
                backgroundColor: toolbarColors.focused
              }
            }
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            color: selectorColors.standardTextColor
          }
        },
        variants: [
          {
            props: { variant: 'filled' },
            style: {
              backgroundColor: selectorColors.filledBg,
              borderRadius: '8px',
              '&:before, &:after': { display: 'none' },

              '& .MuiChip-root': {
                backgroundColor: selectorColors.filledChipsBg,
                color: selectorColors.filledChipsContent
              }
            }
          },
          {
            props: { variant: 'outlined' },
            style: {
              '& .MuiChip-root': {
                backgroundColor: selectorColors.outlineDefaultChipsBg,
                color: selectorColors.outlineDefaultTextColor,

                '& .MuiChip-deleteIcon': {
                  color: selectorColors.outlineDefaultTextColor
                }
              }
            }
          }
        ]
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: '40px',
            borderBottom: `1px solid ${tabsColors.baseUnderline}`
          },
          indicator: {
            backgroundColor: tabsColors.active,
            height: '2px'
          }
        }
      },
      MuiTab: {
        defaultProps: {
          disableRipple: true
        },
        styleOverrides: {
          root: {
            ...baseTextStyles,
            textTransform: 'none',
            minHeight: '40px',
            padding: '6px 28px 14px',
            fontWeight: 600,
            minWidth: '80px',
            color: tabsColors.unactive,

            '&.Mui-selected': {
              color: tabsColors.active,
              fontWeight: 600
            },
            '&.Mui-disabled': {
              color: tabsColors.disabled
            }
          }
        }
      }
    }
  });

export const adminTheme = createAdminTheme();

export type AdminTheme = ReturnType<typeof createAdminTheme>;
