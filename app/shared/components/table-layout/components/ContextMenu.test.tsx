import { Box } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ContextMenu } from './ContextMenu';

jest.mock('../../dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList, slotProps }: any) =>
    open ? (
      <Box data-testid="mock-dropdown" onClick={(e) => slotProps?.backdrop?.onClick?.(e)}>
        <Box data-testid="menu-items-container">{menuList}</Box>
      </Box>
    ) : null
}));

describe('ContextMenu', () => {
  const mockOnClick = jest.fn();

  const mockItems = [
    [
      { id: 'edit', label: 'Edit', onClick: mockOnClick },
      { id: 'delete', label: 'Delete', href: '/works/1/delete' }
    ]
  ];
  const mockTriggerLabel = 'Actions for the item';

  beforeEach(() => {
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: any) => cb());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render trigger element correctly with correct aria attributes', () => {
    render(<ContextMenu items={mockItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should open the menu and render items on click, preventing stopPropagation', () => {
    const handleParentClick = jest.fn();

    render(
      <Box onClick={handleParentClick}>
        <ContextMenu items={mockItems} triggerLabel={mockTriggerLabel} />
      </Box>
    );

    const trigger = screen.getByLabelText(mockTriggerLabel);

    expect(screen.queryByTestId('mock-dropdown')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByTestId('mock-dropdown')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    expect(screen.getByText(mockItems[0][0].label)).toBeInTheDocument();
    expect(screen.getByText(mockItems[0][1].label)).toBeInTheDocument();
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it('should call item onClick, close the menu and return focus when an item is clicked', () => {
    render(<ContextMenu items={mockItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);
    fireEvent.click(trigger);

    const menuItem = screen.getByText(mockItems[0][0].label);
    fireEvent.click(menuItem);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('mock-dropdown')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should call stopPropagation and preventDefault when backdrop is clicked', () => {
    render(<ContextMenu items={mockItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);
    fireEvent.click(trigger);

    const dropdown = screen.getByTestId('mock-dropdown');
    const clickEvent = fireEvent.click(dropdown);

    expect(clickEvent).toBe(false);
  });

  it('should render a divider between item groups', () => {
    const multiGroupItems = [
      [
        { id: 'edit', label: 'Edit' },
        { id: 'share', label: 'Share' }
      ],
      [{ id: 'delete', label: 'Delete' }]
    ];

    render(<ContextMenu items={multiGroupItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);
    fireEvent.click(trigger);

    const divider = screen.getByTestId('menu-divider');
    expect(divider).toBeInTheDocument();
  });
});
