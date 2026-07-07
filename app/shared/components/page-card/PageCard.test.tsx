import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import PageCard from './PageCard';

jest.mock('~/utils/formatDate', () => ({
  formatDate: (date: string) => `formatted-${date}`
}));

jest.mock('~/shared/components/card-layout/CardMenu', () => {
  return {
    __esModule: true,
    default: React.forwardRef<HTMLDivElement, { anchorEl: unknown }>(function CardMenuMock(props, ref) {
      return <div ref={ref} data-testid="page-card-menu" data-open={Boolean(props.anchorEl)} />;
    })
  };
});

globalThis.ResizeObserver = jest.fn().mockImplementation((callback: () => void) => ({
  observe: jest.fn(() => callback()),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

describe('PageCard Component', () => {
  const mockProps = {
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
    updatedAt: '2025-02-01',
    editHref: '/edit-page',
    editSeoHref: '/edit-page-seo',
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
    const menuElement = screen.getByTestId('page-card-menu');

    expect(menuButton).toBeInTheDocument();
    expect(menuElement).toBeInTheDocument();
    expect(menuElement).toHaveAttribute('data-open', 'false');

    fireEvent.click(menuButton);

    expect(menuElement).toHaveAttribute('data-open', 'true');
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
        {...mockProps}
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

  it('falls back to english title and english alt when ukrainian versions are missing', () => {
    const fallbackProps = {
      ...mockProps,
      title: { en: 'English Title' },
      coverImage: {
        src: '/image.png',
        alt: { uk: '', en: 'English Alt' }
      }
    };

    render(<PageCard {...fallbackProps} />);

    expect(screen.getByText('English Title')).toBeInTheDocument();
    expect(screen.getByAltText('English Alt')).toBeInTheDocument();
  });

  it('falls back to empty title string and titleText for alt when both language objects are empty', () => {
    const emptyProps = {
      ...mockProps,
      title: {},
      coverImage: {
        src: '/image.png',
        alt: { uk: '', en: '' }
      }
    };

    const { container } = render(<PageCard {...emptyProps} />);

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
  });

  it('renders empty string for infoNode when updatedAt is not provided', () => {
    const noDateProps = {
      ...mockProps,
      updatedAt: undefined
    };

    const { container } = render(<PageCard {...noDateProps} />);

    const typographyElement = container.querySelector('.MuiTypography-caption');
    expect(typographyElement).toHaveTextContent('');
  });

  it('handles empty editHref by omitting link components and using onClick', () => {
    const mockOnClick = jest.fn();
    const noHrefProps = {
      ...mockProps,
      editHref: null as unknown as string,
      onClick: mockOnClick
    };

    render(<PageCard {...noHrefProps} />);

    const button = screen.getByRole('button', { name: 'Редагувати' });
    expect(button).not.toHaveAttribute('href');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
