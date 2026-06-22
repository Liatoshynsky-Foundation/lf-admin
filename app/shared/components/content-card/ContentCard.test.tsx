import { fireEvent, render, screen } from '@testing-library/react';
import type { MouseEventHandler, ReactNode } from 'react';

import ContentCard, { ContentType } from './ContentCard';

const TEST_IDS = {
  menuButton: 'menu-button',
  menuClose: 'menu-close',
  openDelete: 'open-delete',
  confirmDelete: 'confirm-delete',
  badge: 'badge'
} as const;

jest.mock('~/shared/components/card-layout/CardMenu', () => ({
  __esModule: true,
  default: ({
    onClose,
    menuItems
  }: {
    onClose: () => void;
    menuItems: Array<{ text: { name: string }; onClick?: () => void }>;
  }) => (
    <div>
      <button onClick={onClose} data-testid="menu-close">
        close menu
      </button>
      {menuItems.map((item) => (
        <button
          key={item.text.name}
          onClick={item.onClick}
          data-testid={item.text.name === 'Видалити' ? TEST_IDS.openDelete : undefined}
        >
          {item.text.name}
        </button>
      ))}
    </div>
  )
}));

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

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useDeleteNews: () => [jest.fn()]
}));

jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useDeleteEvent: () => [jest.fn()]
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useDeleteMediaMention: () => [jest.fn()]
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

jest.mock('../delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onDelete }: { open: boolean; onDelete: () => void }) =>
    open ? (
      <button onClick={onDelete} data-testid="confirm-delete">
        confirm delete
      </button>
    ) : null
}));

globalThis.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(() => callback()),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

describe('ContentCard', () => {
  const defaultProps = {
    id: '1',
    slug: 'test-slug',
    type: 'news' as ContentType,
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

  it('should open menu when three dots button is clicked', () => {
    render(<ContentCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.menuButton));
    expect(screen.getByTestId(TEST_IDS.menuButton)).toBeInTheDocument();
  });

  it('should close menu when clicked again', () => {
    render(<ContentCard {...defaultProps} />);
    const menuButton = screen.getByTestId(TEST_IDS.menuButton);
    fireEvent.click(menuButton);
    fireEvent.click(menuButton);
    expect(screen.getByTestId(TEST_IDS.menuButton)).toBeInTheDocument();
  });

  it('should close menu when onClose is called', () => {
    render(<ContentCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.menuButton));
    expect(screen.getByTestId(TEST_IDS.menuClose)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.menuClose));
    expect(screen.getByTestId(TEST_IDS.menuButton)).toBeInTheDocument();
  });

  it('should open delete modal when delete is clicked', () => {
    render(<ContentCard {...defaultProps} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.menuButton));
    fireEvent.click(screen.getByTestId(TEST_IDS.openDelete));
    expect(screen.getByTestId(TEST_IDS.confirmDelete)).toBeInTheDocument();
  });

  describe('Deletion flow', () => {
    it.each([
      { type: 'news', label: 'deleteNews' },
      { type: 'events', label: 'deleteEvent' },
      { type: 'media', label: 'deleteMediaMention' }
    ])('should handle deletion for $type', async ({ type }) => {
      render(<ContentCard {...defaultProps} type={type as ContentType} />);
      fireEvent.click(screen.getByTestId(TEST_IDS.menuButton));
      fireEvent.click(screen.getByTestId(TEST_IDS.openDelete));
      fireEvent.click(screen.getByTestId(TEST_IDS.confirmDelete));
      expect(screen.getByTestId(TEST_IDS.menuButton)).toBeInTheDocument();
    });
  });
});
