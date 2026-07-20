import { Box, Button, Divider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ActionMenuGroups, MenuGroup, MenuItemConfig } from '../../dropdown-menu/ActionMenu';
import { ContextMenu } from './ContextMenu';

interface MockActionMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  menuItems: ActionMenuGroups;
}

jest.mock('../../dropdown-menu/ActionMenu', () => ({
  __esModule: true,
  default: ({ anchorEl, onClose, menuItems }: MockActionMenuProps) =>
    anchorEl ? (
      <Box data-testid="mock-action-menu" onClick={onClose}>
        {menuItems.map((group: MenuGroup, groupIndex: number) => (
          <Box key={groupIndex} data-testid="menu-group">
            {group.title && <Box>{group.title}</Box>}
            {group.items.map((item: MenuItemConfig) => (
              <Button key={item.id} onClick={item.onClick}>
                {item.text.name}
              </Button>
            ))}
            {groupIndex < menuItems.length - 1 && <Divider data-testid="menu-divider" />}
          </Box>
        ))}
      </Box>
    ) : null
}));

describe('ContextMenu', () => {
  const mockOnClick = jest.fn();

  const mockItems = [
    {
      title: 'Actions',
      items: [
        { id: 'edit', text: { name: 'Edit' }, onClick: mockOnClick },
        { id: 'delete', text: { name: 'Delete' }, href: '/works/1/delete' }
      ]
    }
  ];
  const mockTriggerLabel = 'Actions for the item';

  beforeEach(() => {
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
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

    expect(screen.queryByTestId('mock-action-menu')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByTestId('mock-action-menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    expect(screen.getByText(mockItems[0].items[0].text.name)).toBeInTheDocument();
    expect(screen.getByText(mockItems[0].items[1].text.name)).toBeInTheDocument();
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it('should call item onClick when an item is clicked', () => {
    render(<ContextMenu items={mockItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);
    fireEvent.click(trigger);

    const menuItem = screen.getByText(mockItems[0].items[0].text.name);
    fireEvent.click(menuItem);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should close the menu when onClose is triggered (e.g. backdrop click)', () => {
    render(<ContextMenu items={mockItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);
    fireEvent.click(trigger);

    expect(screen.getByTestId('mock-action-menu')).toBeInTheDocument();

    const menu = screen.getByTestId('mock-action-menu');
    fireEvent.click(menu);

    expect(screen.queryByTestId('mock-action-menu')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render a divider between item groups', () => {
    const multiGroupItems = [
      {
        items: [
          { id: 'edit', text: { name: 'Edit' } },
          { id: 'share', text: { name: 'Share' } }
        ]
      },
      {
        items: [{ id: 'delete', text: { name: 'Delete' } }]
      }
    ];

    render(<ContextMenu items={multiGroupItems} triggerLabel={mockTriggerLabel} />);

    const trigger = screen.getByLabelText(mockTriggerLabel);
    fireEvent.click(trigger);

    const divider = screen.getByTestId('menu-divider');
    expect(divider).toBeInTheDocument();
  });
});
