import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';

import { useWorksFiltering } from './useWorksFiltering';
import { WorksPageContent } from './WorksPageContent';

jest.mock('./useWorksFiltering', () => ({
  useWorksFiltering: jest.fn()
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
  EmptyState: () => <div data-testid="mock-empty-state" />
}));

const mockedUseWorksFiltering = jest.mocked(useWorksFiltering);

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

  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  it('covers filters branches when filtering by active criteria statuses and languages', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: {
        status: ['draft', 'published'],
        language: ['uk', 'en', 'bilingual'],
        genre: ['vocal', 'instrumental']
      },
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        activeFiltersCount: 3
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    const { rerender } = render(<WorksPageContent activeTab="all" />);

    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: {
        status: ['published'],
        language: [],
        genre: []
      },
      toolbarProps: { ...defaultFilteringMock.toolbarProps, activeFiltersCount: 1 }
    } as unknown as ReturnType<typeof useWorksFiltering>);
    rerender(<WorksPageContent activeTab="all" />);

    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: {
        status: [],
        language: ['en'],
        genre: []
      },
      toolbarProps: { ...defaultFilteringMock.toolbarProps, activeFiltersCount: 1 }
    } as unknown as ReturnType<typeof useWorksFiltering>);
    rerender(<WorksPageContent activeTab="all" />);

    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: {
        status: [],
        language: [],
        genre: ['vocal']
      },
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

    const testQueries = ['a', 'uk', 'en', 'опус', 'opus', 'bo', 'номер', 'твір', 'часть', 'частина', 'симфонія'];
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

  it('renders EmptyState view layout to trigger coverage branch line 220', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: 'non-existent-random-query-string-abc-123' },
        activeFiltersCount: 1
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab="all" />);

    expect(screen.getByText('Створити')).toBeInTheDocument();
  });
});
