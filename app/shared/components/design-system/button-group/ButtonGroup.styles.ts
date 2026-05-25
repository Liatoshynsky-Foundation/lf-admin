import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

import { buttonGroupColors } from '~/shared/theme/colors';

type PaletteType = 'primary' | 'secondary' | 'tertiary';

export const StyledButtonGroup = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'palette'
})<{ palette: PaletteType }>(({ palette }) => {
  const paletteValues = buttonGroupColors[palette];

  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    padding: '2px',
    fontFamily: 'inherit',
    position: 'relative',
    overflow: 'hidden',
    width: 'fit-content',
    border: 'none',
    lineHeight: '1.5',
    backgroundColor: paletteValues.groupBackground,
    color: paletteValues.buttonText
  };
});

export const StyledIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'left' && prop !== 'width' && prop !== 'palette'
})<{
  left: number;
  width: number;
  palette: PaletteType;
}>(({ left, width, palette }) => {
  const paletteValues = buttonGroupColors[palette];

  return {
    height: 'calc(100% - 4px)',
    top: 2,
    position: 'absolute',
    borderRadius: '9999px',
    transition: 'all 0.3s ease',
    zIndex: 0,
    backgroundColor: paletteValues.selectedButton,
    color: paletteValues.selectedButtonText,
    left,
    width
  };
});

export const StyledButtonItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'palette' && prop !== 'size'
})<{
  active: boolean;
  palette: PaletteType;
  size: 'small' | 'big';
}>(({ active, palette, size }) => {
  const paletteValues = buttonGroupColors[palette];

  return {
    display: 'inline-block',
    borderRadius: '9999px',
    color: active ? paletteValues.selectedButtonText : paletteValues.buttonText,
    fontFamily: 'inherit',
    fontSize: size === 'big' ? '18px' : '16px',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    marginRight: '4px',
    padding: size === 'big' ? '8px 22px' : '2px 16px',
    textTransform: 'none',
    lineHeight: '1.5',
    border: 'none',
    backgroundColor: 'transparent',
    '&:last-child': {
      marginRight: 0
    },
    '&>button': {
      backgroundColor: 'transparent',
      color: 'inherit',
      textDecoration: 'none',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      cursor: 'inherit',
      border: 'none',
      padding: 0,
      margin: 0,
      display: 'inline-block',
      height: '100%',
      transition: 'none',
      '&:hover': {
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: 'inherit'
      },
      '& *:not(.lf-btn-label)': {
        display: 'none'
      }
    }
  };
});
