import { Box, Button } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import toast from 'react-hot-toast';

import CardLayout from '../card-layout/CardLayout';
import ContentCard, { ContentType } from './ContentCard';
import { CONTENT_MUTATION_RESULTS } from '~/constants/publications';

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

const mockDeleteNewsFn = jest.fn();
const mockDeleteEventFn = jest.fn();
const mockDeleteMediaFn = jest.fn();
const mockUnpublishNewsFn = jest.fn();
const mockUnpublishEventFn = jest.fn();
const mockDraftMediaFn = jest.fn();
const mockPublishNewsFn = jest.fn();
const mockPublishEventFn = jest.fn();
const mockPublishMediaFn = jest.fn();

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useDeleteNews: () => [mockDeleteNewsFn],
  useUpdateNewsStatus: () => [{ unpublish: mockUnpublishNewsFn, publish: mockPublishNewsFn }]
}));

jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useDeleteEvent: () => [mockDeleteEventFn],
  useUpdateEventStatus: () => [{ unpublish: mockUnpublishEventFn, publish: mockPublishEventFn }]
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useDeleteMediaMention: () => [mockDeleteMediaFn],
  useUpdateMediaMentionStatus: () => [{ draft: mockDraftMediaFn, publish: mockPublishMediaFn }]
}));

const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}));

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

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
    mockDeleteNewsFn.mockResolvedValue({ data: true });
    mockDeleteEventFn.mockResolvedValue({ data: true });
    mockDeleteMediaFn.mockResolvedValue({ data: true });
    mockUnpublishNewsFn.mockResolvedValue({ data: { updateNews: { id: '123' } } });
    mockUnpublishEventFn.mockResolvedValue({ data: { updateEvent: { id: '123' } } });
    mockDraftMediaFn.mockResolvedValue({ data: { updateMediaMention: { id: '123' } } });
    mockPublishNewsFn.mockResolvedValue({ data: { updateNews: { id: '123' } } });
    mockPublishEventFn.mockResolvedValue({ data: { updateEvent: { id: '123' } } });
    mockPublishMediaFn.mockResolvedValue({ data: { updateMediaMention: { id: '123' } } });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('Deletion handling across content types', () => {
    it('should successfully delete news content type', async () => {
      render(<ContentCard {...defaultProps} type="news" />);

      fireEvent.click(screen.getByTestId('menu-btn-delete'));
      fireEvent.click(screen.getByTestId('confirm-delete-btn'));

      await waitFor(() => {
        expect(mockDeleteNewsFn).toHaveBeenCalledWith({ id: '123' });
        expect(mockRefresh).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
      });
    });

    it('should successfully delete events content type', async () => {
      render(<ContentCard {...defaultProps} type="events" />);

      fireEvent.click(screen.getByTestId('menu-btn-delete'));
      fireEvent.click(screen.getByTestId('confirm-delete-btn'));

      await waitFor(() => {
        expect(mockDeleteEventFn).toHaveBeenCalledWith({ id: '123' });
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should successfully delete media content type', async () => {
      render(<ContentCard {...defaultProps} type="media" />);

      fireEvent.click(screen.getByTestId('menu-btn-delete'));
      fireEvent.click(screen.getByTestId('confirm-delete-btn'));

      await waitFor(() => {
        expect(mockDeleteMediaFn).toHaveBeenCalledWith('123');
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should gracefully catch and log errors during failed deletion execution', async () => {
      mockDeleteNewsFn.mockRejectedValueOnce(new Error('Network Failure'));
      render(<ContentCard {...defaultProps} type="news" />);

      fireEvent.click(screen.getByTestId('menu-btn-delete'));
      fireEvent.click(screen.getByTestId('confirm-delete-btn'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting:', expect.any(Error));
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      });
    });
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
    });

    it('should unpublish published events content and refresh list', async () => {
      render(<ContentCard {...menuProps} status="published" />);

      fireEvent.click(screen.getByTestId('menu-btn-hide'));

      await waitFor(() => {
        expect(mockUnpublishEventFn).toHaveBeenCalledWith('card-42');
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should unpublish published news content', async () => {
      render(<ContentCard {...defaultProps} type="news" status="published" />);

      fireEvent.click(screen.getByTestId('menu-btn-hide'));

      await waitFor(() => {
        expect(mockUnpublishNewsFn).toHaveBeenCalledWith('123');
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should draft published media content', async () => {
      render(<ContentCard {...defaultProps} type="media" status="published" />);

      fireEvent.click(screen.getByTestId('menu-btn-hide'));

      await waitFor(() => {
        expect(mockDraftMediaFn).toHaveBeenCalledWith('123');
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should show error toast when unpublish returns no data', async () => {
      mockUnpublishEventFn.mockResolvedValueOnce({ data: null });
      render(<ContentCard {...menuProps} status="published" />);

      fireEvent.click(screen.getByTestId('menu-btn-hide'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublishError);
        expect(mockRefresh).not.toHaveBeenCalled();
      });
    });

    it('should publish draft events content and refresh list', async () => {
      render(<ContentCard {...menuProps} />);

      fireEvent.click(screen.getByTestId('menu-btn-publish'));

      await waitFor(() => {
        expect(mockPublishEventFn).toHaveBeenCalledWith('card-42');
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should publish draft news content', async () => {
      render(<ContentCard {...defaultProps} type="news" />);

      fireEvent.click(screen.getByTestId('menu-btn-publish'));

      await waitFor(() => {
        expect(mockPublishNewsFn).toHaveBeenCalledWith('123');
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should publish draft media content', async () => {
      render(<ContentCard {...defaultProps} type="media" />);

      fireEvent.click(screen.getByTestId('menu-btn-publish'));

      await waitFor(() => {
        expect(mockPublishMediaFn).toHaveBeenCalledWith('123');
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('should show error toast when publish returns no data', async () => {
      mockPublishEventFn.mockResolvedValueOnce({ data: null });
      render(<ContentCard {...menuProps} />);

      fireEvent.click(screen.getByTestId('menu-btn-publish'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublishError);
        expect(mockRefresh).not.toHaveBeenCalled();
      });
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
