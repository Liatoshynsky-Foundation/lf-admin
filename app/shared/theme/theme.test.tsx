import { Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { TypographyPropsVariantOverrides } from '@mui/material/Typography';
import { OverridableStringUnion } from '@mui/types';
import { render } from '@testing-library/react';

import { adminTheme } from './theme';

type CustomVariant = OverridableStringUnion<keyof TypographyPropsVariantOverrides, unknown>;

describe('Custom Typography Variants', () => {
  const renderWithTheme = (variant: CustomVariant) =>
    render(
      <ThemeProvider theme={adminTheme}>
        <Typography variant={variant}>Test</Typography>
      </ThemeProvider>
    );

  it('renders customBold32 variant correctly', () => {
    const { getByText } = renderWithTheme('customBold32');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 700,
      fontSize: '32px',
      lineHeight: '140%',
      letterSpacing: '0px'
    });
  });

  it('renders customMedium22Tight variant correctly', () => {
    const { getByText } = renderWithTheme('customMedium22Tight');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 500,
      fontSize: '22px',
      lineHeight: '135%'
    });
  });

  it('renders customRegular20Tight variant correctly', () => {
    const { getByText } = renderWithTheme('customRegular20Tight');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 400,
      fontSize: '20px',
      lineHeight: '140%'
    });
  });

  it('renders customMedium18Tight variant correctly', () => {
    const { getByText } = renderWithTheme('customMedium18Tight');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '135%'
    });
  });

  it('renders customMedium18Loose variant correctly', () => {
    const { getByText } = renderWithTheme('customMedium18Loose');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '155%'
    });
  });

  it('renders customSemiBold18 variant correctly', () => {
    const { getByText } = renderWithTheme('customSemiBold18');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '155%'
    });
  });

  it('renders customRegular16 variant correctly', () => {
    const { getByText } = renderWithTheme('customRegular16');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: '150%'
    });
  });

  it('renders customBold16 variant correctly', () => {
    const { getByText } = renderWithTheme('customBold16');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '100%'
    });
  });

  it('renders customMedium16 variant correctly', () => {
    const { getByText } = renderWithTheme('customMedium16');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '150%'
    });
  });

  it('renders customItalic16 variant correctly', () => {
    const { getByText } = renderWithTheme('customItalic16');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontStyle: 'italic',
      fontSize: '16px',
      lineHeight: '140%'
    });
  });

  it('renders customItalic14 variant correctly', () => {
    const { getByText } = renderWithTheme('customItalic14');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontStyle: 'italic',
      fontSize: '14px',
      lineHeight: '140%'
    });
  });
});

describe('Admin Theme Configuration', () => {
  it('should have all custom typography variants defined', () => {
    const customVariants = [
      'customBold32',
      'customMedium22Tight',
      'customRegular20Tight',
      'customMedium18Tight',
      'customMedium18Loose',
      'customSemiBold18',
      'customRegular16',
      'customBold16',
      'customMedium16',
      'customItalic16',
      'customItalic14'
    ];

    customVariants.forEach((variant: string) => {
      expect((adminTheme.typography as any)[variant]).toBeDefined();
    });
  });

  it('should have correct variant mapping for custom typography', () => {
    const variantMapping = adminTheme.components?.MuiTypography?.defaultProps?.variantMapping;

    expect(variantMapping?.customBold32).toBe('p');
    expect(variantMapping?.customMedium22Tight).toBe('p');
    expect(variantMapping?.customRegular20Tight).toBe('p');
    expect(variantMapping?.customMedium18Tight).toBe('p');
    expect(variantMapping?.customMedium18Loose).toBe('p');
    expect(variantMapping?.customSemiBold18).toBe('p');
    expect(variantMapping?.customRegular16).toBe('p');
    expect(variantMapping?.customBold16).toBe('p');
    expect(variantMapping?.customMedium16).toBe('p');
    expect(variantMapping?.customItalic16).toBe('p');
    expect(variantMapping?.customItalic14).toBe('p');
  });

  it('should export AdminTheme type', () => {
    expect(typeof adminTheme).toBe('object');
    expect(adminTheme.typography).toBeDefined();
    expect(adminTheme.components).toBeDefined();
  });

  it('should have correct font families for custom variants', () => {
    const customBold32 = (adminTheme.typography as any).customBold32;
    const customItalic16 = (adminTheme.typography as any).customItalic16;

    expect(customBold32.fontFamily).toBeDefined();
    expect(customItalic16.fontFamily).toBeDefined();
  });
});