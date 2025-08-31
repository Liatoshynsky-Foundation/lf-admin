import { createTheme, PaletteColorOptions } from '@mui/material';
import { Mulish, Oswald } from 'next/font/google';

import { colors } from './colors';

const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor: string) => augmentColor({ color: { main: mainColor } });

export const oswald = Oswald({ subsets: ['latin'] });
export const mulish = Mulish({ subsets: ['latin'] });

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

declare module '@mui/material' {
  interface TypographyPropsVariantOverrides {
    custom18regular: true;
    custom16medium: true;
    custom14regular: true;
  }
}
declare module '@mui/material/styles' {
  interface TypographyVariantsOptions {
    custom18regular: React.CSSProperties;
    custom16medium: React.CSSProperties;
    custom14regular: React.CSSProperties;
  }
  interface TypographyVariants {
    custom18regular: React.CSSProperties;
    custom16medium: React.CSSProperties;
    custom14regular: React.CSSProperties;
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

declare module '@mui/material/styles' {
  interface CustomPalette {
    tertiary: PaletteColorOptions;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.black,
      contrastText: colors.white
    },
    secondary: {
      main: colors.blue[800],
      contrastText: colors.white
    },
    success: {
      main: '#579A40',
      light: '#579A40',
      contrastText: colors.neutral
    },
    warning: {
      main: colors.yellow[500],
      light: colors.yellow[100],
      contrastText: colors.neutral
    },
    info: {
      main: colors.blue[500],
      light: colors.blue[100],
      contrastText: colors.neutral
    },
    error: {
      main: '#E53D11',
      light: '#FAEEEE',
      contrastText: '#FAEEEE'
    },
    text: {
      primary: colors.black,
      secondary: colors.blue[900],
      disabled: colors.blue[200]
    },
    background: {
      default: colors.white
    },
    tertiary: createColor(colors.yellow[500]),
    ...colors
  },
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
  typography: {
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '140%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '140%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    subtitle1: {
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: '140%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily,
      color: colors.blue[800]
    },
    subtitle2: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '135%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '150%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    custom18regular: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: '160%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    custom16medium: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '150%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    custom14regular: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '140%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    },
    button: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '150%',
      letterSpacing: '0px',
      fontFamily: mulish.style.fontFamily
    }
  }
});
