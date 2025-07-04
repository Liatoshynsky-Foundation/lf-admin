import { render, screen } from '@testing-library/react';
import React from 'react';

import Footer from './Footer';

describe('Footer component', () => {
  it('should render the footer content', () => {
    render(<Footer />);
    expect(screen.getByText(/Footer/i)).toBeInTheDocument();
  });
});
