import { fireEvent, render, screen } from '@testing-library/react';

import { SideBarNavgation } from './SideNavigation';

describe('Side Navigation', () => {
  beforeEach(() => {
    render(<SideBarNavgation />);
  });

  it('should render side navigation open', () => {
    expect(screen.getByAltText('logo')).toBeInTheDocument();
    expect(screen.getByAltText('close button')).toBeInTheDocument();
    expect(screen.getByText('Сторінки сайту')).toBeInTheDocument();
    expect(screen.getByText('Налаштування сайту')).toBeInTheDocument();
  });

  it('should close the navigation', () => {
    const closeBtn = screen.getByAltText('close button');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Сторінки сайту')).not.toBeInTheDocument();
  });

  it('should work with togging logo', () => {
    const logo = screen.getByAltText('logo');

    fireEvent.click(logo);
    expect(screen.queryByText('Сторінки сайту')).not.toBeInTheDocument();

    fireEvent.click(logo);
    expect(screen.getByText('Сторінки сайту')).toBeInTheDocument();
  });
});
