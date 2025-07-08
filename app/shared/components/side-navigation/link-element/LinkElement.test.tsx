import { render, screen } from '@testing-library/react';

import { LinkElement } from './LinkElement';

describe('Link element', () => {
  it('should render with a link to homepage without href', () => {
    render(<LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg' }} />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
  it('should render with a link with href', () => {
    render(<LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg', href: '/test' }} />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });
});
