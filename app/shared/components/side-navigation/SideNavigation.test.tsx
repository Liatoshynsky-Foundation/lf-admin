import { fireEvent, render, screen } from '@testing-library/react';

import { SideBarNavigation } from './SideNavigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/'
}));

describe('Side Navigation', () => {
  beforeEach(() => {
    render(<SideBarNavigation />);
  });

  it('toggles the sidebar only from the toggle button', () => {
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i });

    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home page/i })).toHaveAttribute('href', '/');

    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Контент')).not.toBeInTheDocument();
    expect(screen.queryByText('Інше')).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Контент')).toBeInTheDocument();
    expect(screen.queryByText('Інше')).toBeInTheDocument();
  });

  it('renders the logo as a home link instead of a button', () => {
    expect(screen.getByRole('link', { name: /go to home page/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logo/i })).not.toBeInTheDocument();
  });
});
