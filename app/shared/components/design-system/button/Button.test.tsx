import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Button from './Button';

describe('Button Component', () => {
  const startIcon = <span data-testid="start-icon">▲</span>;
  const endIcon = <span data-testid="end-icon">▼</span>;

  test('should display icons when provided', () => {
    render(
      <Button startIcon={startIcon} endIcon={endIcon}>
        Icons
      </Button>
    );

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  test('should loading state disables interaction and shows loader', () => {
    const handleClick = jest.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading
      </Button>
    );

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
