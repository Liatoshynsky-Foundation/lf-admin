import { fireEvent, render, screen } from '@testing-library/react';
import React, { act } from 'react';

import { useCreateWorkAction } from './(composition)/useCreateWorkAction';
import { useWorksFiltering } from './useWorksFiltering';
import { WorksPageContent } from './WorksPageContent';
import { usePaginatedWorks } from '~/shared/hooks/use-opuses/useOpuses';

jest.mock('./useWorksFiltering', () => ({
  useWorksFiltering: jest.fn()
}));

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  usePaginatedWorks: jest.fn()
}));

jest.mock('./(composition)/useCreateWorkAction', () => ({
  useCreateWorkAction: jest.fn()
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

jest.mock('@mui/material/ButtonBase/TouchRipple', () => {
  return function MockTouchRipple() {
    return null;
  };
});

jest.mock('~/shared/components/pagination/Pagination', () => ({
  Pagination: ({
    onPageChange,
    currentPage,
    totalPages
  }: {
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    currentPage: number;
    totalPages: number;
  }) => (
    <div data-testid="mock-pagination">
      <span data-testid="pagination-current-page">{currentPage}</span>
      <span data-testid="pagination-total-pages">{totalPages}</span>
      <button
        type="button"
        data-testid="pagination-next-page-button"
        onClick={(event) => onPageChange(event as unknown as React.ChangeEvent<unknown>, currentPage + 1)}
      >
        Next
      </button>
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
    menuItems: Array<{ items: Array<{ id: string; text: { name: string }; onClick?: () => void; href?: string }> }>;
  }) =>
    anchorEl ? (
      <div data-testid="dropdown-menu">
        <button type="button" data-testid="dropdown-menu-close-button" onClick={onClose}>
          Close
        </button>
        {menuItems.flatMap((group) =>
          group.items.map((item) => (
            <button key={item.id} type="button" data-testid={`menu-item-${item.id}`} onClick={item.onClick}>
              {item.text.name}
            </button>
          ))
        )}
      </div>
    ) : null
}));

jest.mock('~/shared/components/forms/opus-details-block/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="composition-modal" /> : null)
}));

const mockedUseWorksFiltering = jest.mocked(useWorksFiltering);
const mockedUsePaginatedWorks = jest.mocked(usePaginatedWorks);
const mockedUseCreateWorkAction = jest.mocked(useCreateWorkAction);

describe('WorksPageContent', () => {
  const DEFAULT_ACTIVE_TAB = 'all' as const;
  const OP_ACTIVE_TAB = 'op' as const;
  const SINEOP_ACTIVE_TAB = 'sineop' as const;
  const COMPOSITIONS_ACTIVE_TAB = 'compositions' as const;

  const DEFAULT_SORT_VALUE = 'date_desc' as const;
  const ALTERNATIVE_SORT_VALUES = ['date_asc', 'name_asc', 'name_desc'] as const;

  const DEFAULT_SEARCH_QUERY = '';
  const ACTIVE_SEARCH_QUERY = 'симфонія';
  const NON_EXISTENT_SEARCH_QUERY = 'non-existent-random-query-string-abc-123';

  const DEFAULT_PAGE = 1;
  const NEXT_PAGE = 2;
  const TOTAL_PAGES_MULTIPLE = 3;
  const TOTAL_ITEMS_MULTIPLE = 30;

  const defaultFilteringMock = {
    requestFilters: {},
    sortValue: DEFAULT_SORT_VALUE,
    selectedFilters: {
      status: [],
      language: [],
      genre: []
    },
    toolbarProps: {
      search: { search: DEFAULT_SEARCH_QUERY },
      activeFiltersCount: 0,
      filters: []
    },
    sortProps: {
      value: DEFAULT_SORT_VALUE,
      onChange: jest.fn(),
      options: []
    }
  };

  const mockPaginatedResponse = {
    items: [
      {
        id: '1',
        number: 'op. 1',
        name: { uk: 'Симфонія 1', en: 'Symphony 1' },
        genre: 'Симфонія',
        creationYear: '2020',
        status: 'published',
        createdAt: '1700000000',
        updatedAt: '1700000000',
        compositions: []
      },
      {
        id: '2',
        number: 'op. 2',
        name: { uk: 'Симфонія 2', en: 'Symphony 2' },
        genre: 'Симфонія',
        creationYear: '2021',
        status: 'published',
        createdAt: '1600000000',
        updatedAt: '1600000000',
        compositions: []
      }
    ],
    totalPages: 1,
    totalItems: 2,
    loading: false,
    error: null
  } as unknown as ReturnType<typeof usePaginatedWorks>;

  const defaultCreateWorkActionMock = {
    isModalOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    handleSubmit: jest.fn(),
    isSubmitting: false,
    error: null
  } as unknown as ReturnType<typeof useCreateWorkAction>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePaginatedWorks.mockReturnValue(mockPaginatedResponse);
    mockedUseCreateWorkAction.mockReturnValue(defaultCreateWorkActionMock);
  });

  it('renders correctly with default empty filters and handles search filtering layout', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: ACTIVE_SEARCH_QUERY }
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

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

    const { rerender } = render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: { status: ['published'], language: ['uk'], genre: [] },
      toolbarProps: { ...defaultFilteringMock.toolbarProps, activeFiltersCount: 1 }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    rerender(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    expect(screen.getByText('Створити')).toBeInTheDocument();
  });

  it('covers rerenders across tabs for different search queries without crashing', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: '1' }
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    const { rerender } = render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    const testQueries = ['a', 'uk', 'en', 'опус', 'Bo', ACTIVE_SEARCH_QUERY];
    testQueries.forEach((query) => {
      mockedUseWorksFiltering.mockReturnValue({
        ...defaultFilteringMock,
        toolbarProps: {
          ...defaultFilteringMock.toolbarProps,
          search: { search: query }
        }
      } as unknown as ReturnType<typeof useWorksFiltering>);

      rerender(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);
      rerender(<WorksPageContent activeTab={OP_ACTIVE_TAB} />);
      rerender(<WorksPageContent activeTab={SINEOP_ACTIVE_TAB} />);
      rerender(<WorksPageContent activeTab={COMPOSITIONS_ACTIVE_TAB} />);
    });

    expect(screen.getByText('Створити')).toBeInTheDocument();
  });

  it('renders dropdown items and handles work creation modal trigger on create button interaction', async () => {
    const openModalMock = jest.fn();
    mockedUseCreateWorkAction.mockReturnValue({
      ...defaultCreateWorkActionMock,
      openModal: openModalMock
    });
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    const createButton = screen.getByRole('button', { name: /створити/i });
    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

    const workMenuItem = screen.getByTestId('menu-item-work');
    fireEvent.click(workMenuItem);
    expect(openModalMock).toHaveBeenCalledTimes(1);
  });

  it('renders composition modal when isModalOpen is true', () => {
    mockedUseCreateWorkAction.mockReturnValue({
      ...defaultCreateWorkActionMock,
      isModalOpen: true
    });
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    const createButton = screen.getByRole('button', { name: /створити/i });
    fireEvent.click(createButton);

    expect(screen.getByTestId('composition-modal')).toBeInTheDocument();
  });

  it('renders EmptyState view layout when no results found', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: NON_EXISTENT_SEARCH_QUERY },
        activeFiltersCount: 1
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    mockedUsePaginatedWorks.mockReturnValue({
      items: [],
      totalPages: 0,
      totalItems: 0,
      loading: false,
      error: null
    } as unknown as ReturnType<typeof usePaginatedWorks>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
  });

  it('renders Loading and Error states', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    const loadingResponse = {
      items: [],
      totalPages: 0,
      totalItems: 0,
      loading: true,
      error: null
    } as unknown as ReturnType<typeof usePaginatedWorks>;

    mockedUsePaginatedWorks.mockReturnValue(loadingResponse);

    const { rerender } = render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);
    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();

    const errorResponse = {
      items: [],
      totalPages: 0,
      totalItems: 0,
      loading: false,
      error: new Error('GraphQL Error')
    } as unknown as ReturnType<typeof usePaginatedWorks>;

    mockedUsePaginatedWorks.mockReturnValue(errorResponse);
    rerender(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);
    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
  });

  it('covers sort value branches passed through to useWorksFiltering', () => {
    ALTERNATIVE_SORT_VALUES.forEach((sort) => {
      mockedUseWorksFiltering.mockReturnValue({
        ...defaultFilteringMock,
        sortValue: sort
      } as unknown as ReturnType<typeof useWorksFiltering>);

      render(<WorksPageContent activeTab={OP_ACTIVE_TAB} />);
    });

    expect(screen.getAllByTestId('mock-works-table').length).toBeGreaterThan(0);
  });

  it('renders works table when items come back with partial/missing optional fields', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: { status: [], language: ['en', 'uk'], genre: [] }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    mockedUsePaginatedWorks.mockReturnValue({
      items: [
        {
          id: '1',
          number: 'op. 1',
          name: { uk: ' ', en: 'Only English Title' },
          genre: null,
          status: null,
          createdAt: '1700000000',
          compositions: [{ id: 'c1', title: { uk: '', en: 'Comp En' } }]
        }
      ],
      totalPages: 1,
      totalItems: 1,
      loading: false,
      error: null
    } as unknown as ReturnType<typeof usePaginatedWorks>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    expect(screen.getByTestId('mock-works-table')).toBeInTheDocument();
  });

  it('covers empty states when basic filters return no results without search query', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: DEFAULT_SEARCH_QUERY },
        activeFiltersCount: 0
      },
      selectedFilters: { status: ['archived'], language: [], genre: [] }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    mockedUsePaginatedWorks.mockReturnValue({
      items: [],
      totalPages: 0,
      totalItems: 0,
      loading: false,
      error: null
    } as unknown as ReturnType<typeof usePaginatedWorks>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
  });

  it('covers fallback branch for empty/undefined search object', () => {
    mockedUseWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: undefined
      }
    } as unknown as ReturnType<typeof useWorksFiltering>);

    mockedUsePaginatedWorks.mockReturnValue({
      items: [
        {
          id: 'mock-id',
          number: 'op. 99',
          name: { uk: 'Без композицій' },
          createdAt: '1700000000',
          compositions: undefined
        }
      ],
      totalPages: 1,
      totalItems: 1,
      loading: false,
      error: null
    } as unknown as ReturnType<typeof usePaginatedWorks>);

    render(<WorksPageContent activeTab={OP_ACTIVE_TAB} />);

    expect(screen.getByTestId('mock-works-table')).toBeInTheDocument();
  });

  it('covers handleToggle branch when create button is clicked twice to close menu', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    const createButton = screen.getByRole('button', { name: /створити/i });
    fireEvent.click(createButton);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

    fireEvent.click(createButton);
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });

  it('renders Error state explicitly when loading is complete and error exists', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    mockedUsePaginatedWorks.mockReturnValue({
      items: [],
      totalPages: 0,
      totalItems: 0,
      loading: false,
      error: new Error('GraphQL Failure')
    } as unknown as ReturnType<typeof usePaginatedWorks>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
  });

  it('updates the current page when pagination triggers handlePageChange', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    mockedUsePaginatedWorks.mockReturnValue({
      items: [
        {
          id: '1',
          number: 'op. 1',
          name: { uk: 'Симфонія 1' },
          createdAt: '1700000000',
          compositions: []
        }
      ],
      totalPages: TOTAL_PAGES_MULTIPLE,
      totalItems: TOTAL_ITEMS_MULTIPLE,
      loading: false,
      error: null
    } as unknown as ReturnType<typeof usePaginatedWorks>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    expect(screen.getByTestId('pagination-current-page')).toHaveTextContent(String(DEFAULT_PAGE));

    fireEvent.click(screen.getByTestId('pagination-next-page-button'));

    expect(screen.getByTestId('pagination-current-page')).toHaveTextContent(String(NEXT_PAGE));
  });

  it('closes the create dropdown menu when handleClose is invoked via onClose', () => {
    mockedUseWorksFiltering.mockReturnValue(defaultFilteringMock as unknown as ReturnType<typeof useWorksFiltering>);

    render(<WorksPageContent activeTab={DEFAULT_ACTIVE_TAB} />);

    const createButton = screen.getByRole('button', { name: /створити/i });
    fireEvent.click(createButton);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dropdown-menu-close-button'));
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
  });
});
