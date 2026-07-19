import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { ResearchCreateAction } from './ResearchCreateAction';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('ResearchCreateAction', () => {
  it('renders the button label', () => {
    render(<ResearchCreateAction />);

    expect(screen.getByText('+ Додати роботу')).toBeInTheDocument();
  });

  it('links to the research create page', () => {
    render(<ResearchCreateAction />);

    const link = screen.getByText('+ Додати роботу').closest('a');

    expect(link).toHaveAttribute('href', '/research/create');
  });
});
