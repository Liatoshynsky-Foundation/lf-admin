import { render, screen, within } from '@testing-library/react';

import type { FondsTableProps } from './archive-fonds-table/ArchiveFondsTable';
import { ArchivePageContent } from './ArchivePageContent';
import { ARCHIVE_STATUS_FILTER_OPTIONS, ARCHIVE_TABS } from '~/constants/archive';

jest.mock('../(temp)/archive.mock', () => ({
  __esModule: true,
  ARCHIVE_FONDS_MOCK_DATA: [
    {
      id: '3',
      fondNumber: 3,
      name: 'C Fond same part',
      descriptions: 1,
      cases: 1,
      dates: '1900-2000',
      status: 'published',
      updatedAt: '2023-01-01',
    },
    {
      id: '1',
      fondNumber: 1,
      name: 'A Fond same part',
      descriptions: 1,
      cases: 1,
      dates: '1900-2000',
      status: 'hidden',
      updatedAt: '2023-01-01',
    },
    {
      id: '2',
      fondNumber: 2,
      name: 'B Fond same part',
      descriptions: 1,
      cases: 1,
      dates: '1900-2000',
      status: 'published',
      updatedAt: '2023-01-01',
    },
  ],
}));

jest.mock('./archive-fonds-table/ArchiveFondsTable', () => ({
  __esModule: true,
  FondsTable: ({ fonds, hasActiveSearch, hasActiveStatusFilter }: FondsTableProps) => (
    <div data-testid="fonds-table">
      <div data-testid="fonds-table-has-active-search">{JSON.stringify(hasActiveSearch)}</div>
      <div data-testid="fonds-table-has-active-status-filter">{JSON.stringify(hasActiveStatusFilter)}</div>
      <div data-testid="fonds-table-fonds">
        {fonds.map((fond) => (
          <div key={fond.id} data-testid={`fonds-table-item-${fond.id}`}>
            {fond.name}
          </div>
        ))}
      </div>
    </div>
  ),
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  __esModule: true,
  PageHeader: ({ title, activeTab, tabs, action }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <div>{action}</div>
      <div data-testid="tabs">
        {tabs.map((tab: any) => (
          <a key={tab.value} role="tab" aria-selected={tab.value === activeTab} href={tab.href}>
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  )
}));

const mockSearchProps = {
  search: 'C Fond',
  setSearch: jest.fn(),
  options: [],
};

const mockStatusFilterProps = {
  label: 'Status Label',
  options: [],
  onChange: jest.fn(),
  value: ['all'],
};

const defaultMockReturnValue = {
  searchProps: mockSearchProps,
  statusFilterProps: mockStatusFilterProps,
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
  SearchStatusToolbar: ({ dataTestId, searchProps, statusFilterProps }: any) => (
    <div data-testid={dataTestId}>
      <input data-testid="search" defaultValue={searchProps.search} />
      <span data-testid="status-dropdown">{statusFilterProps.label}</span>
    </div>
  )
}));

describe('ArchivePageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseArchiveFiltering.mockReturnValue(defaultMockReturnValue);
  });

  it('should render the header, tabs & the search & the status dropdown correctly', () => {
    render(<ArchivePageContent activeTab="all" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Архів');
    expect(screen.getByTestId('archive-create-action')).toBeInTheDocument();

    const tabsContainer = screen.getByTestId('tabs');
    const tabs = within(tabsContainer).getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    ARCHIVE_TABS.forEach((tab) => {
      expect(within(tabsContainer).getByText(tab.label)).toBeInTheDocument();
      expect(within(tabsContainer).getByText(tab.label)).toHaveAttribute('href', tab.href);
    });

    const activeTab = within(tabsContainer).getByRole('tab', { selected: true });
    expect(activeTab).toHaveTextContent('Всі');
    expect(activeTab).toHaveAttribute('href', '/archive');

    const toolbar = screen.getByTestId('archive-control-panel');
    expect(toolbar).toBeInTheDocument();

    const searchInput = within(toolbar).getByTestId('search');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('C Fond');

    const statusDropdown = within(toolbar).getByTestId('status-dropdown');
    expect(statusDropdown).toBeInTheDocument();
    expect(statusDropdown).toHaveTextContent('Status Label');

    expect(screen.getByTestId('fonds-table')).toBeInTheDocument();
  });

  describe('hasActiveSearch prop', () => {
    it('should be false when search is an empty string', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        searchProps: {
          ...defaultMockReturnValue.searchProps,
          search: '',
        },
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-search')).toHaveTextContent('false');
    });

    it('should be true when search has a value', () => {
      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-search')).toHaveTextContent('true');
    });
  });

  describe('hasActiveStatusFilter prop', () => {
    it(`should be false when filterValues are ['${ARCHIVE_STATUS_FILTER_OPTIONS[0].value}']`, () => {
      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-status-filter')).toHaveTextContent('false');
    });

    it('should be true when a specific status is selected', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        statusFilterProps: { ...defaultMockReturnValue.statusFilterProps, value: ['published'] }
      });

      render(<ArchivePageContent activeTab="all" />);

      expect(screen.getByTestId('fonds-table-has-active-status-filter')).toHaveTextContent('true');
    });
  });

  describe('fonds prop', () => {
    it('should pass full asc sorted array when search query matches all and filter is all', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        searchProps: {
          ...defaultMockReturnValue.searchProps,
          search: 'same part',
        },
      });
      render(<ArchivePageContent activeTab="all" />);

      const items = screen.getAllByTestId(/^fonds-table-item-/);
      expect(items).toHaveLength(3);

      expect(items[0]).toHaveTextContent('A Fond');
      expect(items[1]).toHaveTextContent('B Fond');
      expect(items[2]).toHaveTextContent('C Fond');
    });

    it('should pass empty array when search query does not match any variants', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        searchProps: {
          ...defaultMockReturnValue.searchProps,
          search: 'Non-matching-query',
        },
      });

      render(<ArchivePageContent activeTab="all" />);

      const fondsContainer = screen.getByTestId('fonds-table-fonds');
      expect(fondsContainer.children).toHaveLength(0);
    });

    it('should pass empty array when filter status does not match any variant', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        searchProps: { ...defaultMockReturnValue.searchProps, search: '' },
        statusFilterProps: {
          ...defaultMockReturnValue.statusFilterProps,
          value: ['other'],
        },
      });

      render(<ArchivePageContent activeTab="all" />);

      const fondsContainer = screen.getByTestId('fonds-table-fonds');
      expect(fondsContainer.children).toHaveLength(0);
    });

    it('should combine search and status filter conditions with AND', () => {
      mockUseArchiveFiltering.mockReturnValue({
        ...defaultMockReturnValue,
        searchProps: { ...defaultMockReturnValue.searchProps, search: 'same part' },
        statusFilterProps: { ...defaultMockReturnValue.statusFilterProps, value: ['hidden'] }
      });

      render(<ArchivePageContent activeTab="all" />);

      const items = screen.getAllByTestId(/^fonds-table-item-/);
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('A Fond same part');
    });

    it('should pass an array with matched values when search query matches any variants', () => {
      render(<ArchivePageContent activeTab="all" />);

      const items = screen.getAllByTestId(/^fonds-table-item-/);
      expect(items).toHaveLength(1);

      expect(items[0]).toHaveTextContent('C Fond same part');
    });
  });
});
