import { fireEvent, render, screen } from '@testing-library/react';

import CardMenu from './CardMenu';

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('../dropdown-menu/DropdownMenu', () => {
  const MockDropdownMenu = ({ menuList, open }: any) => {
    if (!open) return null;
    return <ul data-testid="dropdown">{menuList}</ul>;
  };
  MockDropdownMenu.displayName = 'MockDropdownMenu';
  return MockDropdownMenu;
});

describe('CardMenu', () => {
  const onClose = jest.fn();
  const onClick = jest.fn();

  const menuItems = [
    {
      text: { name: 'Edit', icon: <span>EditIcon</span> },
      onClick
    },
    {
      text: { name: 'Open' },
      href: '/open'
    }
  ];

  const renderComponent = (anchorEl: HTMLElement | null = document.body) => {
    return render(<CardMenu anchorEl={anchorEl} onClose={onClose} menuItems={menuItems} menuDirection="right" />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders menu items', () => {
    renderComponent();

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('calls item onClick and onClose when clicking item', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Edit'));

    expect(onClick).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('renders link item correctly', () => {
    renderComponent();

    const link = screen.getByText('Open').closest('a');

    expect(link).toHaveAttribute('href', '/open');
  });

  it('stops propagation on item click', () => {
    renderComponent();

    const event = fireEvent.click(screen.getByText('Edit'));

    expect(event).toBe(true);
    expect(onClick).toHaveBeenCalled();
  });

  it('does not crash when no icon is provided', () => {
    renderComponent();

    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
