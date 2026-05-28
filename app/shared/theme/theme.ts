import { createTheme } from '@mui/material/styles';

import {
  accordionColors,
  alertColors,
  badgeColors,
  buttonColors,
  buttonGroupColors,
  checkboxColors,
  chipsColors,
  mainHexPalette,
  menuItemColors,
  selectorColors,
  tabsColors,
  textFieldColors,
  toolbarColors,
  tooltipColors
} from './colors';

export const fontFamilies = {
  body: 'var(--font-mulish), Arial, sans-serif',
  display: 'var(--font-oswald), Arial, sans-serif'
};

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    discardChangesModal: true;
  }
}

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
    h7: React.CSSProperties;
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
    h7?: React.CSSProperties;
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
    h7: true;
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
    lineHeight: 1.4
  },
  medium: {
    height: '40px',
    padding: '8px 24px',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.5
  },
  large: {
    height: '56px',
    padding: '14px 32px',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.55
  }
};

export const baseTextStyles = {
  fontFamily: fontFamilies.body,
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.5
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
        main: mainHexPalette.yellow[500],
        dark: mainHexPalette.burgundy[700]
      },
      error: {
        main: buttonColors.error.enabledBg,
        contrastText: buttonColors.error.normalText
      },
      text: {
        primary: mainHexPalette.black,
        secondary: mainHexPalette.blue[800],
        disabled: mainHexPalette.blue[200]
      },
      background: {
        default: mainHexPalette.white
      },
      ...mainHexPalette
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
      h7: {
        fontFamily: fontFamilies.body,
        fontSize: '20px',
        fontStyle: 'bold',
        fontWeight: 700,
        lineHeight: 1.4
      },

      subtitle1: {
        fontFamily: fontFamilies.body,
        fontSize: '18px',
        fontWeight: 500,
        lineHeight: 1.75
      },

      subtitle2: {
        fontFamily: fontFamilies.body,
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: 1.3
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
            textSm: 'p'
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
            fontFamily: fontFamilies.body,
            gap: '8px'
          },
          startIcon: {
            margin: 0
          },
          endIcon: {
            margin: 0
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
              color: mainHexPalette.black,
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
              color: mainHexPalette.white,
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
            lineHeight: 1.5,

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
            fontFamily: fontFamilies.body,
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.3,
            letterSpacing: 0.17,
            color: chipsColors.normalText,
            borderRadius: '20px'
          },

          sizeSmall: {
            height: 'auto',
            padding: '6px 8px',

            '& .MuiChip-label': {
              padding: 0
            },

            '& .MuiChip-icon': {
              margin: 0,
              marginRight: '4px'
            }
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
                backgroundColor: chipsColors.filledHoveredBg,
                color: chipsColors.normalText
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
            '&:hover': {
              color: tabsColors.hovered
            },
            '&:active': {
              color: tabsColors.pressed
            },

            '&.Mui-selected': {
              color: tabsColors.active,
              fontWeight: 600
            },
            '&.Mui-disabled': {
              color: tabsColors.disabled
            }
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            position: 'relative',
            fontSize: '18px',
            fontFamily: fontFamilies.body,
            lineHeight: 1.5,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderRadius: '12px',
            boxShadow: `0 1px 3px ${alertColors.shadow}`,
            minWidth: '320px'
          },
          message: {
            padding: 0,
            margin: 0,
            ...baseTextStyles,
            fontWeight: 400
          },
          icon: {
            margin: '2px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            '& svg': {
              width: '26px',
              height: '26px'
            }
          },
          action: {
            padding: 0,
            marginTop: '6px',
            alignItems: 'flex-start',
            alignSelf: 'flex-start',
            flexShrink: 0
          }
        },
        variants: [
          {
            props: { severity: 'error', variant: 'filled' },
            style: {
              backgroundColor: alertColors.filled.errorBg,
              color: alertColors.filled.errorText,
              '& .MuiAlert-icon': {
                color: alertColors.filled.errorIcon
              }
            }
          },
          {
            props: { severity: 'warning', variant: 'filled' },
            style: {
              backgroundColor: alertColors.filled.warningBg,
              color: alertColors.filled.warningText,
              '& .MuiAlert-icon': {
                color: alertColors.filled.warningIcon
              }
            }
          },
          {
            props: { severity: 'info', variant: 'filled' },
            style: {
              backgroundColor: alertColors.filled.infoBg,
              color: alertColors.filled.infoText,
              '& .MuiAlert-icon': {
                color: alertColors.filled.infoIcon
              }
            }
          },
          {
            props: { severity: 'success', variant: 'filled' },
            style: {
              backgroundColor: alertColors.filled.successBg,
              color: alertColors.filled.successText,
              '& .MuiAlert-icon': {
                color: alertColors.filled.successIcon
              }
            }
          },
          {
            props: { severity: 'error', variant: 'outlined' },
            style: {
              backgroundColor: alertColors.outlined.errorBg,
              color: alertColors.outlined.errorText,
              borderColor: alertColors.outlined.errorBorder,
              '& .MuiAlert-icon': {
                color: alertColors.outlined.errorIcon
              }
            }
          },
          {
            props: { severity: 'warning', variant: 'outlined' },
            style: {
              backgroundColor: alertColors.outlined.warningBg,
              color: alertColors.outlined.warningText,
              borderColor: alertColors.outlined.warningBorder,
              '& .MuiAlert-icon': {
                color: alertColors.outlined.warningIcon
              }
            }
          },
          {
            props: { severity: 'info', variant: 'outlined' },
            style: {
              backgroundColor: alertColors.outlined.infoBg,
              color: alertColors.outlined.infoText,
              borderColor: alertColors.outlined.infoBorder,
              '& .MuiAlert-icon': {
                color: alertColors.outlined.infoIcon
              }
            }
          },
          {
            props: { severity: 'success', variant: 'outlined' },
            style: {
              backgroundColor: alertColors.outlined.successBg,
              color: alertColors.outlined.successText,
              borderColor: alertColors.outlined.successBorder,
              '& .MuiAlert-icon': {
                color: alertColors.outlined.successIcon
              }
            }
          }
        ]
      },
      MuiAlertTitle: {
        styleOverrides: {
          root: {
            ...baseTextStyles,
            fontSize: '18px',
            margin: 0,
            marginBottom: '4px'
          }
        }
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: accordionColors.defaultBg,
            border: `1px solid ${accordionColors.defaultBorder}`,
            boxShadow: 'none',
            borderRadius: '20px',

            '&::before': {
              display: 'none'
            },

            '&.Mui-expanded': {
              margin: 0
            },

            '&:first-of-type': {
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            },
            '&:last-of-type': {
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px'
            }
          }
        }
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            padding: '0 24px',
            minHeight: '64px',

            '& .MuiAccordionSummary-content': {
              fontFamily: fontFamilies.body,
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: 1.2,
              verticalAlign: 'middle'
            }
          },
          expandIconWrapper: {
            color: accordionColors.defaultIcon
          }
        }
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: '0 24px 24px'
          }
        }
      },
      MuiModal: {
        styleOverrides: {
          root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }
      },
      MuiPaper: {
        variants: [
          {
            props: { variant: 'discardChangesModal' },
            style: {
              maxWidth: '630px',
              maxHeight: '280px',
              padding: '40px 64px',
              borderRadius: '32px',
              backgroundColor: mainHexPalette.white,
              overflowY: 'auto',
              outline: 'none'
            }
          }
        ]
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            ...theme.typography.caption,

            backgroundColor: tooltipColors.defaultBg,
            color: tooltipColors.defaultText,
            fontStyle: 'italic',
            textAlign: 'center',
            borderRadius: '20px',
            padding: '4px 16px',
            boxShadow: `0px 4px 4px 0px ${tooltipColors.defaultShadow}`
          }),

          arrow: {
            color: tooltipColors.defaultBg
          }
        }
      }
    }
  });

export const adminTheme = createAdminTheme();

export type AdminTheme = ReturnType<typeof createAdminTheme>;
