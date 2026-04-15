import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';

import ContentCard, { ContentType } from './ContentCard';

jest.mock('~/lib/utils/formatDate', () => ({
  formatDate: (date: string) => `formatted-${date}`
}));

jest.mock('../design-system/button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    onClick
  }: {
    children: ReactNode;
    href?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
  }) => (href ? <a href={href}>{children}</a> : <button onClick={onClick}>{children}</button>)
}));

jest.mock('./ContentCardBadge', () => ({
  __esModule: true,
  default: () => <div data-testid="badge" />
}));

describe('ContentCard', () => {
  const defaultProps = {
    type: 'news' as ContentType,
    coverImage: {
      src: {
        uk: '/image.png',
        en: '/image.png'
      },
      alt: {
        uk: 'Image UA',
        en: 'Image EN'
      }
    },
    title: {
      uk: 'Test title',
      en: 'Test title EN'
    },
    status: 'draft',
    createdAt: '2024-01-01',
    onClick: jest.fn(),
    onClickMenu: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render title', () => {
    render(<ContentCard {...defaultProps} />);

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });

  it('should render badge component', () => {
    render(<ContentCard {...defaultProps} />);

    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('should display draft status with created date', () => {
    render(<ContentCard {...defaultProps} />);

    expect(screen.getByText('Створено formatted-2024-01-01')).toBeInTheDocument();
  });

  it('should display published status with updated date', () => {
    render(<ContentCard {...defaultProps} status="published" updatedAt="2024-02-01" />);

    expect(screen.getByText('Редаговано formatted-2024-02-01')).toBeInTheDocument();
  });

  it('should display published status with published date', () => {
    render(<ContentCard {...defaultProps} status="published" publishedAt="2024-03-01" />);

    expect(screen.getByText('Опубліковано formatted-2024-03-01')).toBeInTheDocument();
  });

  it('should call onClick when edit button is clicked', () => {
    render(<ContentCard {...defaultProps} />);

    fireEvent.click(screen.getByText('Редагувати'));

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('should render edit button as link when href is provided', () => {
    render(<ContentCard {...defaultProps} editHref="/publications/news/test-slug/edit" />);

    expect(screen.getByRole('link', { name: 'Редагувати' })).toHaveAttribute(
      'href',
      '/publications/news/test-slug/edit'
    );
  });

  it('should call onClickMenu when menu icon is clicked', () => {
    render(<ContentCard {...defaultProps} />);

    const menuButton = screen.getByTestId('menu-button');

    fireEvent.click(menuButton);

    expect(defaultProps.onClickMenu).toHaveBeenCalledTimes(1);
  });

  it('should render image with correct src and alt', () => {
    render(<ContentCard {...defaultProps} />);

    const img = screen.getByAltText('Image UA');

    expect(img).toHaveAttribute('src', '/image.png');
    expect(img).toHaveAttribute('alt', 'Image UA');
  });

  it('should fallback to default image when cover image fails to load', () => {
    render(
      <ContentCard
        {...defaultProps}
        coverImage={{
          src: '/news-mock-images/image1.jpg',
          alt: {
            uk: 'Broken image',
            en: 'Broken image'
          }
        }}
      />
    );

    const img = screen.getByAltText('Broken image');

    fireEvent.error(img);

    expect(img).toHaveAttribute('src', '/images/image.png');
  });
});
