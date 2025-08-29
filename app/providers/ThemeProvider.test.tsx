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

  it('should provide theme context to nested components', () => {
    const TestComponent = () => {
      return (
        <Typography variant="customMedium18Tight" data-testid="themed-component">
          Nested Component
        </Typography>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themedElement = screen.getByTestId('themed-component');
    expect(themedElement).toBeInTheDocument();

    const styles = window.getComputedStyle(themedElement);
    expect(styles.fontSize).toBe('18px');
    expect(styles.fontWeight).toBe('500');
  });

  it('should handle multiple nested children', () => {
    render(
      <ThemeProvider>
        <div>
          <Typography variant="customRegular16">First Child</Typography>
          <Typography variant="customItalic14">Second Child</Typography>
        </div>
      </ThemeProvider>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();

    const firstChild = screen.getByText('First Child');
    const secondChild = screen.getByText('Second Child');

    const firstStyles = window.getComputedStyle(firstChild);
    const secondStyles = window.getComputedStyle(secondChild);

    expect(firstStyles.fontSize).toBe('16px');
    expect(firstStyles.fontWeight).toBe('400');

    expect(secondStyles.fontSize).toBe('14px');
    expect(secondStyles.fontStyle).toBe('italic');
  });
});
