import { useTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';

import { ThemeProvider } from './ThemeProvider';

const ThemeConsumer = () => {
  const theme = useTheme();

  return (
    <div>
      <span data-testid="h4-weight">{theme.typography.h4?.fontWeight}</span>
      <span data-testid="h4-size">{theme.typography.h4?.fontSize}</span>
      <span data-testid="bodyMd-size">{theme.typography.bodyMd?.fontSize}</span>
      <span data-testid="textSm-size">{theme.typography.textSm?.fontSize}</span>
    </div>
  );
};

describe('ThemeProvider', () => {
  it('should render children components', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should successfully pass custom adminTheme down the context tree', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('h4-weight')).toHaveTextContent('700');
    expect(screen.getByTestId('h4-size')).toHaveTextContent('32px');

    expect(screen.getByTestId('bodyMd-size')).toHaveTextContent('20px');
    expect(screen.getByTestId('textSm-size')).toHaveTextContent('14px');
  });
});
