import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';

import PageCard from './PageCard';

jest.mock('~/lib/utils/formatDate', () => ({
  formatDate: (date: string) => `formatted-${date}`
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn()
  })
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

describe('PageCard', () => {
  const defaultProps = {
    id: '1',
    slug: 'test-slug',
    coverImage: {
      src: '/image.png',
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
    updatedAt: '2024-02-01',
    onClick: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render title', () => {
    render(<PageCard {...defaultProps} />);

    expect(screen.getByText('Test title')).toBeInTheDocument();
  });

  it('should display draft status', () => {
    render(<PageCard {...defaultProps} />);

    expect(screen.getByText('Змінено formatted-2024-02-01')).toBeInTheDocument();
  });

  it('should call onClick when edit button is clicked', () => {
    render(<PageCard {...defaultProps} />);

    fireEvent.click(screen.getByText('Редагувати'));

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('should render edit button as link when href is provided', () => {
    render(<PageCard {...defaultProps} editHref="/about-us" />);

    expect(screen.getByRole('link', { name: 'Редагувати' })).toHaveAttribute('href', '/about-us');
  });

  it('should render image with correct src and alt', () => {
    render(<PageCard {...defaultProps} />);

    const img = screen.getByAltText('Image UA');

    expect(img).toHaveAttribute('src', '/image.png');
    expect(img).toHaveAttribute('alt', 'Image UA');
  });

  it('should fallback to default image when cover image fails to load', () => {
    render(
      <PageCard
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
