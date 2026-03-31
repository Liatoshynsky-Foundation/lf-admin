const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const mainHexPallete = {
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
  green: {
    100: '#E2F2DC'
  },
  white: '#FCFCFC',
  black: '#190d03'
};

const commonStates = {
  disabled: {
    bg: mainHexPallete.blue[200],
    text: mainHexPallete.blue[700],
    border: mainHexPallete.blue[700],
    icon: mainHexPallete.blue[700],

    outline: {
      text: mainHexPallete.blue[600],
      border: mainHexPallete.blue[600],
      icon: mainHexPallete.blue[600]
    }
  },

  functional: {
    error: 'rgba(230, 60, 20, 1)',
    primaryBadge: 'rgba(95, 14, 15, 1)'
  },

  ripple: hexToRgba(mainHexPallete.brown[100], 0.4),

  interaction: {
    blackHover: '#342A21',
    blackPressed: '#5D554E',
    yellowHover: '#EEAF23',
    yellowPressed: '#E5A922',
    redHover: '#AC2F0F',
    redFocused: '#9A2A0E',
    redPressed: '#9A2A0D',
    whiteHover: '#EEECEA',
    whitePressed: '#D3CDC6'
  },

  blackAlpha: (opacity: number) => hexToRgba(mainHexPallete.black, opacity),
  whiteAlpha: (opacity: number) => hexToRgba(mainHexPallete.white, opacity)
};

export const badgeColors = {
  standardDefaultValue: commonStates.blackAlpha(0.56),
  standardPrimaryValue: mainHexPallete.white,
  standardPrimaryBg: commonStates.functional.primaryBadge,
  standardSecondaryValue: mainHexPallete.black,
  standardErrorBg: commonStates.functional.error,
  standardErrorValue: mainHexPallete.white,

  dotPrimaryBg: commonStates.functional.primaryBadge,
  dotErrorBg: commonStates.functional.error
};

export const buttonColors = {
  primary: {
    filledEnabledBg: mainHexPallete.black,
    filledNormalText: mainHexPallete.white,
    filledHoveredBg: commonStates.interaction.blackHover,
    filledFocusedBg: commonStates.interaction.blackPressed,
    filledPressedBg: commonStates.interaction.blackPressed,
    filledDisabledBg: commonStates.disabled.bg,

    outlinedEnabledBg: 'transparent',
    outlinedNormalText: mainHexPallete.black,
    outlinedNormalBorder: mainHexPallete.black,
    outlinedHoveredBg: commonStates.blackAlpha(0.04),
    outlinedFocusedBg: commonStates.blackAlpha(0.1),
    outlinedPressedBg: commonStates.blackAlpha(0.1),
    outlinedDisabledBg: 'transparent',
    outlinedDisabledBorder: commonStates.disabled.border,

    disabledText: commonStates.disabled.text
  },

  secondary: {
    filledEnabledBg: mainHexPallete.white,
    filledNormalText: mainHexPallete.black,
    filledHoveredBg: commonStates.interaction.whiteHover,
    filledFocusedBg: commonStates.interaction.whitePressed,
    filledPressedBg: '#DAD5CF',
    filledDisabledBg: commonStates.disabled.bg,

    outlinedEnabledBg: 'transparent',
    outlinedNormalText: mainHexPallete.white,
    outlinedNormalBorder: mainHexPallete.white,
    outlinedHoveredBg: commonStates.whiteAlpha(0.08),
    outlinedFocusedBg: commonStates.whiteAlpha(0.16),
    outlinedPressedBg: commonStates.whiteAlpha(0.16),
    outlinedDisabledBg: 'transparent',
    outlinedDisabledBorder: commonStates.disabled.border,

    disabledText: commonStates.disabled.text
  },

  tertiary: {
    enabledBg: mainHexPallete.yellow[500],
    normalText: mainHexPallete.black,
    hoveredBg: commonStates.interaction.yellowHover,
    focusedBg: commonStates.interaction.yellowPressed,
    pressedBg: mainHexPallete.yellow[800],
    disabledBg: commonStates.disabled.bg,
    disabledText: commonStates.disabled.text
  },

  error: {
    enabledBg: mainHexPallete.red[600],
    normalText: mainHexPallete.white,
    hoveredBg: commonStates.interaction.redHover,
    focusedBg: commonStates.interaction.redFocused,
    pressedBg: commonStates.interaction.redPressed,
    disabledBg: commonStates.disabled.bg,
    disabledText: commonStates.disabled.text
  }
};

export const buttonGroupColors = {
  primary: {
    selectedButton: mainHexPallete.black,
    selectedButtonText: mainHexPallete.white,
    groupBackground: mainHexPallete.blue[50],
    buttonText: mainHexPallete.black
  },
  secondary: {
    selectedButton: mainHexPallete.white,
    selectedButtonText: mainHexPallete.black,
    groupBackground: mainHexPallete.yellow[500],
    buttonText: mainHexPallete.black
  },
  tertiary: {
    selectedButton: mainHexPallete.white,
    selectedButtonText: mainHexPallete.black,
    groupBackground: mainHexPallete.brown[200],
    buttonText: mainHexPallete.black
  }
};

export const checkboxColors = {
  defaultIcon: mainHexPallete.blue[500],

  hoveredIcon: mainHexPallete.blue[500],
  hoveredRipple: commonStates.ripple,

  focusedIcon: mainHexPallete.brown[300],
  focusedRipple: commonStates.ripple,

  disabledIcon: commonStates.disabled.bg,

  selectedIcon: 'rgba(255, 188, 33, 1)'
};

export const chipsColors = {
  normalText: mainHexPallete.black,

  filledDefaultBg: mainHexPallete.white,
  filledHoveredBg: mainHexPallete.brown[100],
  filledPressedBg: mainHexPallete.brown[200],
  filledDisabledBg: mainHexPallete.blue[50],

  outlineHoveredBg: commonStates.blackAlpha(0.08),
  outlinePressedBg: commonStates.blackAlpha(0.24),
  outlineNormalBorder: mainHexPallete.black,
  outlineDisabledBorder: commonStates.disabled.border,
  outlineDisabledText: commonStates.disabled.text
};

export const menuItemColors = {
  hoveredBg: commonStates.blackAlpha(0.06),
  activeBg: commonStates.blackAlpha(0.12),

  defaultText: mainHexPallete.black,
  disabledText: commonStates.disabled.text
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
    defaultFirstIcon: mainHexPallete.blue[800],
    defaultValue: mainHexPallete.blue[800],
    defaultSecondIcon: mainHexPallete.blue[700],
    defaultUnderline: commonStates.blackAlpha(0.25),

    hoveredFirstIcon: mainHexPallete.blue[800],
    hoveredValue: mainHexPallete.blue[800],
    hoveredSecondIcon: mainHexPallete.black,
    hoveredUnderline: commonStates.blackAlpha(0.5),

    focusedFirstIcon: mainHexPallete.black,
    focusedValue: mainHexPallete.black,
    focusedSecondIcon: mainHexPallete.black,
    focusedUnderline: mainHexPallete.black,

    disabledFirstIcon: commonStates.disabled.icon,
    disabledValue: commonStates.disabled.text,
    disabledSecondIcon: commonStates.disabled.icon,
    disabledUnderline: commonStates.disabled.border,

    errorFirstIcon: commonStates.functional.error,
    errorValue: mainHexPallete.black,
    errorSecondIcon: commonStates.functional.error,
    errorUnderline: commonStates.functional.error
  },

  outline: {
    defaultLabel: mainHexPallete.blue[800],
    defaultIcon: mainHexPallete.blue[700],
    defaultValue: mainHexPallete.black,
    defaultOutline: mainHexPallete.adminBlue[500],
    defaultTextInfo: mainHexPallete.blue[800],

    hoveredLabel: mainHexPallete.blue[800],
    hoveredIcon: mainHexPallete.black,
    hoveredValue: mainHexPallete.black,
    hoveredOutline: commonStates.blackAlpha(0.5),
    hoveredTextInfo: mainHexPallete.blue[800],

    focusedLabel: mainHexPallete.black,
    focusedIcon: mainHexPallete.black,
    focusedValue: mainHexPallete.black,
    focusedOutline: mainHexPallete.black,
    focusedTextInfo: mainHexPallete.black,

    disabledLabel: commonStates.disabled.outline.text,
    disabledIcon: commonStates.disabled.outline.icon,
    disabledValue: commonStates.disabled.outline.text,
    disabledOutline: commonStates.disabled.outline.border,
    disabledTextInfo: commonStates.disabled.outline.text,

    errorLabel: commonStates.functional.error,
    errorIcon: commonStates.functional.error,
    errorValue: mainHexPallete.black,
    errorOutline: commonStates.functional.error,
    errorTextInfo: commonStates.functional.error,
    errorTextInfoIcon: commonStates.functional.error
  }
};

export const toolbarColors = {
  textColor: mainHexPallete.black,
  default: mainHexPallete.white,
  hovered: 'rgba(241, 242, 247, 1)',
  focused: commonStates.blackAlpha(0.06),
  border: mainHexPallete.blue[200]
};
