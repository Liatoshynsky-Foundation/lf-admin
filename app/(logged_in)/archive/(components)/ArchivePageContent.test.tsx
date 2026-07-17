import { render, screen, within } from '@testing-library/react';

import { ArchivePageContent } from './ArchivePageContent';
import { ARCHIVE_TABS } from '~/constants/archive';

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

jest.mock('../(hooks)/useArchiveFiltering', () => ({
  __esModule: true,
  useArchiveFiltering: () => ({
    searchProps: {
      search: 'mock-search-query',
      setSearch: jest.fn(),
      options: [],
    },
    statusFilterProps: {
      label: 'Status Label',
      options: [],
      onChange: jest.fn(),
    }
  })
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
    expect(searchInput).toHaveValue('mock-search-query');

    const statusDropdown = within(toolbar).getByTestId('status-dropdown');
    expect(statusDropdown).toBeInTheDocument();
    expect(statusDropdown).toHaveTextContent('Status Label');
  });
});
