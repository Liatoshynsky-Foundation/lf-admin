export const mainHexPallete = {
  white: '#FCFCFC',
  black: '#190d03',
  blue: {
    50: '#F9FAFB',
    100: '#F0F2FB',
    200: '#D9DCE8',
    300: '#C6C8D3',
    400: '#B2B3BE',
    500: '#9D9FA9',
    600: '#898C95',
    700: '#63666E',
    800: '#52545A',
    900: '#3F444A'
  },
  adminBlue: {
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
  red: {
    50: '#FCF0ED',
    100: '#FAE2DC',
    200: '#F7C3B6',
    300: '#F4A593',
    400: '#F7856A',
    500: '#eb6343',
    600: '#d13712',
    700: '#A32B0E',
    800: '#7F210B',
    900: '#611908'
  },
  burgundy: {
    50: '#F9F3F3',
    100: '#E6D4D3',
    200: '#D4B8B4',
    300: '#C19C96',
    400: '#AE7F79',
    500: '#9B655E',
    600: '#874943',
    700: '#732E28',
    800: '#600e0f',
    900: '#3d0607'
  },
  green: {
    100: '#E2F2DC',
    600: '#579A40',
    800: '#2C4D20'
  }
};

const sharedTokens = {
  error: 'rgba(230, 60, 20, 1)',
  ripple: 'rgba(239, 233, 224, 0.4)',
  primaryBadge: 'rgba(95, 14, 15, 1)'
};

const sharedButtonDisabled = {
  filledDisabledBg: mainHexPallete.blue[200],
  outlinedDisabledBg: 'transparent',
  outlinedDisabledBorder: mainHexPallete.blue[700],
  disabledText: mainHexPallete.blue[700]
};

const sharedInputErrorBase = {
  errorValue: mainHexPallete.black
};

const standardInputError = {
  ...sharedInputErrorBase,
  errorFirstIcon: sharedTokens.error,
  errorSecondIcon: sharedTokens.error,
  errorUnderline: sharedTokens.error
};

const outlineInputError = {
  ...sharedInputErrorBase,
  errorLabel: sharedTokens.error,
  errorIcon: sharedTokens.error,
  errorOutline: sharedTokens.error,
  errorTextInfo: sharedTokens.error,
  errorTextInfoIcon: sharedTokens.error
};

export const badgeColors = {
  standardDefaultValue: 'rgba(0, 0, 0, 0.56)',
  standardPrimaryValue: mainHexPallete.white,
  standardPrimaryBg: sharedTokens.primaryBadge,
  standardSecondaryValue: mainHexPallete.black,
  standardErrorBg: 'rgba(230, 60, 20, 1)',
  standardErrorValue: mainHexPallete.white,

  dotPrimaryBg: sharedTokens.primaryBadge,
  dotErrorBg: 'rgba(230, 60, 20, 1)'
};

export const buttonColors = {
  primary: {
    ...sharedButtonDisabled,
    filledEnabledBg: mainHexPallete.black,
    filledNormalText: mainHexPallete.white,
    filledHoveredBg: 'rgb(52, 42, 33)',
    filledFocusedBg: 'rgb(93, 85, 78)',
    filledPressedBg: 'rgb(93, 85, 78)',

    outlinedEnabledBg: 'transparent',
    outlinedNormalText: mainHexPallete.black,
    outlinedNormalBorder: mainHexPallete.black,
    outlinedHoveredBg: 'rgba(25, 13, 3, 0.04)',
    outlinedFocusedBg: 'rgba(25, 13, 3, 0.1)',
    outlinedPressedBg: 'rgba(25, 13, 3, 0.1)'
  },

  secondary: {
    ...sharedButtonDisabled,
    filledEnabledBg: mainHexPallete.white,
    filledNormalText: mainHexPallete.black,
    filledHoveredBg: 'rgb(238, 236, 234)',
    filledFocusedBg: 'rgb(211, 205, 198)',
    filledPressedBg: 'rgb(218, 213, 207)',

    outlinedEnabledBg: 'transparent',
    outlinedNormalText: mainHexPallete.white,
    outlinedNormalBorder: mainHexPallete.white,
    outlinedHoveredBg: 'rgba(252, 252, 252, 0.08)',
    outlinedFocusedBg: 'rgba(252, 252, 252, 0.16)',
    outlinedPressedBg: 'rgba(252, 252, 252, 0.16)'
  },

  tertiary: {
    enabledBg: mainHexPallete.yellow[500],
    normalText: mainHexPallete.black,
    hoveredBg: 'rgb(238, 175, 35)',
    focusedBg: 'rgb(229, 169, 34)',
    pressedBg: mainHexPallete.yellow[800],
    disabledBg: mainHexPallete.blue[200],
    disabledText: mainHexPallete.blue[700]
  },

  error: {
    enabledBg: mainHexPallete.red[600],
    normalText: mainHexPallete.white,
    hoveredBg: 'rgb(172, 47, 15)',
    focusedBg: 'rgb(154, 42, 14)',
    pressedBg: 'rgb(154, 42, 13)',
    disabledBg: mainHexPallete.blue[200],
    disabledText: mainHexPallete.blue[700]
  }
};

export const buttonGroupColors = {
  primary: {
    selectedButton: mainHexPallete.black,
    selectedButtonText: mainHexPallete.white,
    groupBackground: 'rgba(25, 13, 3, 0.08)',
    buttonText: mainHexPallete.black
  },
  secondary: {
    selectedButton: mainHexPallete.white,
    selectedButtonText: mainHexPallete.black,
    groupBackground: mainHexPallete.black,
    buttonText: mainHexPallete.white
  },
  tertiary: {
    selectedButton: mainHexPallete.white,
    selectedButtonText: mainHexPallete.black,
    groupBackground: mainHexPallete.yellow[500],
    buttonText: mainHexPallete.black
  }
};

export const checkboxColors = {
  defaultIcon: mainHexPallete.blue[500],

  hoveredIcon: mainHexPallete.blue[500],
  hoveredRipple: sharedTokens.ripple,

  focusedIcon: mainHexPallete.brown[300],
  focusedRipple: sharedTokens.ripple,

  disabledIcon: mainHexPallete.blue[200],

  selectedIcon: 'rgba(255, 188, 33, 1)'
};

export const chipsColors = {
  normalText: mainHexPallete.black,

  filledDefaultBg: mainHexPallete.white,
  filledHoveredBg: mainHexPallete.brown[100],
  filledPressedBg: mainHexPallete.brown[200],
  filledDisabledBg: mainHexPallete.blue[50],

  outlineHoveredBg: 'rgba(25, 13, 3, 0.08)',
  outlinePressedBg: 'rgba(25, 13, 3, 0.24)',
  outlineNormalBorder: mainHexPallete.black,
  outlineDisabledBorder: mainHexPallete.blue[700],
  outlineDisabledText: mainHexPallete.blue[700],

  newsChipBg: 'rgb(182, 208, 247)',
  eventChipBg: 'rgb(247, 182, 225)',
  mediaChipBg: 'rgb(182, 247, 207)'
};

export const menuItemColors = {
  hoveredBg: 'rgba(25, 13, 3, 0.06)',
  activeBg: 'rgba(25, 13, 3, 0.12)',

  defaultText: mainHexPallete.black,
  disabledText: mainHexPallete.blue[700]
};

export const selectorColors = {
  standardTextColor: mainHexPallete.black,

  filledBg: mainHexPallete.blue[200],
  filledChipsBg: mainHexPallete.white,
  filledChipsContent: mainHexPallete.black,

  outlineBorder: mainHexPallete.black,
  outlineDefaultChipsBg: mainHexPallete.black,
  outlineDefaultTextColor: mainHexPallete.white
};

export const textFieldColors = {
  standard: {
    ...standardInputError,
    defaultFirstIcon: mainHexPallete.blue[800],
    defaultValue: mainHexPallete.blue[800],
    defaultSecondIcon: mainHexPallete.blue[700],
    defaultUnderline: 'rgba(25, 13, 3, 0.25)',

    hoveredFirstIcon: mainHexPallete.blue[800],
    hoveredValue: mainHexPallete.blue[800],
    hoveredSecondIcon: mainHexPallete.black,
    hoveredUnderline: 'rgba(25, 13, 3, 0.5)',

    focusedFirstIcon: mainHexPallete.black,
    focusedValue: mainHexPallete.black,
    focusedSecondIcon: mainHexPallete.black,
    focusedUnderline: mainHexPallete.black,

    disabledFirstIcon: mainHexPallete.blue[700],
    disabledValue: mainHexPallete.blue[700],
    disabledSecondIcon: mainHexPallete.blue[700],
    disabledUnderline: mainHexPallete.blue[700]
  },

  outline: {
    ...outlineInputError,
    defaultLabel: mainHexPallete.blue[800],
    defaultIcon: mainHexPallete.blue[700],
    defaultValue: mainHexPallete.black,
    defaultOutline: mainHexPallete.adminBlue[500],
    defaultTextInfo: mainHexPallete.blue[800],

    hoveredLabel: mainHexPallete.blue[800],
    hoveredIcon: mainHexPallete.black,
    hoveredValue: mainHexPallete.black,
    hoveredOutline: 'rgba(25, 13, 3, 0.5)',
    hoveredTextInfo: mainHexPallete.blue[800],

    focusedLabel: mainHexPallete.black,
    focusedIcon: mainHexPallete.black,
    focusedValue: mainHexPallete.black,
    focusedOutline: mainHexPallete.black,
    focusedTextInfo: mainHexPallete.black,

    disabledLabel: mainHexPallete.blue[600],
    disabledIcon: mainHexPallete.blue[600],
    disabledValue: mainHexPallete.blue[600],
    disabledOutline: mainHexPallete.blue[600],
    disabledTextInfo: mainHexPallete.blue[600]
  }
};

export const tabsColors = {
  active: mainHexPallete.black,
  hovered: mainHexPallete.adminBlue[600],
  pressed: mainHexPallete.adminBlue[900],
  unactive: mainHexPallete.adminBlue[800],
  disabled: mainHexPallete.adminBlue[300],
  baseUnderline: mainHexPallete.adminBlue[300]
};

export const toolbarColors = {
  textColor: mainHexPallete.black,
  default: mainHexPallete.white,
  hovered: 'rgba(241, 242, 247, 1)',
  focused: 'rgba(25, 13, 3, 0.06)',
  border: mainHexPallete.blue[200]
};

// нові кольори
// потрібен рефактор (можлива дуплікація)
export const alertColors = {
  cross: 'rgba(86, 86, 86, 1)',
  shadow: 'rgba(0, 0, 0, 0.08)',

  filled: {
    label: mainHexPallete.white,

    errorBg: mainHexPallete.red[500],
    errorText: mainHexPallete.red[50],
    errorIcon: mainHexPallete.red[700],

    warningBg: mainHexPallete.yellow[500],
    warningText: mainHexPallete.white,
    warningIcon: mainHexPallete.white,

    infoBg: 'rgba(51, 161, 216, 1)',
    infoText: mainHexPallete.white,
    infoIcon: 'rgba(86, 86, 86, 1)',

    successBg: mainHexPallete.green[600],
    successText: mainHexPallete.white,
    successIcon: mainHexPallete.blue[700]
  },

  outlined: {
    label: mainHexPallete.black,

    errorBg: mainHexPallete.red[50],
    errorText: mainHexPallete.red[800],
    errorIcon: mainHexPallete.blue[700],
    errorBorder: mainHexPallete.red[500],

    warningBg: mainHexPallete.yellow[100],
    warningText: mainHexPallete.yellow[800],
    warningIcon: 'rgba(181, 133, 23, 1)',
    warningBorder: mainHexPallete.yellow[500],

    infoBg: 'rgba(214, 236, 247, 1)',
    infoText: 'rgba(20, 64, 86, 1)',
    infoIcon: 'rgba(86, 86, 86, 1)',
    infoBorder: 'rgba(51, 161, 216, 1)',

    successBg: mainHexPallete.green[100],
    successText: mainHexPallete.green[800],
    successIcon: mainHexPallete.blue[700],
    successBorder: mainHexPallete.green[600]
  }
};

export const accordionColors = {
  defaultBg: mainHexPallete.white,
  defaultBorder: mainHexPallete.blue[200],
  defaultIcon: mainHexPallete.black
};

export const tooltipColors = {
  defaultBg: mainHexPallete.blue[900],
  defaultText: mainHexPallete.white,
  defaultShadow: 'rgba(0, 0, 0, 0.07)'
};
