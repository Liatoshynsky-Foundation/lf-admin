import { Box } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { EditAction } from './EditAction';

describe('EditAction', () => {
  const mockProps = {
    href: '/works/123/edit',
    label: 'Редагувати твір "Симфонія №5"'
  };

  it('should render the edit button with correct link and accessibility label', () => {
    render(<EditAction href={mockProps.href} label={mockProps.label} />);

    const button = screen.getByRole('link', { name: mockProps.label });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', mockProps.href);
  });

  it('should call stopPropagation on click to prevent event bubbling', () => {
    const handleParentClick = jest.fn();

    render(
      <Box data-testid="parent-container">
        <EditAction href={mockProps.href} label={mockProps.label} />
      </Box>
    );

    const button = screen.getByRole('link', { name: mockProps.label });
    fireEvent.click(button);

    expect(handleParentClick).not.toHaveBeenCalled();
  });
});
