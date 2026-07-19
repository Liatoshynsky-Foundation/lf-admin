import { fireEvent, render, screen } from '@testing-library/react';

import { LinkElement } from './LinkElement';
import { useNavigationGuard } from '~/shared/hooks/use-navigation-guard/useNavigationGuard';

jest.mock('~/shared/hooks/use-navigation-guard/useNavigationGuard', () => ({
  useNavigationGuard: jest.fn()
}));

jest.mock('../list-element/ListElement', () => ({
  ListElement: () => <div data-testid="list-element" />
}));

const mockInterceptLinkClick = jest.fn();

describe('LinkElement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigationGuard as jest.Mock).mockReturnValue({
      interceptLinkClick: mockInterceptLinkClick
    });
  });

  it('should render with a link to homepage without href', () => {
    render(<LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg' }} />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('should render with a link with href', () => {
    render(<LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg', href: '/test' }} />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should call custom onClick prop when provided', () => {
    const mockOnClick = jest.fn();
    render(
      <LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg', href: '/test' }} onClick={mockOnClick} />
    );

    fireEvent.click(screen.getByRole('link'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockInterceptLinkClick).not.toHaveBeenCalled();
  });

  it('should call interceptLinkClick when onClick prop is not provided', () => {
    const href = '/navigation-test';
    render(<LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg', href }} />);

    fireEvent.click(screen.getByRole('link'));

    expect(mockInterceptLinkClick).toHaveBeenCalledWith(expect.any(Object), href);
  });

  it('should use default href "/" for interceptLinkClick if element.href is missing', () => {
    render(<LinkElement open element={{ title: 'TestTitle', iconSrc: 'icon.svg' }} />);

    fireEvent.click(screen.getByRole('link'));

    expect(mockInterceptLinkClick).toHaveBeenCalledWith(expect.any(Object), '/');
  });
});
