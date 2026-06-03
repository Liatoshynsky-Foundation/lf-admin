import { fireEvent, render, screen } from '@testing-library/react';

import PageCardMenu from './PageCardMenu';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe('PageCardMenu', () => {
  const defaultProps = {
    id: '1',
    anchorEl: document.createElement('div'),
    onClose: jest.fn(),
    slug: 'test-slug'
  };

  const testUrl = '/main-page';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render menu items', () => {
    render(<PageCardMenu {...defaultProps} />);
    expect(screen.getByText('Редагувати SEO')).toBeInTheDocument();
  });

  it('should navigate to SEO page', () => {
    render(<PageCardMenu {...defaultProps} />);

    fireEvent.click(screen.getByText('Редагувати SEO'));

    expect(pushMock).toHaveBeenCalledWith(testUrl);
  });
});
