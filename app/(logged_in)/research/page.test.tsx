import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import ResearchPage from './page';

const MOCK_AUTHOR = 'Архимович Лідія';

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList }: { open: boolean; menuList: React.ReactNode }) =>
    open ? <div data-testid="dropdown-menu">{menuList}</div> : null
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({
    dataTestId,
    bottomTrailingContent
  }: {
    dataTestId?: string;
    bottomTrailingContent?: React.ReactNode;
  }) => <div data-testid={dataTestId ?? 'filtering-toolbar'}>{bottomTrailingContent}</div>,
  SortSelect: ({ triggerLabel }: { triggerLabel: string }) => (
    <button type="button" data-testid="sort-select">
      {triggerLabel}
    </button>
  )
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ title, action }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{action}</div>
    </div>
  )
}));

jest.mock('~/shared/components/table-layout/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>
}));

jest.mock('./useResearchWorksFiltering', () => ({
  useResearchWorksFiltering: () => ({
    sortValue: 'date_desc',
    selectedFilters: { status: [] },
    toolbarProps: {
      search: { search: '', setSearch: jest.fn(), options: [], placeholder: 'Пошук' }
    },
    sortProps: {
      fieldOptions: [],
      orderOptions: {},
      fieldValue: 'date',
      value: 'date_desc',
      triggerLabel: 'Нові спочатку',
      onFieldChange: jest.fn(),
      onValueChange: jest.fn()
    },
    statusFilterProps: {
      label: 'Статус',
      options: [],
      value: [],
      hideClearAction: true,
      onChange: jest.fn()
    },
    activeFiltersCount: 0
  })
}));

jest.mock('~/shared/components/research-modal/ResearchModal', () => ({
  __esModule: true,
  default: ({ isOpen, mode, initialData }: { isOpen: boolean; mode: string; initialData?: { author?: string } }) =>
    isOpen ? (
      <div data-testid="mock-research-modal" data-mode={mode}>
        {initialData?.author}
      </div>
    ) : null
}));

describe('Research page', () => {
  it('renders the page title and the create action', () => {
    render(<ResearchPage />);

    expect(screen.getByText('Дослідження та наукові праці')).toBeInTheDocument();
    expect(screen.getByText('Додати роботу')).toBeInTheDocument();
  });

  it('renders the filtering toolbar and sort select', () => {
    render(<ResearchPage />);

    expect(screen.getByTestId('research-control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('sort-select')).toHaveTextContent('Нові спочатку');
  });

  it('renders the table with mock research works', () => {
    render(<ResearchPage />);

    expect(screen.getByText(MOCK_AUTHOR)).toBeInTheDocument();
    expect(screen.getAllByTestId('status-badge').length).toBeGreaterThan(0);
  });

  it('opens the row context menu with edit, share and delete actions', () => {
    render(<ResearchPage />);

    const menuButtons = screen.getAllByRole('button', { name: /дії для роботи/i });
    fireEvent.click(menuButtons[0]);

    const dropdownMenu = screen.getByTestId('dropdown-menu');

    expect(within(dropdownMenu).getByText('Редагувати')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Видалити')).toBeInTheDocument();
  });

  it('opens the edit modal pre-filled with row data when clicking the edit icon', () => {
    render(<ResearchPage />);

    const editButtons = screen.getAllByRole('button', { name: /редагувати роботу/i });
    fireEvent.click(editButtons[0]);

    const modal = screen.getByTestId('mock-research-modal');
    expect(modal).toHaveAttribute('data-mode', 'edit');
    expect(modal).toHaveTextContent(MOCK_AUTHOR);
  });
});
