import { render, screen, within } from '@testing-library/react';

import type { FondsTableProps } from './archive-fonds-table/ArchiveFondsTable';
import { ArchivePageContent } from './ArchivePageContent';
import { ARCHIVE_TABS } from '~/constants/archive';
import {
  FONDS_EMPTY_STATE_DESCRIPTION,
  FONDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION,
  FONDS_EMPTY_STATE_NO_RESULTS_TITLE,
  FONDS_EMPTY_STATE_TITLE,
  FONDS_ERROR_STATE_DESCRIPTION,
  FONDS_ERROR_STATE_TITLE,
  FONDS_LOADING_STATE_DESCRIPTION,
  FONDS_LOADING_STATE_TITLE
} from '~/constants/fond';

type MappedFond = ReturnType<typeof mockFond>;

function mockFond(
  overrides: Partial<{
    id: string;
    fondNumber: number;
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
    fondNumber: 1,
    name: 'Fond',
    descriptions: 1,
    cases: 1,
    dates: '1900-2000',
    status: 'published',
    updatedAt: '2023-01-01',
    ...overrides
  };
}

jest.mock('./archive-fonds-table/ArchiveFondsTable', () => ({
  __esModule: true,
  FondsTable: ({ fonds, hasActiveSearch, hasActiveStatusFilter }: FondsTableProps) => (
    <div data-testid="fonds-table">
      <div data-testid="fonds-table-has-active-search">{JSON.stringify(hasActiveSearch)}</div>
      <div data-testid="fonds-table-has-active-status-filter">{JSON.stringify(hasActiveStatusFilter)}</div>
      <div data-testid="fonds-table-fonds">
        {fonds.map((fond) => (
          <div key={fond.id} data-testid={`fonds-table-item-${fond.id}`}>
            {fond.name} - {fond.fondNumber}
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

const mockUseAllFonds = jest.fn();

jest.mock('~/shared/hooks/use-fonds/useFonds', () => ({
  __esModule: true,
  useAllFonds: (...args: unknown[]) => mockUseAllFonds(...args)
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
    mockUseAllFonds.mockReturnValue({ fonds: [] as MappedFond[], loading: false, error: undefined });
  });

  it('should render the header, tabs & the search & the status dropdown correctly', () => {
    mockUseArchiveFiltering.mockReturnValue({
      ...defaultMockReturnValue,
      searchProps: { ...mockSearchProps, search: 'C Fond' }
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
    expect(searchInput).toHaveValue('C Fond');

    const statusDropdown = within(toolbar).getByTestId('status-dropdown');
    expect(statusDropdown).toHaveTextContent('Status Label');
  });

  it('should call useAllFonds with undefined search/statuses when no filters are active', () => {
    render(<ArchivePageContent activeTab="all" />);

    expect(mockUseAllFonds).toHaveBeenCalledWith({ search: undefined, statuses: undefined });
  });

  it('should call useAllFonds with the trimmed search and selected statuses when filters are active', () => {
    mockUseArchiveFiltering.mockReturnValue({
      searchProps: { ...mockSearchProps, search: 'archive' },
      statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
    });

    render(<ArchivePageContent activeTab="all" />);

    expect(mockUseAllFonds).toHaveBeenCalledWith({ search: 'archive', statuses: ['published'] });
  });

  describe('content states', () => {
    it('should show the loading empty state while loading', () => {
      mockUseAllFonds.mockReturnValue({ fonds: [], loading: true, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FONDS_LOADING_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FONDS_LOADING_STATE_DESCRIPTION);
      expect(screen.queryByTestId('fonds-table')).not.toBeInTheDocument();
    });

    it('should show the error empty state on error, even if fonds were returned', () => {
      mockUseAllFonds.mockReturnValue({ fonds: [mockFond()], loading: false, error: new Error('boom') });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FONDS_ERROR_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FONDS_ERROR_STATE_DESCRIPTION);
      expect(screen.queryByTestId('fonds-table')).not.toBeInTheDocument();
    });

    it('should show the base empty state when there are no fonds and no active search/filter', () => {
      mockUseAllFonds.mockReturnValue({ fonds: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FONDS_EMPTY_STATE_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(FONDS_EMPTY_STATE_DESCRIPTION);
    });

    it('should show the no-results empty state when there are no fonds but a search is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'nothing matches' },
        statusFilterProps: mockStatusFilterProps
      });
      mockUseAllFonds.mockReturnValue({ fonds: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FONDS_EMPTY_STATE_NO_RESULTS_TITLE);
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
        FONDS_EMPTY_STATE_NO_RESULTS_DESCRIPTION.replace(/\s+/g, ' ')
      );
    });

    it('should show the no-results empty state when there are no fonds but a status filter is active', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: mockSearchProps,
        statusFilterProps: { ...mockStatusFilterProps, value: ['hidden'] }
      });
      mockUseAllFonds.mockReturnValue({ fonds: [], loading: false, error: undefined });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(FONDS_EMPTY_STATE_NO_RESULTS_TITLE);
    });

    it('should render the fonds table, sorted ascending by fondNumber, when fonds are present', () => {
      mockUseAllFonds.mockReturnValue({
        fonds: [
          mockFond({ id: '3', fondNumber: 3, name: 'C Fond' }),
          mockFond({ id: '1', fondNumber: 1, name: 'A Fond' }),
          mockFond({ id: '2', fondNumber: 2, name: 'B Fond' })
        ],
        loading: false,
        error: undefined
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table')).toBeInTheDocument();
      const items = screen.getAllByTestId(/^fonds-table-item-/);
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('A Fond');
      expect(items[1]).toHaveTextContent('B Fond');
      expect(items[2]).toHaveTextContent('C Fond');
    });
  });

  describe('hasActiveSearch / hasActiveStatusFilter props passed to FondsTable', () => {
    beforeEach(() => {
      mockUseAllFonds.mockReturnValue({ fonds: [mockFond()], loading: false, error: undefined });
    });

    it('should be false/false with no filters active', () => {
      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-search')).toHaveTextContent('false');
      expect(screen.getByTestId('fonds-table-has-active-status-filter')).toHaveTextContent('false');
    });

    it('should be true when search has a value', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: { ...mockSearchProps, search: 'C Fond' },
        statusFilterProps: mockStatusFilterProps
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-search')).toHaveTextContent('true');
    });

    it('should be true when a specific status is selected', () => {
      mockUseArchiveFiltering.mockReturnValue({
        searchProps: mockSearchProps,
        statusFilterProps: { ...mockStatusFilterProps, value: ['published'] }
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-status-filter')).toHaveTextContent('true');
    });
  });
});
