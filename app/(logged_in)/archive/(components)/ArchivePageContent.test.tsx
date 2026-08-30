import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChangeEvent, ReactNode } from 'react';
import toast from 'react-hot-toast';

import type { FundsTableProps } from './archive-funds-table/ArchiveFundsTable';
import { ArchivePageContent } from './ArchivePageContent';
import {
  ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE,
  ARCHIVE_ERROR_STATE_TITLE,
  ARCHIVE_ITEMS_PER_PAGE,
  ARCHIVE_LOADING_STATE_TITLE,
  ARCHIVE_TABS
} from '~/constants/archive';
import {
  CASES_EMPTY_STATE_DESCRIPTION,
  CASES_EMPTY_STATE_NO_RESULTS_TITLE,
  CASES_EMPTY_STATE_TITLE,
  CASES_ERROR_STATE_TITLE,
  CASES_LOADING_STATE_TITLE
} from '~/constants/case';
import { FundErrors } from '~/constants/errors';
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

function mockCase(overrides: Partial<{ id: string; caseNumber: number; name: string }> = {}) {
  return {
    id: '1',
    caseNumber: 1,
    name: 'Справа',
    ...overrides
  };
}

jest.mock('./archive-funds-table/ArchiveFundsTable', () => ({
  __esModule: true,
  FundsTable: ({ funds, hasActiveSearch, hasActiveStatusFilter, onPublish }: FundsTableProps) => (
    <div data-testid="funds-table">
      <div data-testid="funds-table-has-active-search">{JSON.stringify(hasActiveSearch)}</div>
      <div data-testid="funds-table-has-active-status-filter">{JSON.stringify(hasActiveStatusFilter)}</div>
      <div data-testid="funds-table-funds">
        {funds.map((fund) => (
          <div key={fund.id} data-testid={`funds-table-item-${fund.id}`}>
            {fund.name} - {fund.fundNumber} - {fund.status}
            <button onClick={() => onPublish?.(fund)}>publish {fund.id}</button>
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
    action: ReactNode;
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
    onPageChange: (event: ChangeEvent<unknown>, page: number) => void;
  }) => (
    <div data-testid="mock-pagination">
      <span data-testid="pagination-current-page">{currentPage}</span>
      <span data-testid="pagination-total-pages">{totalPages}</span>
      <button
        type="button"
        onClick={(event) => onPageChange(event as unknown as ChangeEvent<unknown>, currentPage + 1)}
      >
        next-page
      </button>
    </div>
  )
}));

const mockUsePaginatedFunds = jest.fn();
const mockUpdateFund = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  usePaginatedFunds: (...args: unknown[]) => mockUsePaginatedFunds(...args),
  useUpdateFund: () => [mockUpdateFund, { loading: false }]
}));

const mockCheckFundPublishWarning = jest.fn();

jest.mock('../(hooks)/useFundPublishWarning', () => ({
  __esModule: true,
  useFundPublishWarning: () => mockCheckFundPublishWarning
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

const mockUseAllCases = jest.fn();

jest.mock('~/shared/hooks/use-cases/useCases', () => ({
  __esModule: true,
  useAllCases: (...args: unknown[]) => mockUseAllCases(...args)
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
  statusFilterProps: mockStatusFilterProps,
  appliedSearch: ''
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

jest.mock('./publish-empty-fund-dialog/PublishEmptyFundDialog', () => ({
  __esModule: true,
  PublishEmptyFundDialog: ({
    open,
    onCancel,
    onConfirm
  }: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="publish-empty-fund-dialog">
        <button onClick={onCancel}>cancel publish</button>
        <button onClick={onConfirm}>confirm publish</button>
      </div>
    ) : null
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
    mockUpdateFund.mockResolvedValue({ data: { updateFund: { id: '1', updatedAt: '2026-08-23' } } });
    mockCheckFundPublishWarning.mockResolvedValue('publish');
    mockUseAllCases.mockReturnValue({ cases: [], loading: false, error: undefined });
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

  it('should call usePaginatedFunds and useAllCases with undefined search/statuses when no filters are active', () => {
    render(<ArchivePageContent activeTab="all" />);

    expect(mockUsePaginatedFunds).toHaveBeenCalledWith(
      1,
      ARCHIVE_ITEMS_PER_PAGE,
      { search: undefined, statuses: undefined },
      { skip: false }
    );
    expect(mockUseAllCases).toHaveBeenCalledWith(
      { search: undefined, statuses: undefined },
      { skip: false }
    );
  });

  it('should call usePaginatedFunds and useAllCases with the trimmed search and selected statuses when filters are active', () => {
    mockUseArchiveFiltering.mockReturnValue({
      searchProps: { ...mockSearchProps, search: 'archive' },
      appliedSearch: 'archive',
      statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
    });

    render(<ArchivePageContent activeTab="all" />);

    expect(mockUsePaginatedFunds).toHaveBeenCalledWith(
      1,
      ARCHIVE_ITEMS_PER_PAGE,
      { search: 'archive', statuses: ['published'] },
      { skip: false }
    );
    expect(mockUseAllCases).toHaveBeenCalledWith(
      { search: 'archive', statuses: ['published'] },
      { skip: false }
    );
  });

  it('should skip the cases query on the funds tab and the funds query on the cases tab', () => {
    render(<ArchivePageContent activeTab="fonds" />);
    expect(mockUsePaginatedFunds).toHaveBeenCalledWith(
      1,
      ARCHIVE_ITEMS_PER_PAGE,
      { search: undefined, statuses: undefined },
      { skip: false }
    );
    expect(mockUseAllCases).toHaveBeenCalledWith(
      { search: undefined, statuses: undefined },
      { skip: true }
    );

    mockUsePaginatedFunds.mockClear();
    mockUseAllCases.mockClear();

    render(<ArchivePageContent activeTab="cases" />);
    expect(mockUsePaginatedFunds).toHaveBeenCalledWith(
      1,
      ARCHIVE_ITEMS_PER_PAGE,
      { search: undefined, statuses: undefined },
      { skip: true }
    );
    expect(mockUseAllCases).toHaveBeenCalledWith(
      { search: undefined, statuses: undefined },
      { skip: false }
    );
  });

  describe('content states', () => {
    it('should show the loading empty state while loading', () => {
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: true, error: undefined });

      render(<ArchivePageContent activeTab="fonds" />);

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

      render(<ArchivePageContent activeTab="fonds" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_ERROR_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_ERROR_STATE_DESCRIPTION);
      expect(screen.queryByTestId('funds-table')).not.toBeInTheDocument();
    });

    it('should show the base empty state when there are no funds and no active search/filter', () => {
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });

      render(<ArchivePageContent activeTab="fonds" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_EMPTY_STATE_DESCRIPTION);
    });

    it('should show the no-results empty state when there are no funds but a search is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'nothing matches' },
        appliedSearch: 'nothing matches',
        statusFilterProps: mockStatusFilterProps
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });

      render(<ArchivePageContent activeTab="fonds" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
        FUNDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION.replace(/\s+/g, ' ')
      );
    });

    it('should show the no-results empty state when there are no funds but a status filter is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: mockSearchProps,
        appliedSearch: '',
        statusFilterProps: { ...mockStatusFilterProps, value: ['hidden'] }
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });

      render(<ArchivePageContent activeTab="fonds" />);

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

      render(<ArchivePageContent activeTab="fonds" />);

      expect(screen.getByTestId('funds-table')).toBeInTheDocument();
      const items = screen.getAllByTestId(/^funds-table-item-/);
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('A Fund');
      expect(items[1]).toHaveTextContent('B Fund');
      expect(items[2]).toHaveTextContent('C Fund');
    });

    it('should open the empty fund warning before publishing a hidden fund when the warning check requires it', async () => {
      const user = userEvent.setup();
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund({ status: 'hidden', cases: 0 })],
        totalPages: 1,
        loading: false,
        error: undefined
      });
      mockCheckFundPublishWarning.mockResolvedValue('show-warning');

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(mockCheckFundPublishWarning).toHaveBeenCalledWith({ fundId: '1', casesCount: 0 });
      expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
      expect(mockUpdateFund).not.toHaveBeenCalled();

      await user.click(screen.getByText('confirm publish'));

      expect(mockUpdateFund).toHaveBeenCalledWith({ id: '1', input: { status: 'published' } });
      expect(toast.success).toHaveBeenCalledWith('Фонд опубліковано.');
      await waitFor(() => expect(screen.getByTestId('funds-table-item-1')).toHaveTextContent('published'));
    });

    it('should publish a hidden fund immediately when the warning check allows publishing', async () => {
      const user = userEvent.setup();
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund({ status: 'hidden', cases: 2 })],
        totalPages: 1,
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(mockCheckFundPublishWarning).toHaveBeenCalledWith({ fundId: '1', casesCount: 2 });
      expect(screen.queryByTestId('publish-empty-fund-dialog')).not.toBeInTheDocument();
      expect(mockUpdateFund).toHaveBeenCalledWith({ id: '1', input: { status: 'published' } });
    });

    it('should not try to publish a fund that is not hidden', async () => {
      const user = userEvent.setup();
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund({ status: 'published', cases: 2 })],
        totalPages: 1,
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(mockCheckFundPublishWarning).not.toHaveBeenCalled();
      expect(mockUpdateFund).not.toHaveBeenCalled();
    });

    it('should show an error toast when the warning check fails', async () => {
      const user = userEvent.setup();
      mockUsePaginatedFunds.mockReturnValue({
        funds: [mockFund({ status: 'hidden', cases: 2 })],
        totalPages: 1,
        loading: false,
        error: undefined
      });
      mockCheckFundPublishWarning.mockResolvedValue('error');

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(toast.error).toHaveBeenCalledWith(FundErrors.FAILED_TO_PUBLISH);
      expect(mockUpdateFund).not.toHaveBeenCalled();
    });
  });

  describe('cases content states', () => {
    it('should show the loading empty state while cases are loading', () => {
      mockUseAllCases.mockReturnValue({ cases: [], loading: true, error: undefined });

      render(<ArchivePageContent activeTab="cases" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(CASES_LOADING_STATE_TITLE);
      expect(screen.queryByTestId('cases-list')).not.toBeInTheDocument();
    });

    it('should show the error empty state on error, even if cases were returned', () => {
      mockUseAllCases.mockReturnValue({ cases: [mockCase()], loading: false, error: new Error('boom') });

      render(<ArchivePageContent activeTab="cases" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(CASES_ERROR_STATE_TITLE);
      expect(screen.queryByTestId('cases-list')).not.toBeInTheDocument();
    });

    it('should render the cases list sorted ascending by caseNumber', () => {
      mockUseAllCases.mockReturnValue({
        cases: [
          mockCase({ id: '3', caseNumber: 3, name: 'Справа В' }),
          mockCase({ id: '1', caseNumber: 1, name: 'Справа А' }),
          mockCase({ id: '2', caseNumber: 2, name: 'Справа Б' })
        ],
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="cases" />);

      const items = within(screen.getByTestId('cases-list')).getAllByRole('listitem');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Справа А');
      expect(items[1]).toHaveTextContent('Справа Б');
      expect(items[2]).toHaveTextContent('Справа В');
    });

    it('should show the base empty state when there are no cases and no active search/filter', () => {
      render(<ArchivePageContent activeTab="cases" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(CASES_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(CASES_EMPTY_STATE_DESCRIPTION);
    });

    it('should show the no-results empty state when there are no cases but a search is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        appliedSearch: 'nothing matches'
      });

      render(<ArchivePageContent activeTab="cases" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(CASES_EMPTY_STATE_NO_RESULTS_TITLE);
    });

    it('should show the no-results empty state when there are no cases but a status filter is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        statusFilterProps: { ...mockStatusFilterProps, value: ['hidden'] }
      });

      render(<ArchivePageContent activeTab="cases" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(CASES_EMPTY_STATE_NO_RESULTS_TITLE);
    });
  });

  describe('all tab empty states', () => {
    it('should show a single archive loading state while either request is loading', () => {
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: true, error: undefined });
      mockUseAllCases.mockReturnValue({ cases: [], loading: true, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getAllByTestId('empty-state')).toHaveLength(1);
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(ARCHIVE_LOADING_STATE_TITLE);
      expect(screen.queryByText(FUNDS_LOADING_STATE_TITLE)).not.toBeInTheDocument();
      expect(screen.queryByText(CASES_LOADING_STATE_TITLE)).not.toBeInTheDocument();
    });

    it('should show a single archive error state when either request fails', () => {
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: new Error('boom') });
      mockUseAllCases.mockReturnValue({ cases: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getAllByTestId('empty-state')).toHaveLength(1);
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(ARCHIVE_ERROR_STATE_TITLE);
    });

    it('should not show the funds no-results empty state when only cases match the search', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        appliedSearch: 'партитура'
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });
      mockUseAllCases.mockReturnValue({
        cases: [mockCase({ id: '2', caseNumber: 2, name: 'Звичайна назва справи' })],
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
      expect(screen.getByTestId('cases-list')).toHaveTextContent('Звичайна назва справи');
    });

    it('should not show the cases no-results empty state when only funds match the search', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        appliedSearch: 'фонд'
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [mockFund()], totalPages: 1, loading: false, error: undefined });
      mockUseAllCases.mockReturnValue({ cases: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('funds-table')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cases-list')).not.toBeInTheDocument();
    });

    it('should show a single no-results empty state when neither funds nor cases match', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        appliedSearch: 'nothing'
      });
      mockUsePaginatedFunds.mockReturnValue({ funds: [], totalPages: 0, loading: false, error: undefined });
      mockUseAllCases.mockReturnValue({ cases: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getAllByTestId('empty-state')).toHaveLength(1);
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(ARCHIVE_EMPTY_STATE_NO_RESULTS_TITLE);
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
      render(<ArchivePageContent activeTab="fonds" />);

      expect(screen.getByTestId('funds-table-has-active-search')).toHaveTextContent('false');
      expect(screen.getByTestId('funds-table-has-active-status-filter')).toHaveTextContent('false');
    });

    it('should be true when search has a value', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'C Fund' },
        appliedSearch: 'C Fund',
        statusFilterProps: mockStatusFilterProps
      });

      render(<ArchivePageContent activeTab="fonds" />);

      expect(screen.getByTestId('funds-table-has-active-search')).toHaveTextContent('true');
    });

    it('should be true when a specific status is selected', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: mockSearchProps,
        appliedSearch: '',
        statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
      });

      render(<ArchivePageContent activeTab="fonds" />);

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
      expect(mockUsePaginatedFunds).toHaveBeenLastCalledWith(
        2,
        ARCHIVE_ITEMS_PER_PAGE,
        { search: undefined, statuses: undefined },
        { skip: false }
      );
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
        appliedSearch: 'archive',
        statusFilterProps: mockStatusFilterProps
      });
      rerender(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('pagination-current-page')).toHaveTextContent('1');
    });

    it('should clamp the current page down to the last valid page when it becomes out of range', async () => {
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

      await waitFor(() => {
        expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
        expect(mockUsePaginatedFunds).toHaveBeenLastCalledWith(
          1,
          ARCHIVE_ITEMS_PER_PAGE,
          { search: undefined, statuses: undefined },
          { skip: false }
        );
      });
    });
  });
});
