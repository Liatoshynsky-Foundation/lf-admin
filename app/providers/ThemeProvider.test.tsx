import { Typography } from '@mui/material';
import { render, screen } from '@testing-library/react';

import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('should render children components', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should apply the adminTheme to children components', () => {
    render(
      <ThemeProvider>
        <Typography variant="customBold32">Themed Text</Typography>
      </ThemeProvider>
    );

    const textElement = screen.getByText('Themed Text');
    const styles = window.getComputedStyle(textElement);

    expect(styles.fontWeight).toBe('700');
    expect(styles.fontSize).toBe('32px');
    expect(styles.lineHeight).toBe('140%');
  });

  test('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});