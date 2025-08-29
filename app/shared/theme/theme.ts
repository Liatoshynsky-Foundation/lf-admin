import { createTheme } from '@mui/material/styles';
import { Mulish, Oswald } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin'] });
const mulish = Mulish({ subsets: ['latin'] });

declare module '@mui/material/styles' {
  interface TypographyVariants {
    customBold32: React.CSSProperties;
    customMedium22Tight: React.CSSProperties;
    customRegular20Tight: React.CSSProperties;
    customMedium18Tight: React.CSSProperties;
    customMedium18Loose: React.CSSProperties;
    customSemiBold18: React.CSSProperties;
    customRegular16: React.CSSProperties;
    customBold16: React.CSSProperties;
    customMedium16: React.CSSProperties;
    customItalic16: React.CSSProperties;
    customItalic14: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    customBold32?: React.CSSProperties;
    customMedium22Tight?: React.CSSProperties;
    customRegular20Tight?: React.CSSProperties;
    customMedium18Tight?: React.CSSProperties;
    customMedium18Loose?: React.CSSProperties;
    customSemiBold18?: React.CSSProperties;
    customRegular16?: React.CSSProperties;
    customBold16?: React.CSSProperties;
    customMedium16?: React.CSSProperties;
    customItalic16?: React.CSSProperties;
    customItalic14?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    customBold32: true;
    customMedium22Tight: true;
    customRegular20Tight: true;
    customMedium18Tight: true;
    customMedium18Loose: true;
    customSemiBold18: true;
    customRegular16: true;
    customBold16: true;
    customMedium16: true;
    customItalic16: true;
    customItalic14: true;
  }
}

// Create theme inside a function to avoid serialization issues
export const createAdminTheme = () =>
  createTheme({
    typography: {
      fontFamily: mulish.style.fontFamily,
      h1: {
        fontFamily: oswald.style.fontFamily,
        fontWeight: 700,
        fontSize: '116px',
        lineHeight: '100%'
      },
      h2: {
        fontFamily: oswald.style.fontFamily,
        fontWeight: 600,
        fontSize: '64px',
        lineHeight: '100%'
      },
      h3: {
        fontFamily: oswald.style.fontFamily,
        fontWeight: 400,
        fontSize: '64px',
        lineHeight: '100%'
      },
      h4: {
        fontFamily: oswald.style.fontFamily,
        fontWeight: 700,
        fontSize: '28px',
        lineHeight: '160%'
      },
      customBold32: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 700,
        fontSize: '32px',
        lineHeight: '140%',
        letterSpacing: '0px'
      },
      customMedium22Tight: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 500,
        fontSize: '22px',
        lineHeight: '135%'
      },
      customRegular20Tight: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '140%'
      },
      customMedium18Tight: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 500,
        fontSize: '18px',
        lineHeight: '135%'
      },
      customMedium18Loose: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 500,
        fontSize: '18px',
        lineHeight: '155%'
      },
      customSemiBold18: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 600,
        fontSize: '18px',
        lineHeight: '155%'
      },
      customBold16: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 700,
        fontSize: '16px',
        lineHeight: '100%'
      },
      customRegular16: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '150%'
      },
      customMedium16: {
        fontFamily: mulish.style.fontFamily,
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: '150%'
      },
      customItalic16: {
        fontFamily: mulish.style.fontFamily,
        fontStyle: 'italic',
        fontSize: '16px',
        lineHeight: '140%'
      },
      customItalic14: {
        fontFamily: mulish.style.fontFamily,
        fontStyle: 'italic',
        fontSize: '14px',
        lineHeight: '140%'
      }
    },
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            customBold32: 'p',
            customMedium22Tight: 'p',
            customRegular20Tight: 'p',
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
      }
    }
  });

// Export a single instance for consistency
export const adminTheme = createAdminTheme();

export type AdminTheme = ReturnType<typeof createAdminTheme>;
