export const mainHexPalette = {
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
  },
  charcoalGray: '#232529'
};

const sharedTokens = {
  error: 'rgb(230, 60, 20)',
  ripple: 'rgba(239, 233, 224, 0.4)',
  primaryBadge: 'rgba(95, 14, 15, 1)'
};

const sharedButtonDisabled = {
  filledDisabledBg: mainHexPalette.blue[200],
  outlinedDisabledBg: 'transparent',
  outlinedDisabledBorder: mainHexPalette.blue[700],
  disabledText: mainHexPalette.blue[700]
};

const sharedInputErrorBase = {
  errorValue: mainHexPalette.black
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
  standardPrimaryValue: mainHexPalette.white,
  standardPrimaryBg: sharedTokens.primaryBadge,
  standardSecondaryValue: mainHexPalette.black,
  standardErrorBg: 'rgba(230, 60, 20, 1)',
  standardErrorValue: mainHexPalette.white,

  dotPrimaryBg: sharedTokens.primaryBadge,
  dotErrorBg: 'rgba(230, 60, 20, 1)'
};

export const buttonColors = {
  primary: {
    ...sharedButtonDisabled,
    filledEnabledBg: mainHexPalette.black,
    filledNormalText: mainHexPalette.white,
    filledHoveredBg: 'rgb(52, 42, 33)',
    filledFocusedBg: 'rgb(93, 85, 78)',
    filledPressedBg: 'rgb(93, 85, 78)',

    outlinedEnabledBg: 'transparent',
    outlinedNormalText: mainHexPalette.black,
    outlinedNormalBorder: mainHexPalette.black,
    outlinedHoveredBg: 'rgba(25, 13, 3, 0.04)',
    outlinedFocusedBg: 'rgba(25, 13, 3, 0.1)',
    outlinedPressedBg: 'rgba(25, 13, 3, 0.1)'
  },

  secondary: {
    ...sharedButtonDisabled,
    filledEnabledBg: mainHexPalette.white,
    filledNormalText: mainHexPalette.black,
    filledHoveredBg: 'rgb(238, 236, 234)',
    filledFocusedBg: 'rgb(211, 205, 198)',
    filledPressedBg: 'rgb(218, 213, 207)',

    outlinedEnabledBg: 'transparent',
    outlinedNormalText: mainHexPalette.white,
    outlinedNormalBorder: mainHexPalette.white,
    outlinedHoveredBg: 'rgba(252, 252, 252, 0.08)',
    outlinedFocusedBg: 'rgba(252, 252, 252, 0.16)',
    outlinedPressedBg: 'rgba(252, 252, 252, 0.16)'
  },

  tertiary: {
    enabledBg: mainHexPalette.yellow[500],
    normalText: mainHexPalette.black,
    hoveredBg: 'rgb(238, 175, 35)',
    focusedBg: 'rgb(229, 169, 34)',
    pressedBg: mainHexPalette.yellow[800],
    disabledBg: mainHexPalette.blue[200],
    disabledText: mainHexPalette.blue[700]
  },

  error: {
    enabledBg: mainHexPalette.red[600],
    normalText: mainHexPalette.white,
    hoveredBg: 'rgb(172, 47, 15)',
    focusedBg: 'rgb(154, 42, 14)',
    pressedBg: 'rgb(154, 42, 13)',
    disabledBg: mainHexPalette.blue[200],
    disabledText: mainHexPalette.blue[700]
  }
};

export const buttonGroupColors = {
  primary: {
    selectedButton: mainHexPalette.black,
    selectedButtonText: mainHexPalette.white,
    groupBackground: 'rgba(25, 13, 3, 0.08)',
    buttonText: mainHexPalette.black
  },
  secondary: {
    selectedButton: mainHexPalette.white,
    selectedButtonText: mainHexPalette.black,
    groupBackground: mainHexPalette.black,
    buttonText: mainHexPalette.white
  },
  tertiary: {
    selectedButton: mainHexPalette.white,
    selectedButtonText: mainHexPalette.black,
    groupBackground: mainHexPalette.yellow[500],
    buttonText: mainHexPalette.black
  }
};

export const checkboxColors = {
  defaultIcon: mainHexPalette.blue[500],

  hoveredIcon: mainHexPalette.blue[500],
  hoveredRipple: sharedTokens.ripple,

  focusedIcon: mainHexPalette.brown[300],
  focusedRipple: sharedTokens.ripple,

  disabledIcon: mainHexPalette.blue[200],

  selectedIcon: 'rgba(255, 188, 33, 1)'
};

export const chipsColors = {
  normalText: mainHexPalette.black,

  filledDefaultBg: mainHexPalette.white,
  filledHoveredBg: mainHexPalette.brown[100],
  filledPressedBg: mainHexPalette.brown[200],
  filledDisabledBg: mainHexPalette.blue[50],

  outlineHoveredBg: 'rgba(25, 13, 3, 0.08)',
  outlinePressedBg: 'rgba(25, 13, 3, 0.24)',
  outlineNormalBorder: mainHexPalette.black,
  outlineDisabledBorder: mainHexPalette.blue[700],
  outlineDisabledText: mainHexPalette.blue[700],

  published: mainHexPalette.green[600],
  draft: mainHexPalette.red[100],
  newsChipBg: 'rgb(182, 208, 247)',
  eventChipBg: 'rgb(247, 182, 225)',
  mediaChipBg: 'rgb(182, 247, 207)'
};

export const menuItemColors = {
  hoveredBg: 'rgba(25, 13, 3, 0.06)',
  activeBg: 'rgba(25, 13, 3, 0.12)',

  defaultText: mainHexPalette.black,
  disabledText: mainHexPalette.blue[700]
};

export const selectorColors = {
  standardTextColor: mainHexPalette.black,

  filledBg: mainHexPalette.blue[200],
  filledChipsBg: mainHexPalette.white,
  filledChipsContent: mainHexPalette.black,

  outlineBorder: mainHexPalette.black,
  outlineDefaultChipsBg: mainHexPalette.black,
  outlineDefaultTextColor: mainHexPalette.white
};

export const textFieldColors = {
  standard: {
    ...standardInputError,
    defaultFirstIcon: mainHexPalette.blue[800],
    defaultValue: mainHexPalette.blue[800],
    defaultSecondIcon: mainHexPalette.blue[700],
    defaultUnderline: 'rgba(25, 13, 3, 0.25)',

    hoveredFirstIcon: mainHexPalette.blue[800],
    hoveredValue: mainHexPalette.blue[800],
    hoveredSecondIcon: mainHexPalette.black,
    hoveredUnderline: 'rgba(25, 13, 3, 0.5)',

    focusedFirstIcon: mainHexPalette.black,
    focusedValue: mainHexPalette.black,
    focusedSecondIcon: mainHexPalette.black,
    focusedUnderline: mainHexPalette.black,

    disabledFirstIcon: mainHexPalette.blue[700],
    disabledValue: mainHexPalette.blue[700],
    disabledSecondIcon: mainHexPalette.blue[700],
    disabledUnderline: mainHexPalette.blue[700]
  },

  outline: {
    ...outlineInputError,
    defaultLabel: mainHexPalette.blue[800],
    defaultIcon: mainHexPalette.blue[700],
    defaultValue: mainHexPalette.black,
    defaultOutline: mainHexPalette.adminBlue[500],
    defaultTextInfo: mainHexPalette.blue[800],

    hoveredLabel: mainHexPalette.blue[800],
    hoveredIcon: mainHexPalette.black,
    hoveredValue: mainHexPalette.black,
    hoveredOutline: 'rgba(25, 13, 3, 0.5)',
    hoveredTextInfo: mainHexPalette.blue[800],

    focusedLabel: mainHexPalette.black,
    focusedIcon: mainHexPalette.black,
    focusedValue: mainHexPalette.black,
    focusedOutline: mainHexPalette.black,
    focusedTextInfo: mainHexPalette.black,

    disabledLabel: mainHexPalette.blue[600],
    disabledIcon: mainHexPalette.blue[600],
    disabledValue: mainHexPalette.blue[600],
    disabledOutline: mainHexPalette.blue[600],
    disabledTextInfo: mainHexPalette.blue[600]
  }
};

export const tabsColors = {
  active: mainHexPalette.black,
  hovered: mainHexPalette.adminBlue[600],
  pressed: mainHexPalette.adminBlue[900],
  unactive: mainHexPalette.adminBlue[800],
  disabled: mainHexPalette.adminBlue[300],
  baseUnderline: mainHexPalette.adminBlue[300]
};

export const toolbarColors = {
  textColor: mainHexPalette.black,
  default: mainHexPalette.white,
  hovered: 'rgba(241, 242, 247, 1)',
  focused: 'rgba(25, 13, 3, 0.06)',
  border: mainHexPalette.blue[200]
};

export const alertColors = {
  cross: 'rgba(86, 86, 86, 1)',
  shadow: 'rgba(0, 0, 0, 0.08)',

  filled: {
    label: mainHexPalette.white,

    errorBg: mainHexPalette.red[500],
    errorText: mainHexPalette.red[50],
    errorIcon: mainHexPalette.red[700],

    warningBg: mainHexPalette.yellow[500],
    warningText: mainHexPalette.white,
    warningIcon: mainHexPalette.white,

    infoBg: 'rgba(51, 161, 216, 1)',
    infoText: mainHexPalette.white,
    infoIcon: 'rgba(86, 86, 86, 1)',

    successBg: mainHexPalette.green[600],
    successText: mainHexPalette.white,
    successIcon: mainHexPalette.blue[700]
  },

  outlined: {
    label: mainHexPalette.black,

    errorBg: mainHexPalette.red[50],
    errorText: mainHexPalette.red[800],
    errorIcon: mainHexPalette.blue[700],
    errorBorder: mainHexPalette.red[500],

    warningBg: mainHexPalette.yellow[100],
    warningText: mainHexPalette.yellow[800],
    warningIcon: 'rgba(181, 133, 23, 1)',
    warningBorder: mainHexPalette.yellow[500],

    infoBg: 'rgba(214, 236, 247, 1)',
    infoText: 'rgba(20, 64, 86, 1)',
    infoIcon: 'rgba(86, 86, 86, 1)',
    infoBorder: 'rgba(51, 161, 216, 1)',

    successBg: mainHexPalette.green[100],
    successText: mainHexPalette.green[800],
    successIcon: mainHexPalette.blue[700],
    successBorder: mainHexPalette.green[600]
  }
};

export const accordionColors = {
  defaultBg: mainHexPalette.white,
  defaultBorder: mainHexPalette.blue[200],
  defaultIcon: mainHexPalette.black
};

export const tooltipColors = {
  defaultBg: mainHexPalette.blue[900],
  defaultText: mainHexPalette.white,
  defaultShadow: 'rgba(0, 0, 0, 0.07)'
};
