import { fireEvent,render, screen } from '@testing-library/react';

import ContentCardMenu from './ContentCardMenu';

// 🔧 mock router
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe('ContentCardMenu', () => {
  const defaultProps = {
    id: '1',
    type: 'news' as any,
    anchorEl: document.createElement('div'),
    onClose: jest.fn(),
    slug: 'test-slug',
    setDeleteModalOpen: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render menu items', () => {
    render(<ContentCardMenu {...defaultProps} />);

    expect(screen.getByText('Мовні версії')).toBeInTheDocument();
    expect(screen.getByText('Англійська')).toBeInTheDocument();
    expect(screen.getByText('Українська')).toBeInTheDocument();
    expect(screen.getByText('SEO налаштування')).toBeInTheDocument();
    expect(screen.getByText('Видалити')).toBeInTheDocument();
  });

  it('should navigate to english version', () => {
    render(<ContentCardMenu {...defaultProps} editHref="/edit" />);

    fireEvent.click(screen.getByText('Англійська'));

    expect(pushMock).toHaveBeenCalledWith('/edit/en');
  });

  it('should navigate to ukrainian version', () => {
    render(<ContentCardMenu {...defaultProps} editHref="/edit" />);

    fireEvent.click(screen.getByText('Українська'));

    expect(pushMock).toHaveBeenCalledWith('/edit/ua');
  });

  it('should call onClose if editHref is not provided', () => {
    render(<ContentCardMenu {...defaultProps} />);

    fireEvent.click(screen.getByText('Англійська'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should navigate to SEO page', () => {
    render(<ContentCardMenu {...defaultProps} />);

    fireEvent.click(screen.getByText('SEO налаштування'));

    expect(pushMock).toHaveBeenCalledWith('/publications/news/test-slug/seo');
  });

  it('should open delete modal', () => {
    render(<ContentCardMenu {...defaultProps} />);

    fireEvent.click(screen.getByText('Видалити'));

    expect(defaultProps.setDeleteModalOpen).toHaveBeenCalledWith(true);
  });
});
