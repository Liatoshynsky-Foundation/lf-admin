import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Page from './page';

const mockUseAllNews = jest.fn();
const mockUseAllMediaMentions = jest.fn();

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useAllNews: () => mockUseAllNews()
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useAllMediaMentions: () => mockUseAllMediaMentions()
}));

jest.mock('~/shared/components/content-card/ContentCard', () => ({
  __esModule: true,
  default: ({ title, status, type }: { title: { uk?: string; en?: string }; status: string; type: string }) => (
    <div data-testid="publication-card">
      <span data-testid="publication-card-title">{title.uk || title.en}</span>
      <span>{status}</span>
      <span>{type}</span>
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

    mockUseAllNews.mockReturnValue({
      data: {
        allNews: [
          {
            id: 'news-1',
            slug: 'festival-news',
            title: { uk: 'Новина про фестиваль', en: 'Festival news' },
            status: 'published',
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
            title: { uk: 'Вечір камерної музики', en: '' },
            status: 'draft',
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
        ]
      },
      loading: false,
      error: undefined
    });

    mockUseAllMediaMentions.mockReturnValue({
      data: {
        allMediaMentions: [
          {
            id: 'media-1',
            slug: 'interview-media',
            title: 'Інтерв’ю про нову постановку',
            status: 'PUBLISHED',
            createdAt: '2026-03-20T10:00:00.000Z',
            updatedAt: '2026-03-24T10:00:00.000Z',
            publishedAt: '2026-03-25T10:00:00.000Z',
            description: null,
            url: 'https://example.com/media-1',
            coverImage: {
              src: '/media-1.png',
              alt: 'Інтерв’ю'
            },
            meta: { views: 8 },
            __typename: 'MediaMention'
          },
          {
            id: 'media-2',
            slug: 'residency-program',
            title: 'Програма резиденції оголошена',
            status: 'DRAFT',
            createdAt: '2026-03-18T10:00:00.000Z',
            updatedAt: '2026-03-18T10:00:00.000Z',
            publishedAt: null,
            description: null,
            url: 'https://example.com/media-2',
            coverImage: null,
            meta: { views: 3 },
            __typename: 'MediaMention'
          }
        ]
      },
      loading: false,
      error: undefined
    });
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

  it('shows dropdown options for the create action without navigation handlers', () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByText('Подію')).toBeInTheDocument();
    expect(screen.getByText('Новину')).toBeInTheDocument();
    expect(screen.getByText('Ми у ЗМІ')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Подію'));

    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('filters cards by search value', () => {
    render(<Page />);

    fireEvent.change(screen.getByTestId('search'), { target: { value: 'фестиваль' } });

    expect(screen.getAllByTestId('publication-card')).toHaveLength(1);
    expect(screen.getByText('Новина про фестиваль')).toBeInTheDocument();
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

    expect(beforeSort[0]).toBe('Інтерв’ю про нову постановку');

    fireEvent.click(screen.getByRole('button', { name: 'Фільтри' }));
    fireEvent.click(screen.getByTestId('sort-select'));

    const afterSort = screen.getAllByTestId('publication-card-title').map((element) => element.textContent);

    expect(afterSort[0]).toBe('Вечір камерної музики');
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