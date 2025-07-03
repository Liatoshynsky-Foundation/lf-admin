import { render, screen } from '@testing-library/react';
import React from 'react';

import RootLayout from './layout';

describe('RootLayout component', () => {
  it('should render the header, footer, and children', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(screen.getByText(/Header/i)).toBeInTheDocument();
    expect(screen.getByText(/Footer/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Child/i)).toBeInTheDocument();
  });

  it('should applie the container styling', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const muiContainer = container.querySelector('[class*="MuiContainer-root"]');
    expect(muiContainer).toBeTruthy();
  });
});
