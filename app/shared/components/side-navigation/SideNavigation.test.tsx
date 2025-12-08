import { fireEvent, render, screen } from '@testing-library/react';

import { SideBarNavigation } from './SideNavigation';

describe('Side Navigation', () => {
  beforeEach(() => {
    render(<SideBarNavigation />);
  });

  it('should work with togging logo', () => {
    const logoBtn = screen.getByRole('button', { name: /logo/i });
    const closeBtn = screen.getByRole('button', { name: /close button/i });

    expect(logoBtn).toBeInTheDocument();
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(screen.queryByText('Контент')).not.toBeInTheDocument();
    expect(screen.queryByText('Інше')).not.toBeInTheDocument();

    fireEvent.click(logoBtn);
    expect(screen.queryByText('Контент')).toBeInTheDocument();
    expect(screen.queryByText('Інше')).toBeInTheDocument();

    fireEvent.click(logoBtn);
    expect(screen.queryByText('Контент')).not.toBeInTheDocument();
    expect(screen.queryByText('Інше')).not.toBeInTheDocument();
  });
});
