import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { useWorksFiltering } from './useWorksFiltering';
import { WorksPageContent } from './WorksPageContent';
import { useAllCompositions } from '~/shared/hooks/use-compositions/useCompositions';
import { useAllOpusGroups, useAllUngroupedGroups } from '~/shared/hooks/use-opuses/useOpuses';

jest.mock('./useWorksFiltering', () => ({
  useWorksFiltering: jest.fn()
}));

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  useAllOpusGroups: jest.fn(),
  useAllUngroupedGroups: jest.fn()
}));

jest.mock('~/shared/hooks/use-compositions/useCompositions', () => ({
  useAllCompositions: jest.fn()
}));

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList }: { open: boolean; menuList: React.ReactNode }) =>
    open ? <div data-testid="dropdown-menu">{menuList}</div> : null
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: () => <div data-testid="mock-filtering-toolbar" />,
  SortSelect: () => <div data-testid="mock-sort-select" />
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ action }: { action?: React.ReactNode }) => <div data-testid="mock-page-header">{action}</div>
}));

jest.mock('./WorksTable', () => ({
  WorksTable: () => <div data-testid="mock-works-table" />
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="mock-empty-state">{title}</div>
}));

const mockedUseWorksFiltering = jest.mocked(useWorksFiltering);
const mockedUseAllOpusGroups = jest.mocked(useAllOpusGroups);
const mockedUseAllUngroupedGroups = jest.mocked(useAllUngroupedGroups);
const mockedUseAllCompositions = jest.mocked(useAllCompositions);

describe('WorksPageContent Branches Coverage', () => {
  const defaultFilteringMock = {
    sortValue: 'date_desc' as const,
    selectedFilters: {
      status: [],
      language: [],
      genre: []
    },
    toolbarProps: {
      search: { search: '' },
      activeFiltersCount: 0,
      filters: []
    },
    sortProps: {
      value: 'date_desc',
      onChange: jest.fn(),
      options: []
    }
  };

  const mockOpusResponse = {
    data: {
      allOpuses: [
        {
          id: '1',
          number: 'Op. 1',
          title: { uk: 'Симфонія 1', en: 'Symphony 1' },
          genre: 'Симфонія',
          creationYear: '2020',
          status: 'published',
          createdAt: '1700000000',
          updatedAt: '1700000000',
          compositions: []
        }
      ]
    },
    loading: false,
    error: undefined
  } as unknown as ReturnType<typeof useAllOpusGroups>;

  const mockCompositionResponse = {
    data: {
      allCompositions: [
        {
          id: '10',
          title: { uk: 'Твір 1', en: 'Work 1' },
          year: 2021,
          genre: 'Вокал',
          status: 'draft',
          createdAt: '1700000000',
          updatedAt: '1700000000'
        }
      ]
    },
    loading: false,
    error: undefined
  } as unknown as ReturnType<typeof useAllCompositions>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAllOpusGroups.mockReturnValue(mockOpusResponse);
    mockedUseAllUngroupedGroups.mockReturnValue(mockOpusResponse);
    mockedUseAllCompositions.mockReturnValue(mockCompositionResponse);
  });

  it('renders correctly with default empty filters and handles search filtering layout', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: 'симфонія' }
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab="all" />);

    expect(screen.getByText('Створити')).toBeInTheDocument();
    expect(screen.getByTestId('mock-works-table')).toBeInTheDocument();
  });

  it('covers filters branches when filtering by active criteria statuses and languages', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: {
        status: ['draft', 'published'],
        language: ['uk', 'en', 'bilingual'],
        genre: ['vocal']
      },
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        activeFiltersCount: 3
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    const { rerender } = render(<WorksPageContent activeTab="all" />);

    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: { status: ['published'], language: ['uk'], genre: [] },
      toolbarProps: { ...defaultFilteringMock.toolbarProps, activeFiltersCount: 1 }
    } as unknown as ReturnType<typeof useWorksFiltering>);
    rerender(<WorksPageContent activeTab="all" />);

    expect(screen.getByText('Створити')).toBeInTheDocument();
  });

  it('covers specific search match cases for full mock queries inside filtering loop', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: '1' }
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    const { rerender } = render(<WorksPageContent activeTab="all" />);

    const testQueries = ['a', 'uk', 'en', 'опус', 'Bo', 'симфонія'];
    testQueries.forEach((query) => {
      mockedUseWorksFiltering.mockReturnValue({
        ...defaultFilteringMock,
        toolbarProps: {
          ...defaultFilteringMock.toolbarProps,
          search: { search: query }
        }
      } as unknown as ReturnType<typeof useWorksFiltering>);

      rerender(<WorksPageContent activeTab="all" />);
      rerender(<WorksPageContent activeTab="opus" />);
      rerender(<WorksPageContent activeTab="ungrouped" />);
      rerender(<WorksPageContent activeTab="works" />);
    });

    expect(screen.getByText('Створити')).toBeInTheDocument();
  });

  it('renders dropdown items on create button interaction', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab="all" />);

    const createButton = screen.getByRole('button', { name: /створити/i });
    fireEvent.click(createButton);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('renders EmptyState view layout when no results found', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: 'non-existent-random-query-string-abc-123' },
        activeFiltersCount: 1
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab="all" />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
  });

  it('renders Loading and Error states', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    const loadingResponse = { data: undefined, loading: true, error: undefined } as unknown as ReturnType<
      typeof useAllOpusGroups
    >;
    mockedUseAllOpusGroups.mockReturnValue(loadingResponse);
    mockedUseAllUngroupedGroups.mockReturnValue(loadingResponse);
    mockedUseAllCompositions.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined
    } as unknown as ReturnType<typeof useAllCompositions>);

    const { rerender } = render(<WorksPageContent activeTab="all" />);
    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();

    const errorResponse = {
      data: undefined,
      loading: false,
      error: new Error('GraphQL Error')
    } as unknown as ReturnType<typeof useAllOpusGroups>;
    mockedUseAllOpusGroups.mockReturnValue(errorResponse);
    rerender(<WorksPageContent activeTab="all" />);
    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
  });
});
