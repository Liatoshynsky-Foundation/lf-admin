import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { adminTheme } from './theme';
import { TypographyPropsVariantOverrides } from '@mui/material/Typography';
import { OverridableStringUnion } from '@mui/types';

type CustomVariant = OverridableStringUnion<keyof TypographyPropsVariantOverrides, {}>;

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
      letterSpacing: '0px',
    });
  });

  it('renders customMedium22Tight variant correctly', () => {
    const { getByText } = renderWithTheme('customMedium22Tight');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 500,
      fontSize: '22px',
      lineHeight: '135%',
    });
  });

  it('renders customItalic16 variant correctly', () => {
    const { getByText } = renderWithTheme('customItalic16');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontStyle: 'italic',
      fontSize: '16px',
      lineHeight: '140%',
    });
  });

  it('renders customItalic14 variant correctly', () => {
    const { getByText } = renderWithTheme('customItalic14');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontStyle: 'italic',
      fontSize: '14px',
      lineHeight: '140%',
    });
  });

  it('renders customMedium18Loose variant correctly', () => {
    const { getByText } = renderWithTheme('customMedium18Loose');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '155%',
    });
  });

  it('renders customSemiBold18 variant correctly', () => {
    const { getByText } = renderWithTheme('customSemiBold18');
    const element = getByText('Test');
    expect(element).toHaveStyle({
      fontWeight: 600,
      fontSize: '18px',
      lineHeight: '155%',
    });
  });
});
