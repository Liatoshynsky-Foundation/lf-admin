import { render, screen } from '@testing-library/react';
import React from 'react';

import Header from './Header';

describe('Header component', () => {
  it('renders the header content', () => {
    render(<Header />);
    expect(screen.getByText(/Header/i)).toBeInTheDocument();
  });
});
