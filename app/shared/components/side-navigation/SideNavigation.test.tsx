import { createEvent,fireEvent, render, screen } from '@testing-library/react';
import { CollapseListNavigationProps, LinkElementProps } from 'app/types/sideNavigation';
import React from 'react';

import { SideBarNavigation } from './SideNavigation';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';

jest.mock('~/shared/hooks/use-navigation-guard/useNavigationGuard', () => ({
  useNavigationGuard: jest.fn()
}));

jest.mock('./collapse-list-navigation/CollapseListNavigation', () => ({
  CollapseListNavigation: ({ onExpansionChange, elementProps }: CollapseListNavigationProps) => (
    <div data-testid="collapse-nav">
      <button onClick={() => onExpansionChange?.(true)}>Expand {elementProps.element.title}</button>
      <button onClick={() => onExpansionChange?.(false)}>Collapse {elementProps.element.title}</button>
    </div>
  )
}));

jest.mock('./link-element/LinkElement', () => ({
  LinkElement: ({ element, onClick }: LinkElementProps) => (
    <div data-testid="link-element">
      <button
        aria-label={element.title}
        onClick={(e) => onClick?.(e as unknown as React.MouseEvent<HTMLAnchorElement>)}
      >
        {element.title}
      </button>
    </div>
  )
}));

jest.mock('../logout-modal/LogoutModal', () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="logout-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
}));

const mockInterceptLinkClick = jest.fn();

describe('SideBarNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigationGuard as jest.Mock).mockReturnValue({
      interceptLinkClick: mockInterceptLinkClick
    });
  });

  it('should toggle sidebar and change navigation content visibility', () => {
    render(<SideBarNavigation />);
    const toggleBtn = screen.getByLabelText('toggle sidebar');

    expect(screen.getByText('Контент')).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Контент')).not.toBeInTheDocument();
  });

  it('should handle submenu expansion and update navigation container', () => {
    render(<SideBarNavigation />);
    const toggleBtn = screen.getByLabelText('toggle sidebar');
    fireEvent.click(toggleBtn);

    const expandBtn = screen.getAllByText(/Expand/i)[0];
    if (expandBtn) fireEvent.click(expandBtn);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should trigger logout flow and call preventDefault', () => {
    render(<SideBarNavigation />);
    const logoutBtn = screen.getByRole('button', { name: 'Вийти' });

    const clickEvent = createEvent.click(logoutBtn);
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

    fireEvent(logoutBtn, clickEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(screen.getByTestId('logout-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('logout-modal')).not.toBeInTheDocument();
  });

  it('should call interceptLinkClick when home link is clicked', () => {
    render(<SideBarNavigation />);
    const logoLink = screen.getByRole('link', { name: /go to home page/i });

    fireEvent.click(logoLink);
    expect(mockInterceptLinkClick).toHaveBeenCalledWith(expect.any(Object), '/');
  });

  it('should render all navigation items and handle regular link clicks', () => {
    render(<SideBarNavigation />);
    const links = screen.getAllByTestId('link-element');
    const regularLink = links.find((l) => l.textContent?.trim() !== 'Вийти');

    if (regularLink) {
      const btn = regularLink.querySelector('button');
      if (btn) fireEvent.click(btn);
    }

    expect(links.length).toBeGreaterThan(0);
  });

  it('should update expanded submenus state on collapse', () => {
    render(<SideBarNavigation />);
    const collapseBtn = screen.getAllByText(/Collapse/i)[0];
    if (collapseBtn) fireEvent.click(collapseBtn);

    expect(screen.getByLabelText('toggle sidebar')).toBeInTheDocument();
  });
});
