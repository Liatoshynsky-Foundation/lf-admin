import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import Page from './page';
import { MediaStatus, NewsStatus } from '~/types/graphql/generated/graphql';

const mockUseAllNews = jest.fn();
const mockUseAllMediaMentions = jest.fn();

type QuerySortOption = {
  field: string;
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
      alt: { uk: 'Новина', en: 'News' },
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
    title: { uk: 'Вечір камерної музики', en: '' },
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

const getSearchText = (title: string | { uk?: string; en?: string }, adminTitle?: string) => {
  if (typeof title === 'string') {
    return `${title} ${adminTitle ?? ''}`.trim().toLowerCase();
  }

  return [title.uk, title.en, adminTitle].filter(Boolean).join(' ').toLowerCase();
};

const getSortTitle = (item: { adminTitle?: string; title: string | { uk?: string; en?: string } }) => {
  if (item.adminTitle) {
    return item.adminTitle;
  }

  return typeof item.title === 'string' ? item.title : item.title.uk || item.title.en || '';
};

const compareBySort = (
  left: { createdAt: string; adminTitle?: string; title: string | { uk?: string; en?: string } },
  right: { createdAt: string; adminTitle?: string; title: string | { uk?: string; en?: string } },
  sort: readonly QuerySortOption[]
) => {
  for (const criterion of sort) {
    if (criterion.field === 'adminTitle') {
      const comparison = getSortTitle(left).localeCompare(getSortTitle(right), 'uk');

      if (comparison !== 0) {
        return criterion.order === 'asc' ? comparison : -comparison;
      }
    }

    if (criterion.field === 'createdAt') {
      const comparison = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();

      if (comparison !== 0) {
        return criterion.order === 'asc' ? comparison : -comparison;
      }
    }
  }

  return 0;
};

const applyFilters = <T extends { createdAt: string; adminTitle?: string; title: string | { uk?: string; en?: string }; status: string; language: string }>(
  items: T[],
  filters?: PublicationsQueryFilters
) => {
  const normalizedSearch = filters?.search?.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const matchesSearch = !normalizedSearch || getSearchText(item.title, item.adminTitle).includes(normalizedSearch);
    const matchesStatus = !filters?.statuses?.length || filters.statuses.includes(String(item.status).toLowerCase());
    const matchesLanguage = !filters?.languages?.length || filters.languages.includes(item.language);

    return matchesSearch && matchesStatus && matchesLanguage;
  });

  if (!filters?.sort?.length) {
    return filteredItems;
  }

  return [...filteredItems].sort((left, right) => compareBySort(left, right, filters.sort ?? []));
};

const buildNewsResponse = (filters?: PublicationsQueryFilters, options?: QueryHookOptions) => {
  if (options?.skip) {
    return { data: undefined, loading: false, error: undefined };
  }

  return {
    data: {
      allNews: applyFilters(NEWS_ITEMS, filters)
    },
    loading: false,
    error: undefined
  };
};

const buildMediaResponse = (filters?: PublicationsQueryFilters, options?: QueryHookOptions) => {
  if (options?.skip) {
    return { data: undefined, loading: false, error: undefined };
  }

  return {
    data: {
      allMediaMentions: applyFilters(MEDIA_ITEMS, filters)
    },
    loading: false,
    error: undefined
  };
};

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useAllNews: (filters?: PublicationsQueryFilters, options?: QueryHookOptions) => mockUseAllNews(filters, options)
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useAllMediaMentions: (filters?: PublicationsQueryFilters, options?: QueryHookOptions) =>
    mockUseAllMediaMentions(filters, options)
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
      <span>{type}</span>
      {editHref ? <a href={editHref}>Редагувати</a> : null}
    </div>
  )
}));

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList }: { open: boolean; menuList: React.ReactNode }) =>
    open ? <div data-testid="dropdown-menu">{menuList}</div> : null
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({
    search,
    filters = [],
    isFiltersOpen,
    onToggleFilters,
    bottomTrailingContent,
    dataTestId
  }: {
    search?: { search: string; setSearch: (value: string) => void };
    filters?: Array<{
      id: string;
      label: string;
      options: Array<{ value: string; label: string }>;
      onChange: (value: string[]) => void;
    }>;
    isFiltersOpen?: boolean;
    onToggleFilters?: () => void;
    bottomTrailingContent?: React.ReactNode;
    dataTestId?: string;
  }) => (
    <div data-testid={dataTestId ?? 'filtering-toolbar'}>
      {search ? (
        <input
          data-testid="search"
          value={search.search}
          onChange={(event) => search.setSearch(event.target.value)}
        />
      ) : null}
      {onToggleFilters ? (
        <button type="button" onClick={onToggleFilters}>
          Фільтри
        </button>
      ) : null}
      {isFiltersOpen ? (
        <div data-testid="filters-panel">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              data-testid={`filter-${filter.id}`}
              onClick={() => filter.onChange([filter.options[0].value])}
            >
              {filter.label}
            </button>
          ))}
          {bottomTrailingContent}
        </div>
      ) : null}
    </div>
  ),
  SortSelect: ({
    triggerLabel,
    fieldOptions,
    fieldValue,
    orderOptions,
    onFieldChange,
    onValueChange
  }: {
    triggerLabel: string;
    fieldOptions: Array<{ value: string; label: string }>;
    fieldValue: string;
    orderOptions: Record<string, Array<{ value: string; label: string }>>;
    onFieldChange: (value: string) => void;
    onValueChange: (value: string) => void;
  }) => (
    <button
      type="button"
      data-testid="sort-select"
      onClick={() => {
        const nextField = fieldOptions.find((option) => option.value !== fieldValue) ?? fieldOptions[0];
        onFieldChange(nextField.value);
        onValueChange(orderOptions[nextField.value][0].value);
      }}
    >
      {triggerLabel}
    </button>
  )
}));

describe('Publications page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    mockUseAllNews.mockImplementation((filters?: PublicationsQueryFilters, options?: QueryHookOptions) =>
      buildNewsResponse(filters, options)
    );

    mockUseAllMediaMentions.mockImplementation((filters?: PublicationsQueryFilters, options?: QueryHookOptions) =>
      buildMediaResponse(filters, options)
    );
  });

  it('renders the configured page header and filtering controls', () => {
    render(<Page />);

    expect(screen.getByText('Новини та події')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Всі' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Події' })).toHaveAttribute('href', '/publications/events');
    expect(screen.getByRole('tab', { name: 'Новини' })).toHaveAttribute('href', '/publications/news');
    expect(screen.getByRole('tab', { name: 'Ми у ЗМІ' })).toHaveAttribute('href', '/publications/media');
    expect(screen.getByRole('button', { name: 'Створити' })).toBeInTheDocument();
    expect(screen.getByTestId('publications-control-panel')).toBeInTheDocument();
    expect(screen.getAllByTestId('publication-card')).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: 'Фільтри' }));

    expect(screen.getByTestId('filter-status')).toHaveTextContent('Статус');
    expect(screen.getByTestId('filter-language')).toHaveTextContent('Мова');
    expect(screen.getByTestId('sort-select')).toHaveTextContent('Нові спочатку');
  });

  it('shows dropdown options for the create action as links', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    const dropdownMenu = screen.getByTestId('dropdown-menu');

    expect(dropdownMenu).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Подію')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Новину')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Ми у ЗМІ')).toBeInTheDocument();

    expect(within(dropdownMenu).getByText('Подію').closest('a')).toHaveAttribute('href', '/publications/events/create');
    expect(within(dropdownMenu).getByText('Новину').closest('a')).toHaveAttribute('href', '/publications/news/create');
    expect(within(dropdownMenu).getByText('Ми у ЗМІ').closest('a')).toHaveAttribute('href', '/publications/media/create');

    fireEvent.click(within(dropdownMenu).getByText('Подію'));

    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('passes edit links to rendered publication cards', () => {
    render(<Page />);

    const firstCard = screen.getAllByTestId('publication-card')[0];

    expect(within(firstCard).getByRole('link', { name: 'Редагувати' })).toHaveAttribute(
      'href',
      '/publications/news/festival-news/edit'
    );
  });

  it('filters cards by search value', () => {
    render(<Page />);

    fireEvent.change(screen.getByTestId('search'), { target: { value: 'фестиваль' } });

    expect(screen.getAllByTestId('publication-card')).toHaveLength(1);
    expect(screen.getByText('Новина про фестиваль')).toBeInTheDocument();
    expect(mockUseAllNews).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'фестиваль' }),
      expect.objectContaining({ skip: false })
    );
  });

  it('filters cards by status', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: 'Фільтри' }));
    fireEvent.click(screen.getByTestId('filter-status'));

    expect(screen.getAllByTestId('publication-card')).toHaveLength(2);
    expect(screen.getByText('Вечір камерної музики')).toBeInTheDocument();
    expect(screen.getByText('Програма резиденції оголошена')).toBeInTheDocument();
  });

  it('sorts cards by title', () => {
    render(<Page />);

    const beforeSort = screen.getAllByTestId('publication-card-title').map((element) => element.textContent);

    expect(beforeSort[0]).toBe('Новина про фестиваль');

    fireEvent.click(screen.getByRole('button', { name: 'Фільтри' }));
    fireEvent.click(screen.getByTestId('sort-select'));

    const afterSort = screen.getAllByTestId('publication-card-title').map((element) => element.textContent);

    expect(afterSort[0]).toBe('Вечір камерної музики');
    expect(mockUseAllNews).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sort: [
          { field: 'adminTitle', order: 'asc' },
          { field: 'createdAt', order: 'desc' }
        ]
      }),
      expect.objectContaining({ skip: false })
    );
  });

  it('keeps rendering news on the all tab when media request fails', () => {
    mockUseAllMediaMentions.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('media failed')
    });

    render(<Page />);

    expect(screen.queryByText('Не вдалося завантажити матеріали')).not.toBeInTheDocument();
    expect(screen.getByText('Новина про фестиваль')).toBeInTheDocument();
    expect(screen.getByText('Вечір камерної музики')).toBeInTheDocument();
  });
});