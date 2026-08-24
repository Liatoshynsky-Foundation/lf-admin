import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';

import type { FundsTableProps } from './archive-funds-table/ArchiveFundsTable';
import { ArchivePageContent } from './ArchivePageContent';
import { ARCHIVE_TABS } from '~/constants/archive';
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

const mockUseAllFunds = jest.fn();
const mockUpdateFund = jest.fn();
const mockHasPublishedCasesInFund = jest.fn();

jest.mock('~/shared/hooks/use-funds/useFunds', () => ({
  __esModule: true,
  useAllFunds: (...args: unknown[]) => mockUseAllFunds(...args),
  useUpdateFund: () => [mockUpdateFund, { loading: false }],
  useHasPublishedCasesInFund: () => mockHasPublishedCasesInFund
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
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
    mockUseAllFunds.mockReturnValue({ funds: [] as MappedFund[], loading: false, error: undefined });
    mockUpdateFund.mockResolvedValue({ data: { updateFund: { id: '1', updatedAt: '2026-08-23' } } });
    mockHasPublishedCasesInFund.mockResolvedValue(true);
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

  it('should call useAllFunds with undefined search/statuses when no filters are active', () => {
    render(<ArchivePageContent activeTab="all" />);

    expect(mockUseAllFunds).toHaveBeenCalledWith({ search: undefined, statuses: undefined });
  });

  it('should call useAllFunds with the trimmed search and selected statuses when filters are active', () => {
    mockUseArchiveFiltering.mockReturnValue({
      searchProps: { ...mockSearchProps, search: 'archive' },
      statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
    });

    render(<ArchivePageContent activeTab="all" />);

    expect(mockUseAllFunds).toHaveBeenCalledWith({ search: 'archive', statuses: ['published'] });
  });

  describe('content states', () => {
    it('should show the loading empty state while loading', () => {
      mockUseAllFunds.mockReturnValue({ funds: [], loading: true, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_LOADING_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_LOADING_STATE_DESCRIPTION);
      expect(screen.queryByTestId('funds-table')).not.toBeInTheDocument();
    });

    it('should show the error empty state on error, even if funds were returned', () => {
      mockUseAllFunds.mockReturnValue({ funds: [mockFund()], loading: false, error: new Error('boom') });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_ERROR_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_ERROR_STATE_DESCRIPTION);
      expect(screen.queryByTestId('funds-table')).not.toBeInTheDocument();
    });

    it('should show the base empty state when there are no funds and no active search/filter', () => {
      mockUseAllFunds.mockReturnValue({ funds: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FUNDS_EMPTY_STATE_DESCRIPTION);
    });

    it('should show the no-results empty state when there are no funds but a search is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'nothing matches' },
        statusFilterProps: mockStatusFilterProps
      });
      mockUseAllFunds.mockReturnValue({ funds: [], loading: false, error: undefined });

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
      mockUseAllFunds.mockReturnValue({ funds: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FUNDS_EMPTY_STATE_NO_RESULTS_TITLE);
    });

    it('should render the funds table, sorted ascending by fundNumber, when funds are present', () => {
      mockUseAllFunds.mockReturnValue({
        funds: [
          mockFund({ id: '3', fundNumber: 3, name: 'C Fund' }),
          mockFund({ id: '1', fundNumber: 1, name: 'A Fund' }),
          mockFund({ id: '2', fundNumber: 2, name: 'B Fund' })
        ],
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

    it('should open the empty fund warning before publishing a hidden fund with no cases', async () => {
      const user = userEvent.setup();
      mockUseAllFunds.mockReturnValue({
        funds: [mockFund({ status: 'hidden', cases: 0 })],
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
      expect(mockUpdateFund).not.toHaveBeenCalled();

      await user.click(screen.getByText('confirm publish'));

      expect(mockUpdateFund).toHaveBeenCalledWith({ id: '1', input: { status: 'published' } });
      expect(toast.success).toHaveBeenCalledWith('Фонд опубліковано.');
      await waitFor(() => expect(screen.getByTestId('funds-table-item-1')).toHaveTextContent('published'));
    });

    it('should publish a hidden fund immediately when it has published cases', async () => {
      const user = userEvent.setup();
      mockUseAllFunds.mockReturnValue({
        funds: [mockFund({ status: 'hidden', cases: 2 })],
        loading: false,
        error: undefined
      });
      mockHasPublishedCasesInFund.mockResolvedValue(true);

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(mockHasPublishedCasesInFund).toHaveBeenCalledWith('1');
      expect(screen.queryByTestId('publish-empty-fund-dialog')).not.toBeInTheDocument();
      expect(mockUpdateFund).toHaveBeenCalledWith({ id: '1', input: { status: 'published' } });
    });

    it('should open the warning when a hidden fund has cases but none are published', async () => {
      const user = userEvent.setup();
      mockUseAllFunds.mockReturnValue({
        funds: [mockFund({ status: 'hidden', cases: 2 })],
        loading: false,
        error: undefined
      });
      mockHasPublishedCasesInFund.mockResolvedValue(false);

      render(<ArchivePageContent activeTab="all" />);
      await user.click(screen.getByText('publish 1'));

      expect(screen.getByTestId('publish-empty-fund-dialog')).toBeInTheDocument();
      expect(mockUpdateFund).not.toHaveBeenCalled();
    });
  });

  describe('hasActiveSearch / hasActiveStatusFilter props passed to FundsTable', () => {
    beforeEach(() => {
      mockUseAllFunds.mockReturnValue({ funds: [mockFund()], loading: false, error: undefined });
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
});
