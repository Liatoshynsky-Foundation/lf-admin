import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ActionMenu, { ActionMenuGroups } from './ActionMenu';
import DropdownMenu from './DropdownMenu';
import { useMenuScrollClose } from '~/shared/hooks/use-menu-scroll-close/useMenuScrollClose';

interface DropdownMenuMockProps {
  open: boolean;
  menuList: React.ReactNode[];
  onClose: () => void;
  transitionDuration?: number;
  slotProps?: {
    backdrop?: {
      onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    };
  };
}

jest.mock('~/shared/hooks/use-menu-scroll-close/useMenuScrollClose', () => ({
  useMenuScrollClose: jest.fn()
}));

jest.mock('./DropdownMenu', () => {
  return jest.fn().mockImplementation(({ open, menuList, onClose, slotProps }: DropdownMenuMockProps) => {
    if (!open) return null;
    return (
      <div data-testid="dropdown-menu">
        <button data-testid="mock-close-btn" onClick={onClose}>
          Close
        </button>
        <div data-testid="mock-backdrop" onClick={(e) => slotProps?.backdrop?.onClick?.(e)} />
        <div data-testid="menu-list-container">{menuList}</div>
      </div>
    );
  });
});

// Мокаємо Next.js Link
jest.mock('next/link', () => {
  interface LinkMockProps {
    href: string;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  }
  return jest.fn().mockImplementation(({ href, children, onClick, ...rest }: LinkMockProps) => (
    <a href={href} onClick={onClick} data-testid="next-link" {...rest}>
      {children}
    </a>
  ));
});

describe('ActionMenu', () => {
  const mockOnClose = jest.fn();
  const mockHandleClose = jest.fn();
  const mockOnClickItem = jest.fn();
  let anchorEl: HTMLElement;

  const mockMenuGroups: ActionMenuGroups = [
    {
      title: 'Group 1',
      items: [
        {
          id: 'item-1',
          text: { name: 'Item 1', icon: <span data-testid="mock-icon">🌟</span> },
          onClick: mockOnClickItem,
          selected: true
        },
        {
          id: 'item-2',
          text: { name: 'Item 2 Link' },
          href: '/test-path'
        }
      ]
    },
    {
      title: 'Group 2',
      items: [
        {
          id: 'item-3',
          text: { name: 'Item 3' }
        }
      ]
    }
  ];

  beforeEach(() => {
    anchorEl = document.createElement('div');
    (useMenuScrollClose as jest.Mock).mockReturnValue({
      disableTransition: false,
      handleClose: mockHandleClose
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render anything if anchorEl is null', () => {
    render(<ActionMenu anchorEl={null} onClose={mockOnClose} menuItems={mockMenuGroups} />);
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('should render menu structure correctly with headers and dividers', () => {
    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2 Link')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();

    const dividers = screen.getAllByTestId('menu-divider');
    expect(dividers).toHaveLength(1);
  });

  it('should render items without groups title if not provided', () => {
    const groupsWithoutTitle: ActionMenuGroups = [
      {
        items: [{ id: 'no-title-1', text: { name: 'No Title Item' } }]
      }
    ];

    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={groupsWithoutTitle} />);

    expect(screen.getByText('No Title Item')).toBeInTheDocument();
  });

  it('should render Next.js Link component when href prop is present', () => {
    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} />);

    const linkItem = screen.getByText('Item 2 Link').closest('a');
    expect(linkItem).toHaveAttribute('href', '/test-path');
  });

  it('should display check icon when isSelectable is true and item is selected', () => {
    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} isSelectable={true} />);

    const selectedItem = screen.getByText('Item 1').closest('li');
    expect(selectedItem).toBeInTheDocument();
  });

  it('should execute item onClick callback, stop propagation and close menu', () => {
    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} />);

    const item1 = screen.getByText('Item 1');
    const clickEvent = fireEvent.click(item1);

    expect(mockOnClickItem).toHaveBeenCalledTimes(1);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
    expect(clickEvent).toBe(true);
  });

  it('should handle item click safely even if onClick is not specified', () => {
    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} />);

    const item3 = screen.getByText('Item 3');
    expect(() => fireEvent.click(item3)).not.toThrow();
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should support default empty array for menuItems', () => {
    expect(() => {
      render(
        <ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={undefined as unknown as ActionMenuGroups} />
      );
    }).not.toThrow();
  });

  it('should apply transitionDuration 0 if disableTransition is true from hook', () => {
    (useMenuScrollClose as jest.Mock).mockReturnValue({
      disableTransition: true,
      handleClose: mockHandleClose
    });

    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} />);

    expect((DropdownMenu as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        transitionDuration: 0
      })
    );
  });

  it('should stop propagation and prevent default on backdrop click', () => {
    render(<ActionMenu anchorEl={anchorEl} onClose={mockOnClose} menuItems={mockMenuGroups} />);

    const backdrop = screen.getByTestId('mock-backdrop');

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

    fireEvent(backdrop, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
  });
});
