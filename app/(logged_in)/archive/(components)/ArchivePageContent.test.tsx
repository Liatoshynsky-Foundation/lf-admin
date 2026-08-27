import { fireEvent, render, screen, within } from '@testing-library/react';

import type { FundsTableProps } from './archive-funds-table/ArchiveFundsTable';
import { ArchivePageContent } from './ArchivePageContent';
import { ARCHIVE_ITEMS_PER_PAGE, ARCHIVE_TABS } from '~/constants/archive';
import {
  FUNDS_EMPTY_STATE_DESCRIPTION,
  FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  FUNDS_EMPTY_STATE_NO_RESULTS_TITLE,
  FUNDS_EMPTY_STATE_TITLE,
  FUNDS_ERROR_STATE_DESCRIPTION,
  FUNDS_ERROR_STATE_TITLE,
  FUNDS_LOADING_STATE_DESCRIPTION,
  FUNDS_LOADING_STATE_TITLE
} from '~/constants/fund';

type MappedFund = ReturnType<typeof mockFund>;

function mockFund(
  overrides: Partial<{
    id: string;
    fundNumber: number;
    name: string;
    descriptions: number;
    cases: number;
    dates: string;
    status: string;
    updatedAt: string;
  }> = {}
) {
  return {
    id: '1',
    fundNumber: 1,
    name: 'Fund',
    descriptions: 1,
    cases: 1,
    dates: '1900-2000',
    status: 'published',
    updatedAt: '2023-01-01',
    ...overrides
  };
}

jest.mock('./archive-funds-table/ArchiveFundsTable', () => ({
  __esModule: true,
  FundsTable: ({ funds, hasActiveSearch, hasActiveStatusFilter }: FundsTableProps) => (
    <div data-testid="funds-table">
      <div data-testid="funds-table-has-active-search">{JSON.stringify(hasActiveSearch)}</div>
      <div data-testid="funds-table-has-active-status-filter">{JSON.stringify(hasActiveStatusFilter)}</div>
      <div data-testid="funds-table-funds">
        {funds.map((fund) => (
          <div key={fund.id} data-testid={`funds-table-item-${fund.id}`}>
            {fund.name} - {fund.fundNumber}
          </div>
        ))}
      </div>
    </div>
  )
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  __esModule: true,
  PageHeader: ({
    title,
    activeTab,
    tabs,
    action
  }: {
    title: string;
    activeTab: string;
    tabs: { value: string; label: string; href: string }[];
    action: React.ReactNode;
  }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <div>{action}</div>
      <div data-testid="tabs">
        {tabs.map((tab) => (
          <a key={tab.value} role="tab" aria-selected={tab.value === activeTab} href={tab.href}>
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  )
}));

jest.mock('~/shared/components/empty-state', () => ({
  __esModule: true,
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div data-testid="empty-state-title">{title}</div>
      <div data-testid="empty-state-description">{description}</div>
    </div>
  )
}));

jest.mock('~/shared/components/pagination/Pagination', () => ({
  __esModule: true,
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  }) => (
    <div data-testid="mock-pagination">
      <span data-testid="pagination-current-page">{currentPage}</span>
      <span data-testid="pagination-total-pages">{totalPages}</span>
      <button
        type="button"
        onClick={(event) => onPageChange(event as unknown as React.ChangeEvent<unknown>, currentPage + 1)}
      >
        next-page
      </button>
    </div>
  )
}));

const mockUsePaginatedFunds = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  usePaginatedFunds: (...args: unknown[]) => mockUsePaginatedFunds(...args)
}));

const mockSearchProps = {
  search: '',
  setSearch: jest.fn(),
  options: []
};

const mockStatusFilterProps = {
  label: 'Status Label',
  options: [],
  onChange: jest.fn(),
  value: [] as string[]
};

const defaultMockReturnValue = {
  searchProps: mockSearchProps,
  statusFilterProps: mockStatusFilterProps
};

const mockUseArchiveFiltering = jest.fn();

jest.mock('../(hooks)/useArchiveFiltering', () => ({
  __esModule: true,
  useArchiveFiltering: () => mockUseArchiveFiltering()
}));

jest.mock('./ArchiveCreateAction', () => ({
  __esModule: true,
  ArchiveCreateAction: () => <div data-testid="archive-create-action">Create Action</div>
}));

jest.mock('~/shared/components/search-status-toolbar/SearchStatusToolbar', () => ({
  __esModule: true,
  SearchStatusToolbar: ({
    dataTestId,
    searchProps,
    statusFilterProps
  }: {
    dataTestId: string;
    searchProps: { search: string };
    statusFilterProps: { label: string };
  }) => (
    <div data-testid={dataTestId}>
      <input data-testid="search" defaultValue={searchProps.search} readOnly />
      <span data-testid="status-dropdown">{statusFilterProps.label}</span>
    </div>
  )
}));

describe('ArchivePageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseArchiveFiltering.mockReturnValue(defaultMockReturnValue);
    mockUsePaginatedFunds.mockReturnValue({
      funds: [] as MappedFund[],
      totalPages: 0,
      loading: false,
      error: undefined
    });
  });

  it('should render the header, tabs & the search & the status dropdown correctly', () => {
    mockUseArchiveFiltering.mockReturnValue({
      ...defaultMockReturnValue,
      searchProps: { ...mockSearchProps, search: 'C Fund' }
    });
    render(<ArchivePageContent activeTab="all" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Архів');
    expect(screen.getByTestId('archive-create-action')).toBeInTheDocument();

    const tabsContainer = screen.getByTestId('tabs');
    const tabs = within(tabsContainer).getAllByRole('tab');
    expect(tabs).toHaveLength(ARCHIVE_TABS.length);

    ARCHIVE_TABS.forEach((tab) => {
      expect(within(tabsContainer).getByText(tab.label)).toBeInTheDocument();
      expect(within(tabsContainer).getByText(tab.label)).toHaveAttribute('href', tab.href);
    });

    const toolbar = screen.getByTestId('archive-control-panel');
    expect(toolbar).toBeInTheDocument();

    const searchInput = within(toolbar).getByTestId('search');
    expect(searchInput).toHaveValue('C Fund');

    const statusDropdown = within(toolbar).getByTestId('status-dropdown');
    expect(statusDropdown).toHaveTextContent('Status Label');
  });

  it('should call usePaginatedFunds with page 1, the page size and undefined search/statuses when no filters are active', () => {
    render(<ArchivePageContent activeTab="all" />);

    expect(mockUsePaginatedFunds).toHaveBeenCalledWith(1, ARCHIVE_ITEMS_PER_PAGE, {
      search: undefined,
      statuses: undefined
    });
  });

  it('should call usePaginatedFunds with the trimmed search and selected statuses when filters are active', () => {
    mockUseArchiveFiltering.mockReturnValue({
      searchProps: { ...mockSearchProps, search: 'archive' },
      statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
    });

    render(<ArchivePageContent activeTab="all" />);

    expect(mockUsePaginatedFunds).toHaveBeenCalledWith(1, ARCHIVE_ITEMS_PER_PAGE, {
      search: 'archive',
      statuses: ['published']
    });
  });

  describe('content states', () => {
    it('should show the loading empty state while loading', () => {
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: true, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_LOADING_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_LOADING_STATE_DESCRIPTION);
      expect(screen.queryByTestId('funds-table')).not.toBeInTheDocument();
    });

    it('should show the error empty state on error, even if funds were returned', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 1,
        loading: false,
        error: new Error('boom')
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_ERROR_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_ERROR_STATE_DESCRIPTION);
      expect(screen.queryByTestId('funds-table')).not.toBeInTheDocument();
    });

    it('should show the base empty state when there are no funds and no active search/filter', () => {
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_EMPTY_STATE_DESCRIPTION);
    });

    it('should show the no-results empty state when there are no funds but a search is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'nothing matches' },
        statusFilterProps: mockStatusFilterProps
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
        FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION.replace(/\s+/g, ' ')
      );
    });

    it('should show the no-results empty state when there are no funds but a status filter is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: mockSearchProps,
        statusFilterProps: { ...mockStatusFilterProps, value: ['hidden'] }
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_NO_RESULTS_TITLE);
    });

    it('should render the funds table, sorted ascending by fundNumber, when funds are present', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [
          mockFund({ id: '3', fundNumber: 3, name: 'C Fund' }),
          mockFund({ id: '1', fundNumber: 1, name: 'A Fund' }),
          mockFund({ id: '2', fundNumber: 2, name: 'B Fund' })
        ],
        totalPages: 1,
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('funds-table')).toBeInTheDocument();
      const items = screen.getAllByTestId(/^funds-table-item-/);
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('A Fund');
      expect(items[1]).toHaveTextContent('B Fund');
      expect(items[2]).toHaveTextContent('C Fund');
    });
  });

  describe('hasActiveSearch / hasActiveStatusFilter props passed to FundsTable', () => {
    beforeEach(() => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 1,
        loading: false,
        error: undefined
      });
    });

    it('should be false/false with no filters active', () => {
      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('funds-table-has-active-search')).toHaveTextContent('false');
      expect(screen.getByTestId('funds-table-has-active-status-filter')).toHaveTextContent('false');
    });

    it('should be true when search has a value', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'C Fund' },
        statusFilterProps: mockStatusFilterProps
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('funds-table-has-active-search')).toHaveTextContent('true');
    });

    it('should be true when a specific status is selected', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: mockSearchProps,
        statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('funds-table-has-active-status-filter')).toHaveTextContent('true');
    });
  });

  describe('pagination', () => {
    it('should not render pagination when there is one page or fewer', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 1,
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
    });

    it('should render pagination with the current page and total pages when there is more than one page', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 3,
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('1');
      expect(screen.getByTestId('pagination-total-pages')).toHaveTextContent('3');
    });

    it('should request the next page from usePaginatedFunds when pagination triggers a page change', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 3,
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);

      fireEvent.click(screen.getByText('next-page'));

      expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('2');
      expect(mockUsePaginatedFunds).toHaveBeenLastCalledWith(2, ARCHIVE_ITEMS_PER_PAGE, {
        search: undefined,
        statuses: undefined
      });
    });

    it('should reset to page 1 when the search value changes', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 3,
        loading: false,
        error: undefined
      });

      const { rerender } = render(<ArchivePageContent activeTab="all" />);

      fireEvent.click(screen.getByText('next-page'));
      expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('2');

      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'archive' },
        statusFilterProps: mockStatusFilterProps
      });
      rerender(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('1');
    });

    it('should clamp the current page down to the last valid page when it becomes out of range', () => {
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 3,
        loading: false,
        error: undefined
      });

      const { rerender } = render(<ArchivePageContent activeTab="all" />);

      fireEvent.click(screen.getByText('next-page'));
      fireEvent.click(screen.getByText('next-page'));
      expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('3');

      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund()],
        totalPages: 1,
        loading: false,
        error: undefined
      });
      rerender(<ArchivePageContent activeTab="all" />);

      expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
      expect(mockUsePaginatedFunds).toHaveBeenLastCalledWith(1, ARCHIVE_ITEMS_PER_PAGE, {
        search: undefined,
        statuses: undefined
      });
    });
  });
});
