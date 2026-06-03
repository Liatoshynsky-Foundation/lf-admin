import { fireEvent, render, screen } from '@testing-library/react';

import PageCard from './PageCard';

jest.mock('~/lib/utils/formatDate', () => ({
  formatDate: (date: string) => `formatted-${date}`
}));

jest.mock('./PageCardMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="page-card-menu" />
}));

describe('PageCard Component', () => {
  const mockProps = {
    id: '1',
    slug: 'test-slug',
    coverImage: {
      src: '/image.png',
      alt: {
        uk: 'Image page',
        en: 'Image page EN'
      }
    },
    title: {
      uk: 'Test page title',
      en: 'Test page title EN'
    },
    status: 'draft',
    updatedAt: '2025-02-01',
    onClick: jest.fn()
  };

  const editHref = '/mock-url';

  it('renders localized title and updated date correctly', () => {
    render(<PageCard {...mockProps} />);

    expect(screen.getByText('Test page title')).toBeInTheDocument();
    expect(screen.getByText('Змінено formatted-2025-02-01')).toBeInTheDocument();
  });

  it('triggers menu interaction when action dropdown is clicked', () => {
    render(<PageCard {...mockProps} />);

    const menuButton = screen.getByTestId('menu-button');
    expect(screen.queryByTestId('page-card-menu')).not.toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(screen.getByTestId('page-card-menu')).toBeInTheDocument();
  });

  it('should render edit button as link when href is provided', () => {
    render(<PageCard {...mockProps} editHref={editHref} />);

    expect(screen.getByRole('link', { name: 'Редагувати' })).toHaveAttribute('href', editHref);
  });

  it('displays image preview with proper accessible text', () => {
    render(<PageCard {...mockProps} />);

    const renderedImg = screen.getByAltText('Image page');
    expect(renderedImg).toHaveAttribute('src', '/image.png');
  });

  it('reverts image source to secure fallback layout on loading issue', () => {
    render(
      <PageCard
        title={{ uk: 'Тест' }}
        coverImage={{
          src: '/broken-link.jpg',
          alt: { uk: 'Broken blueprint', en: 'Broken blueprint ENG' }
        }}
      />
    );

    const imageElement = screen.getByAltText('Broken blueprint');
    fireEvent.error(imageElement);

    expect(imageElement).toHaveAttribute('src', '/images/image.png');
  });
});
