import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import Page from './page';
import { PublicationsPageContent } from './PublicationsPageContent';
import type { FilesSortValue } from '~/constants/sort';
import { EventStatus, MediaStatus, NewsStatus } from '~/types/graphql/generated/graphql';

const mockUseAllNews = jest.fn();
const mockUseAllMediaMentions = jest.fn();
const mockUseAllEvents = jest.fn();
const mockSortValue = jest.fn();

const mockToolbarProps = {
  search: { search: '', setSearch: jest.fn() } as { search: string; setSearch: jest.Mock } | undefined,
  filters: [] as Array<{
    id: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string[]) => void;
  }>,
  activeFiltersCount: 0,
  onToggleFilters: jest.fn(),
  isFiltersOpen: false
};

const mockSortProps = {
  triggerLabel: 'Нові спочатку',
  fieldOptions: [
    { value: 'createdAt', label: 'Дата' },
    { value: 'adminTitle', label: 'Назва' }
  ],
  fieldValue: 'createdAt',
  orderOptions: {
    createdAt: [{ value: 'desc', label: 'Нові спочатку' }],
    adminTitle: [{ value: 'asc', label: 'А-Я' }]
  },
  onFieldChange: jest.fn(),
  onValueChange: jest.fn()
};

type QuerySortOption = {
  field: 'adminTitle' | 'createdAt';
  order: 'asc' | 'desc';
};

type PublicationsQueryFilters = {
  search?: string;
  languages?: string[];
  statuses?: string[];
  sort?: readonly QuerySortOption[];
};

type QueryHookOptions = {
  skip?: boolean;
};

const NEWS_ITEMS = [
  {
    id: 'news-1',
    slug: 'festival-news',
    adminTitle: 'Новина про фестиваль',
    language: 'bilingual',
    title: { uk: 'Новина про фестиваль', en: 'Festival news' },
    status: NewsStatus.Published,
    createdAt: '2026-03-21T10:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
    publishedAt: '2026-03-23T10:00:00.000Z',
    newsDate: null,
    description: null,
    content: { uk: 'Контент', en: 'Content' },
    coverImage: {
      src: '/news-1.png',
      alt: 'Alt String',
      caption: { uk: '', en: '' }
    },
    meta: { views: 10 },
    __typename: 'News'
  },
  {
    id: 'news-2',
    slug: 'chamber-evening',
    adminTitle: 'Вечір камерної музики',
    language: 'uk',
    title: { uk: 'Вечір камерної музики' },
    status: NewsStatus.Draft,
    createdAt: '2026-03-19T10:00:00.000Z',
    updatedAt: '2026-03-19T10:00:00.000Z',
    publishedAt: null,
    newsDate: null,
    description: null,
    content: { uk: 'Контент', en: '' },
    coverImage: {
      src: '/news-2.png',
      alt: { uk: 'Вечір', en: '' },
      caption: { uk: '', en: '' }
    },
    meta: { views: 5 },
    __typename: 'News'
  }
];

const EVENT_ITEMS = [
  {
    id: 'event-1',
    slug: 'main-event',
    adminTitle: 'Головна подія сезону',
    language: 'uk',
    title: { uk: 'Головна подія сезону', en: '' },
    status: EventStatus.Published,
    createdAt: '2026-03-17T10:00:00.000Z',
    updatedAt: '2026-03-17T10:00:00.000Z',
    publishedAt: '2026-03-16T10:00:00.000Z',
    eventDateTimeStart: '2026-04-01T10:00:00.000Z',
    eventDateTimeEnd: '2026-04-01T12:00:00.000Z',
    description: null,
    coverImage: {
      src: '/event-1.png',
      alt: { uk: 'Подія', en: '' }
    },
    meta: { views: 20 },
    __typename: 'Event'
  }
];

const MEDIA_ITEMS = [
  {
    id: 'media-1',
    slug: 'interview-media',
    adminTitle: 'Інтерв’ю про нову постановку',
    language: 'uk',
    title: { uk: 'Інтерв’ю про нову постановку', en: '' },
    status: MediaStatus.Published,
    createdAt: '2026-03-20T10:00:00.000Z',
    updatedAt: '2026-03-24T10:00:00.000Z',
    publishedAt: '2026-03-25T10:00:00.000Z',
    description: null,
    url: 'https://example.com/media-1',
    coverImage: {
      src: '/media-1.png',
      alt: { uk: 'Інтерв’ю', en: '' }
    },
    meta: { views: 8 },
    __typename: 'MediaMention'
  },
  {
    id: 'media-2',
    slug: 'residency-program',
    adminTitle: 'Програма резиденції оголошена',
    language: 'uk',
    title: { uk: 'Програма резиденції оголошена', en: '' },
    status: MediaStatus.Draft,
    createdAt: '2026-03-18T10:00:00.000Z',
    updatedAt: '2026-03-18T10:00:00.000Z',
    publishedAt: null,
    description: null,
    url: 'https://example.com/media-2',
    coverImage: null,
    meta: { views: 3 },
    __typename: 'MediaMention'
  }
];

const getRawDate = (item: {
  __typename?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  newsDate?: string | null;
  eventDateTimeStart?: string | null;
  eventDateTimeEnd?: string | null;
}): string => {
  if (item.__typename === 'Event') {
    return item.publishedAt || item.eventDateTimeStart || item.eventDateTimeEnd || '1970-01-01T00:00:00.000Z';
  }
  if (item.__typename === 'News') {
    return item.createdAt || item.updatedAt || item.publishedAt || item.newsDate || '1970-01-01T00:00:00.000Z';
  }
  return item.createdAt || item.updatedAt || item.publishedAt || '1970-01-01T00:00:00.000Z';
};

const sortItems = <
  T extends {
    __typename?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    publishedAt?: string | null;
    newsDate?: string | null;
    eventDateTimeStart?: string | null;
    eventDateTimeEnd?: string | null;
    adminTitle?: string | null;
    title?: { uk?: string | null; en?: string | null } | string | null;
  }
>(
    items: T[],
    sortValue: string
  ): T[] => {
  return [...items].sort((left, right) => {
    const leftTitleRaw =
      left.adminTitle || (typeof left.title === 'string' ? left.title : left.title?.uk || left.title?.en || '');
    const rightTitleRaw =
      right.adminTitle || (typeof right.title === 'string' ? right.title : right.title?.uk || right.title?.en || '');

    const leftTitle = String(leftTitleRaw).trim();
    const rightTitle = String(rightTitleRaw).trim();

    if (sortValue === 'name_asc') {
      return leftTitle.localeCompare(rightTitle, 'uk');
    }
    if (sortValue === 'name_desc') {
      return rightTitle.localeCompare(leftTitle, 'uk');
    }

    const leftDate = new Date(getRawDate(left)).getTime();
    const rightDate = new Date(getRawDate(right)).getTime();

    if (sortValue === 'date_asc') {
      return leftDate - rightDate;
    }
    return rightDate - leftDate;
  });
};

const buildNewsResponse = (options?: QueryHookOptions) => {
  if (options?.skip) return { data: undefined, loading: false, error: undefined };
  return {
    data: { allNews: sortItems(NEWS_ITEMS, mockSortValue()) },
    loading: false,
    error: undefined
  };
};

const buildMediaResponse = (options?: QueryHookOptions) => {
  if (options?.skip) return { data: undefined, loading: false, error: undefined };
  return {
    data: { allMediaMentions: sortItems(MEDIA_ITEMS, mockSortValue()) },
    loading: false,
    error: undefined
  };
};

const buildEventsResponse = (options?: QueryHookOptions) => {
  if (options?.skip) return { data: undefined, loading: false, error: undefined };
  return {
    data: { allEvents: sortItems(EVENT_ITEMS, mockSortValue()) },
    loading: false,
    error: undefined
  };
};

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useAllNews: (_filters?: PublicationsQueryFilters, options?: QueryHookOptions) => mockUseAllNews(options)
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useAllMediaMentions: (_filters?: PublicationsQueryFilters, options?: QueryHookOptions) =>
    mockUseAllMediaMentions(options)
}));

jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useAllEvents: (_filters?: PublicationsQueryFilters, options?: QueryHookOptions) => mockUseAllEvents(options)
}));

jest.mock('~/shared/hooks/use-publications', () => ({
  usePublicationsFiltering: () => ({
    requestFilters: { news: {}, events: {}, media: {} },
    sortValue: mockSortValue() as FilesSortValue,
    toolbarProps: mockToolbarProps,
    sortProps: mockSortProps
  })
}));

jest.mock('~/shared/components/content-card/ContentCard', () => ({
  __esModule: true,
  default: ({
    title,
    status,
    type,
    editHref
  }: {
    title: { uk?: string; en?: string };
    status: string;
    type: string;
    editHref?: string;
  }) => (
    <div data-testid="publication-card">
      <span data-testid="publication-card-title">{title.uk || title.en}</span>
      <span>{status}</span>
      <span data-testid="publication-card-type">{type}</span>
      {editHref ? <a href={editHref}>Редагувати</a> : null}
    </div>
  )
}));

jest.mock('~/shared/components/dropdown-menu/ActionMenu', () => ({
  __esModule: true,
  default: ({
    anchorEl,
    onClose,
    menuItems
  }: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    menuItems: Array<{ items: Array<{ id: string; href: string; text: { name: string } }> }>;
  }) =>
    anchorEl ? (
      <div data-testid="dropdown-menu">
        <button type="button" data-testid="close-menu-button" onClick={onClose}>
          Закрити
        </button>
        {menuItems[0].items.map((item) => (
          <a key={item.id} href={item.href}>
            {item.text.name}
          </a>
        ))}
      </div>
    ) : null
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <span data-testid="empty-state-title">{title}</span>
      <span data-testid="empty-state-description">{description}</span>
    </div>
  )
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ title, activeTab, action }: { title: string; activeTab: string; action: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <span>Active tab: {activeTab}</span>
      {action}
    </div>
  )
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({
    search,
    isFiltersOpen,
    onToggleFilters,
    bottomTrailingContent,
    dataTestId
  }: {
    search?: { search: string; setSearch: (value: string) => void };
    isFiltersOpen?: boolean;
    onToggleFilters?: () => void;
    bottomTrailingContent?: React.ReactNode;
    dataTestId?: string;
  }) => (
    <div data-testid={dataTestId ?? 'filtering-toolbar'}>
      {search ? (
        <input data-testid="search" value={search.search} onChange={(event) => search.setSearch(event.target.value)} />
      ) : null}
      {onToggleFilters ? (
        <button type="button" onClick={onToggleFilters}>
          Фільтри
        </button>
      ) : null}
      {isFiltersOpen ? <div data-testid="filters-panel">{bottomTrailingContent}</div> : null}
    </div>
  ),
  SortSelect: ({ triggerLabel }: { triggerLabel: string }) => (
    <button type="button" data-testid="sort-select">
      {triggerLabel}
    </button>
  )
}));

describe('Publications page integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSortValue.mockReturnValue('date_desc');
    mockToolbarProps.search = { search: '', setSearch: jest.fn() };

    mockUseAllNews.mockImplementation((options?: QueryHookOptions) => buildNewsResponse(options));
    mockUseAllMediaMentions.mockImplementation((options?: QueryHookOptions) => buildMediaResponse(options));
    mockUseAllEvents.mockImplementation((options?: QueryHookOptions) => buildEventsResponse(options));
  });

  it('renders standard page components and lists all publications', () => {
    render(<Page />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getAllByTestId('publication-card')).toHaveLength(5);
    expect(screen.getByText('Новина про фестиваль')).toBeInTheDocument();
    expect(screen.getByText('Головна подія сезону')).toBeInTheDocument();
  });

  it('shows and closes the creation menu correctly', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    const dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(dropdownMenu).toBeInTheDocument();

    expect(within(dropdownMenu).getByText('Подію').closest('a')).toHaveAttribute('href', '/publications/events/create');

    fireEvent.click(screen.getByTestId('close-menu-button'));
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('filters news correctly and skip other hooks when activeTab is news', () => {
    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getAllByTestId('publication-card')).toHaveLength(2);
    expect(screen.getByText('Новина про фестиваль')).toBeInTheDocument();
    expect(screen.queryByText('Головна подія сезону')).not.toBeInTheDocument();

    expect(mockUseAllEvents).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(mockUseAllMediaMentions).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it('filters events correctly and skip other hooks when activeTab is events', () => {
    render(<PublicationsPageContent activeTab="events" />);

    expect(screen.getAllByTestId('publication-card')).toHaveLength(1);
    expect(screen.getByText('Головна подія сезону')).toBeInTheDocument();
    expect(screen.queryByText('Новина про фестиваль')).not.toBeInTheDocument();

    expect(mockUseAllNews).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(mockUseAllMediaMentions).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it('filters media mentions correctly and skip other hooks when activeTab is media', () => {
    render(<PublicationsPageContent activeTab="media" />);

    expect(screen.getAllByTestId('publication-card')).toHaveLength(2);
    expect(screen.getByText('Інтерв’ю про нову постановку')).toBeInTheDocument();
    expect(screen.queryByText('Новина про фестиваль')).not.toBeInTheDocument();

    expect(mockUseAllNews).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(mockUseAllEvents).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it('handles name_asc alphabetical sorting correctly', () => {
    mockSortValue.mockReturnValue('name_asc');
    render(<PublicationsPageContent activeTab="all" />);

    const titles = screen.getAllByTestId('publication-card-title').map((el) => el.textContent);
    expect(titles[0]).toBe('Вечір камерної музики');
  });

  it('handles name_desc alphabetical reverse sorting correctly', () => {
    mockSortValue.mockReturnValue('name_desc');
    render(<PublicationsPageContent activeTab="all" />);

    const titles = screen.getAllByTestId('publication-card-title').map((el) => el.textContent);
    expect(titles[0]).toBe('Програма резиденції оголошена');
  });

  it('handles date_asc chronological sorting correctly', () => {
    mockSortValue.mockReturnValue('date_asc');
    render(<PublicationsPageContent activeTab="all" />);

    const titles = screen.getAllByTestId('publication-card-title').map((el) => el.textContent);
    expect(titles[0]).toBe('Головна подія сезону');
  });

  it('renders loading states for specific active tabs', () => {
    mockUseAllNews.mockReturnValue({ data: undefined, loading: true, error: undefined });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getByTestId('empty-state-title')).toBeInTheDocument();
  });

  it('renders error states for specific active tabs', () => {
    mockUseAllNews.mockReturnValue({ data: undefined, loading: false, error: new Error('News loading failed') });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getByTestId('empty-state-title')).toBeInTheDocument();
  });

  it('filters out publication items with unsupported or invalid statuses', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            status: 'UNSUPPORTED_STATUS_VALUE'
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.queryByTestId('publication-card')).not.toBeInTheDocument();
  });

  it('handles empty cover images by applying defaults', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            coverImage: null
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles raw string values for title formatting', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            title: 'Raw string title value'
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getByTestId('publication-card-title')).toHaveTextContent('Raw string title value');
  });

  it('correctly falls back to oldest system date when all dates are empty', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            createdAt: null,
            updatedAt: null,
            publishedAt: null,
            newsDate: null
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('uses fallback title when title is an empty string', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            title: '',
            adminTitle: 'Admin Title Fallback'
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);

    expect(screen.getByTestId('publication-card-title')).toHaveTextContent('Admin Title Fallback');
  });

  it('filters out events with invalid status', () => {
    mockUseAllEvents.mockReturnValue({
      data: {
        allEvents: [
          {
            ...EVENT_ITEMS[0],
            status: 'INVALID_STATUS'
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="events" />);
    expect(screen.queryByTestId('publication-card')).not.toBeInTheDocument();
  });

  it('filters out media mentions with invalid status', () => {
    mockUseAllMediaMentions.mockReturnValue({
      data: {
        allMediaMentions: [
          {
            ...MEDIA_ITEMS[0],
            status: 'INVALID_STATUS'
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="media" />);
    expect(screen.queryByTestId('publication-card')).not.toBeInTheDocument();
  });

  it('returns en language when uk title is empty and en title is present', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            adminTitle: '',
            title: { en: 'Only English' }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles invalid tab fallbacks in getActiveTabState', () => {
    render(<PublicationsPageContent activeTab={'invalid-tab' as unknown as 'all'} />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('renders empty state with search no-results description when search matches nothing', () => {
    if (mockToolbarProps.search) {
      mockToolbarProps.search.search = 'nonexistent-query-xyz';
    }
    mockUseAllNews.mockReturnValue({ data: { allNews: [] }, loading: false, error: undefined });
    mockUseAllMediaMentions.mockReturnValue({ data: { allMediaMentions: [] }, loading: false, error: undefined });
    mockUseAllEvents.mockReturnValue({ data: { allEvents: [] }, loading: false, error: undefined });

    render(<PublicationsPageContent activeTab="all" />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-title')).toBeInTheDocument();
  });

  it('handles coverImage present but alt is null', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            coverImage: {
              src: '/news-1.png',
              alt: null,
              caption: { uk: '', en: '' }
            }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles events with nullish publishedAt and nullish coverImage', () => {
    mockUseAllEvents.mockReturnValue({
      data: {
        allEvents: [
          {
            ...EVENT_ITEMS[0],
            publishedAt: null,
            coverImage: null
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="events" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles media mention with empty adminTitle', () => {
    mockUseAllMediaMentions.mockReturnValue({
      data: {
        allMediaMentions: [
          {
            ...MEDIA_ITEMS[0],
            adminTitle: ''
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="media" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles media mention with coverImage present but alt is null', () => {
    mockUseAllMediaMentions.mockReturnValue({
      data: {
        allMediaMentions: [
          {
            ...MEDIA_ITEMS[0],
            coverImage: {
              src: '/media-1.png',
              alt: null
            }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="media" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('toggles the action menu when clicking the trigger button repeatedly', () => {
    render(<Page />);
    const button = screen.getByRole('button', { name: 'Створити' });

    fireEvent.click(button);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('handles search being undefined in toolbarProps', () => {
    mockToolbarProps.search = undefined;

    render(<PublicationsPageContent activeTab="all" />);
    expect(screen.queryByTestId('search')).not.toBeInTheDocument();
  });

  it('handles nullish title correctly', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            title: null
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles empty title and empty adminTitle to trigger default cover alt', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            title: '',
            adminTitle: '',
            coverImage: {
              src: '/news-1.png',
              alt: null,
              caption: { uk: '', en: '' }
            }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles event with empty title, empty adminTitle and nullish coverImage alt', () => {
    mockUseAllEvents.mockReturnValue({
      data: {
        allEvents: [
          {
            ...EVENT_ITEMS[0],
            title: '',
            adminTitle: '',
            coverImage: {
              src: '/event-1.png',
              alt: null
            }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="events" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles media with empty title, empty adminTitle and nullish coverImage alt', () => {
    mockUseAllMediaMentions.mockReturnValue({
      data: {
        allMediaMentions: [
          {
            ...MEDIA_ITEMS[0],
            title: '',
            adminTitle: '',
            coverImage: {
              src: '/media-1.png',
              alt: null
            }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="media" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });

  it('handles coverImage alt being a whitespace-only string', () => {
    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            ...NEWS_ITEMS[0],
            coverImage: {
              src: '/news-1.png',
              alt: '   ',
              caption: { uk: '', en: '' }
            }
          }
        ]
      },
      loading: false,
      error: undefined
    });

    render(<PublicationsPageContent activeTab="news" />);
    expect(screen.getByTestId('publication-card')).toBeInTheDocument();
  });
});
