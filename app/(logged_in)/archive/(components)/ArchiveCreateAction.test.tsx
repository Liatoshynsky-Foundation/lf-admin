import { render, screen } from '@testing-library/react';
import React from 'react';

import { ArchiveCreateAction } from './ArchiveCreateAction';

jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="plus-icon" />
}));

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, startIcon, ...props }: any) => {
    return (
      <a data-testid="mock-button" {...props}>
        {startIcon && <span className="start-icon">{startIcon}</span>}
        {children}
      </a>
    );
  }
}));

describe('ArchiveCreateAction', () => {
  it('should render <a> instead of a button and propagate all props correctly', () => {
    render(<ArchiveCreateAction />);

    const buttonElement = screen.getByTestId('mock-button');
    
    expect(buttonElement).toHaveAttribute('variant', 'filled');
    expect(buttonElement.tagName.toLowerCase()).toBe('a');
    expect(buttonElement).toHaveAttribute('href', '/archive/create');
    expect(buttonElement).toHaveAttribute('color', 'primary');

    expect(buttonElement).toHaveTextContent('Додати фонд');
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });
});
