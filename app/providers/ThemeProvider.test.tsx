import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { Typography } from '@mui/material';

describe('ThemeProvider', () => {
  it('applies the adminTheme correctly', () => {
    render(
      <ThemeProvider>
        <Typography variant="customBold32">Test Theme</Typography>
      </ThemeProvider>
    );

    const element = screen.getByText('Test Theme');
    expect(element).toHaveStyle({
      fontWeight: 700,
      fontSize: '32px',
      lineHeight: '140%',
    });
  });

  it('renders children without crashing', () => {
    render(
      <ThemeProvider>
        <div>Child Component</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
