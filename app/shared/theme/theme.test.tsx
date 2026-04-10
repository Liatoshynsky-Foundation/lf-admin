import { Button, Tab, Tabs, Typography, TypographyProps } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';

import { buttonColors, tabsColors } from './colors';
import { adminTheme } from './theme';

describe('Admin Theme Configuration', () => {
  describe('Typography System', () => {
    it('should have all new semantic typography variants defined', () => {
      expect(adminTheme.typography.displayXl).toBeDefined();
      expect(adminTheme.typography.displayLg).toBeDefined();
      expect(adminTheme.typography.displayMd).toBeDefined();
      expect(adminTheme.typography.bodyLg).toBeDefined();
      expect(adminTheme.typography.bodyMd).toBeDefined();
      expect(adminTheme.typography.bodySm).toBeDefined();
      expect(adminTheme.typography.textMd).toBeDefined();
      expect(adminTheme.typography.textSm).toBeDefined();
    });

    it('should have correct variant mapping for new typography', () => {
      const variantMapping = adminTheme.components?.MuiTypography?.defaultProps?.variantMapping as
        | Record<string, string>
        | undefined;

      expect(variantMapping?.displayXl).toBe('h2');
      expect(variantMapping?.bodyLg).toBe('p');
      expect(variantMapping?.textSm).toBe('p');
    });

    it('should use unitless line-heights and correct sizes for body variants', () => {
      expect(adminTheme.typography.bodyLg).toMatchObject({
        fontSize: '24px',
        fontWeight: 400,
        lineHeight: 1.6
      });

      expect(adminTheme.typography.bodySm).toMatchObject({
        fontSize: '18px',
        fontWeight: 400,
        lineHeight: 1.6
      });
    });

    it('should use correct font families for display and body', () => {
      expect(adminTheme.typography.displayXl?.fontFamily).toContain('var(--font-oswald)');
      expect(adminTheme.typography.bodyMd?.fontFamily).toContain('var(--font-mulish)');
    });
  });

  describe('Palette & Colors', () => {
    it('should have custom tertiary color defined in the palette', () => {
      expect(adminTheme.palette.tertiary).toBeDefined();
      expect(adminTheme.palette.tertiary.main).toBe(buttonColors.tertiary.enabledBg);
    });

    it('should have expanded functional color palettes', () => {
      const palette = adminTheme.palette as unknown as Record<string, unknown>;

      expect(palette['blue']).toBeDefined();
      expect(palette['yellow']).toBeDefined();
      expect(palette['adminBlue']).toBeDefined();
    });
  });

  describe('Component Style Overrides', () => {
    it('should have MuiButton overrides and variants applied', () => {
      const buttonTheme = adminTheme.components?.MuiButton;

      expect(buttonTheme?.styleOverrides?.root).toBeDefined();
      expect(buttonTheme?.variants?.length).toBeGreaterThan(0);
    });

    it('should have consistent border radius for core components', () => {
      const buttonOverrides = adminTheme.components?.MuiButton?.styleOverrides?.root as
        | Record<string, unknown>
        | undefined;
      const outlinedInputOverrides = adminTheme.components?.MuiOutlinedInput?.styleOverrides?.root as
        | Record<string, unknown>
        | undefined;

      expect(buttonOverrides?.borderRadius).toBe('28px');
      expect(outlinedInputOverrides?.borderRadius).toBe('8px');
    });

    it('should have MuiTabs and MuiTab overrides applied', () => {
      const tabsTheme = adminTheme.components?.MuiTabs;
      const tabTheme = adminTheme.components?.MuiTab;

      const tabsIndicator = tabsTheme?.styleOverrides?.indicator as Record<string, unknown> | undefined;
      const tabRoot = tabTheme?.styleOverrides?.root as Record<string, unknown> | undefined;

      expect(tabsIndicator?.backgroundColor).toBe(tabsColors.active);

      expect(tabTheme?.defaultProps?.disableRipple).toBe(true);
      expect(tabRoot?.textTransform).toBe('none');
    });
  });
});

describe('Theme Provider Rendering', () => {
  const renderTypography = (variant: TypographyProps['variant']) =>
    render(
      <ThemeProvider theme={adminTheme}>
        <Typography variant={variant} data-testid="typography-test">
          Text Content
        </Typography>
      </ThemeProvider>
    );

  it('renders new semantic typography variant without throwing errors', () => {
    const { getByTestId } = renderTypography('displayMd');
    expect(getByTestId('typography-test')).toBeInTheDocument();
  });

  it('renders standard typography variant without throwing errors', () => {
    const { getByTestId } = renderTypography('h2');
    expect(getByTestId('typography-test')).toBeInTheDocument();
  });

  it('renders custom Button variant (tertiary) without throwing errors', () => {
    const { getByRole } = render(
      <ThemeProvider theme={adminTheme}>
        <Button variant="contained" color="tertiary">
          Tertiary Button
        </Button>
      </ThemeProvider>
    );

    expect(getByRole('button')).toBeInTheDocument();
  });

  it('renders Tabs without throwing errors', () => {
    const { getByRole, getAllByRole } = render(
      <ThemeProvider theme={adminTheme}>
        <Tabs value={0}>
          <Tab label="Tab 1" />
          <Tab label="Tab 2" />
        </Tabs>
      </ThemeProvider>
    );

    expect(getByRole('tablist')).toBeInTheDocument();
    expect(getAllByRole('tab')).toHaveLength(2);
  });
});
