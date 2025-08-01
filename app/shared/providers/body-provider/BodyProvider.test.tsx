import 'whatwg-fetch';
import { render, screen } from '@testing-library/react';
import React from 'react';

import BodyProvider from './BodyProvider';

describe('BodyProvider', () => {
  it('should render children correctly', () => {
    render(
      <BodyProvider>
        <div data-testid="child">Test Child</div>
      </BodyProvider>
    );

    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Child');
  });
});
