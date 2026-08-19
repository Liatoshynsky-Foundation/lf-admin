import { Box, Button } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import CardLayout from '../card-layout/CardLayout';
import ContentCard, { ContentType } from './ContentCard';
import { useContentCardActions } from '~/shared/hooks/use-content-card-actions/useContentCardActions';

const FALLBACK_IMAGE_SRC = 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-foundation-first.png';

interface CardLayoutMockProps {
  coverImage: React.ReactNode;
  title: React.ReactNode;
  contentUpper: React.ReactNode;
  info: React.ReactNode;
  contentBottom: React.ReactNode;
  items: Array<{ id: string; text: { name: string }; onClick?: () => void }>;
}

interface DeleteCardModalMockProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

interface ImageWithFallbackMockProps {
  src: string;
  fallbackSrc: string;
  alt: string;
}

jest.mock('~/shared/hooks/use-content-card-actions/useContentCardActions', () => ({
  useContentCardActions: jest.fn()
}));

jest.mock('../card-layout/CardLayout', () => {
  return jest
    .fn()
    .mockImplementation(({ coverImage, title, contentUpper, info, contentBottom, items }: CardLayoutMockProps) => (
      <Box data-testid="card-layout">
        <Box data-testid="cover-image-container">{coverImage}</Box>
        <Box data-testid="title-container">{title}</Box>
        <Box data-testid="content-upper-container">{contentUpper}</Box>
        <Box data-testid="info-container">{info}</Box>
        <Box data-testid="content-bottom-container">{contentBottom}</Box>
        <Box data-testid="menu-items-container">
          {items.map((group) =>
            ('items' in group
              ? (group.items as Array<{ id: string; text: { name: string }; onClick?: () => void }>)
              : []
            ).map((item) => (
              <Button key={item.id} data-testid={`menu-btn-${item.id}`} onClick={item.onClick}>
                {item.text.name}
              </Button>
            ))
          )}
        </Box>
      </Box>
    ));
});

jest.mock('../card-layout/ImageWithFallback', () => {
  return jest.fn().mockImplementation(({ src, fallbackSrc, alt }: ImageWithFallbackMockProps) => {
    const [currentSrc, setCurrentSrc] = React.useState(src);
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={currentSrc} alt={alt} data-testid="card-image" onError={() => setCurrentSrc(fallbackSrc)} />;
  });
});

jest.mock('../card-layout/TitleWithTooltip', () => {
  return jest.fn().mockImplementation(({ text }: { text: string }) => <Box data-testid="title-text">{text}</Box>);
});

jest.mock('./ContentCardBadge', () => {
  return jest.fn().mockImplementation(() => <div data-testid="badge" />);
});

jest.mock('../delete-card-modal/DeleteCardModal', () => {
  return jest.fn().mockImplementation(({ open, onClose, onDelete }: DeleteCardModalMockProps) =>
    open ? (
      <Box data-testid="delete-modal">
        <Button data-testid="confirm-delete-btn" onClick={onDelete}>
          Confirm
        </Button>
        <Button data-testid="close-delete-btn" onClick={onClose}>
          Close
        </Button>
      </Box>
    ) : null
  );
});

jest.mock('~/lib/utils/getStatus', () => ({
  getStatus: (status: string) => `status-${status}`
}));

const mockHandleDelete = jest.fn();
const mockHandlePublish = jest.fn();
const mockHandleUnpublish = jest.fn();

const mockUseContentCardActions = useContentCardActions as jest.MockedFunction<typeof useContentCardActions>;

describe('ContentCard', () => {
  const defaultProps = {
    id: '123',
    type: 'news' as ContentType,
    coverImage: {
      src: '/initial-image.png',
      alt: {
        uk: 'Альтернативний текст UA',
        en: 'Alternative text EN'
      }
    },
    title: {
      uk: 'Український заголовок',
      en: 'English title'
    },
    status: 'draft',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseContentCardActions.mockImplementation(({ status }) => {
      const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

      return {
        deleteModalOpen,
        setDeleteModalOpen,
        handleDelete: mockHandleDelete,
        handlePublish: mockHandlePublish,
        handleUnpublish: mockHandleUnpublish,
        isPublished: status === 'published'
      };
    });
  });

  it('should render correct title and call getStatus utility', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.getByTestId('title-text')).toHaveTextContent('Український заголовок');
    expect(screen.getByTestId('info-container')).toHaveTextContent('status-draft');
  });

  it('should fallback to English title if Ukrainian is missing', () => {
    render(<ContentCard {...defaultProps} title={{ uk: '', en: 'Only English Title' }} />);
    expect(screen.getByTestId('title-text')).toHaveTextContent('Only English Title');
  });

  it('should handle alternative text fallback scenarios', () => {
    const { rerender } = render(
      <ContentCard {...defaultProps} coverImage={{ src: '/img.png', alt: { uk: '', en: 'Alt EN' } }} />
    );
    expect(screen.getByTestId('card-image')).toHaveAttribute('alt', 'Alt EN');

    rerender(
      <ContentCard
        {...defaultProps}
        coverImage={{ src: '/img.png', alt: { uk: '', en: '' } }}
        title={{ uk: 'Заголовок як альт' }}
      />
    );
    expect(screen.getByTestId('card-image')).toHaveAttribute('alt', 'Заголовок як альт');
  });

  it('should fallback to default image when initial image src fails to load', () => {
    render(<ContentCard {...defaultProps} />);
    const img = screen.getByTestId('card-image');

    fireEvent.error(img);
    expect(img).toHaveAttribute('src', FALLBACK_IMAGE_SRC);
  });

  it('should render edit button and trigger onClick when editHref is omitted', () => {
    render(<ContentCard {...defaultProps} />);
    const editBtn = screen.getByRole('button', { name: 'Редагувати' });

    fireEvent.click(editBtn);
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('should render edit button as link when editHref is provided', () => {
    render(<ContentCard {...defaultProps} editHref="/edit-page" />);
    const editLink = screen.getByRole('link', { name: 'Редагувати' });

    expect(editLink).toHaveAttribute('href', '/edit-page');
  });

  it('should open and close the delete modal correctly', () => {
    render(<ContentCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('menu-btn-delete'));
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-delete-btn'));
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('should fallback to an empty string if both Ukrainian and English titles are missing', () => {
    render(<ContentCard {...defaultProps} title={{ uk: '', en: '' }} />);

    expect(screen.getByTestId('title-text')).toHaveTextContent('');
  });

  it('should call handleDelete when confirming deletion in modal', () => {
    render(<ContentCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('menu-btn-delete'));
    fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
  });

  describe('ContentCard menu items (ContentCardMenuItems integration)', () => {
    const menuProps = {
      ...defaultProps,
      id: 'card-42',
      type: 'events' as ContentType
    };

    const getMenuGroups = () => {
      render(<ContentCard {...menuProps} />);
      const lastCallProps = (CardLayout as unknown as jest.Mock).mock.calls.at(-1)?.[0];
      return lastCallProps.items as Array<{
        title?: string;
        items: Array<{ id: string; text: { name: string }; href?: string; onClick?: () => void }>;
      }>;
    };

    it('should build a "Мовні версії" group with correct uk/en edit links', () => {
      const groups = getMenuGroups();
      const languageGroup = groups.find((group) => group.title === 'Мовні версії');

      expect(languageGroup).toBeDefined();
      expect(languageGroup?.items).toEqual([
        { id: 'uk', text: { name: 'Українська' }, href: '/publications/events/card-42/edit?lang=uk' },
        { id: 'en', text: { name: 'Англійська' }, href: '/publications/events/card-42/edit?lang=en' }
      ]);
    });

    it('should build the second group with seo/publish/delete items for draft content', () => {
      const groups = getMenuGroups();
      const actionsGroup = groups.find((group) => !group.title);

      expect(actionsGroup).toBeDefined();

      const seoItem = actionsGroup?.items.find((item) => item.id === 'seo-settings');
      expect(seoItem).toEqual(
        expect.objectContaining({
          text: { name: 'SEO налаштування' },
          href: '/publications/events/card-42/seo'
        })
      );

      const publishItem = actionsGroup?.items.find((item) => item.id === 'publish');
      expect(publishItem?.text).toEqual({ name: 'Опублікувати' });
      expect(typeof publishItem?.onClick).toBe('function');
      expect(actionsGroup?.items.find((item) => item.id === 'hide')).toBeUndefined();
    });

    it('should include hide item only for published content', () => {
      render(<ContentCard {...menuProps} status="published" />);
      const lastCallProps = (CardLayout as unknown as jest.Mock).mock.calls.at(-1)?.[0];
      const groups = lastCallProps.items as Array<{
        title?: string;
        items: Array<{ id: string; text: { name: string }; onClick?: () => void }>;
      }>;
      const actionsGroup = groups.find((group) => !group.title);
      const hideItem = actionsGroup?.items.find((item) => item.id === 'hide');

      expect(hideItem?.text).toEqual({ name: 'Зняти з публікації' });
      expect(typeof hideItem?.onClick).toBe('function');
      expect(actionsGroup?.items.find((item) => item.id === 'publish')).toBeUndefined();
    });

    it('should wire publish menu action to handlePublish', () => {
      render(<ContentCard {...menuProps} />);

      fireEvent.click(screen.getByTestId('menu-btn-publish'));

      expect(mockHandlePublish).toHaveBeenCalledTimes(1);
    });

    it('should wire unpublish menu action to handleUnpublish', () => {
      render(<ContentCard {...menuProps} status="published" />);

      fireEvent.click(screen.getByTestId('menu-btn-hide'));

      expect(mockHandleUnpublish).toHaveBeenCalledTimes(1);
    });

    it('should generate correct hrefs for different content types', () => {
      render(<ContentCard {...defaultProps} id="777" type="media" />);
      const lastCallProps = (CardLayout as unknown as jest.Mock).mock.calls.at(-1)?.[0];
      const groups = lastCallProps.items as Array<{
        title?: string;
        items: Array<{ id: string; href?: string }>;
      }>;

      const languageGroup = groups.find((group) => group.title === 'Мовні версії');
      const ukItem = languageGroup?.items.find((item) => item.id === 'uk');
      const enItem = languageGroup?.items.find((item) => item.id === 'en');

      expect(ukItem?.href).toBe('/publications/media/777/edit?lang=uk');
      expect(enItem?.href).toBe('/publications/media/777/edit?lang=en');
    });

    it('should open the delete modal when clicking the "Видалити" item via onClick', () => {
      render(<ContentCard {...defaultProps} />);
      fireEvent.click(screen.getByTestId('menu-btn-delete'));
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });
  });
});
