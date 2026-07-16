import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import CreativityPage from './page';

const MOCK_GROUP_LABEL = 'Дії групи Перший струнний квартет';
const MOCK_WORK_LABEL = 'Дії твору №1 «Після бою»';

jest.mock('~/shared/hooks/use-opuses/useOpuses', () => ({
  usePaginatedWorks: jest.fn(),
  useAllOpusGroups: jest.fn(() => ({
    data: { allOpuses: [{ id: '1', name: { uk: 'Перший струнний квартет' }, type: 'group' }] },
    loading: false,
    error: undefined
  })),
  useAllUngroupedGroups: jest.fn(() => ({
    data: { allOpuses: [] },
    loading: false,
    error: undefined
  }))
}));

jest.mock('~/shared/hooks/use-compositions/useCompositions', () => ({
  useAllCompositions: jest.fn(() => ({
    data: {
      allCompositions: [
        {
          id: '2',
          title: { uk: '№1 «Після бою»', en: 'No.1 After the fight' }
        }
      ]
    },
    loading: false,
    error: undefined
  }))
}));

jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('~/public/icons/pencil.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="edit-icon" />
}));

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: ({ open, menuList }: { open: boolean; menuList: React.ReactNode }) =>
    open ? <div data-testid="dropdown-menu">{menuList}</div> : null
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({ dataTestId }: { dataTestId?: string }) => (
    <div data-testid={dataTestId ?? 'filtering-toolbar'} />
  ),
  SortSelect: ({ triggerLabel }: { triggerLabel: string }) => (
    <button type="button" data-testid="sort-select">
      {triggerLabel}
    </button>
  )
}));

jest.mock('./useWorksFiltering', () => ({
  useWorksFiltering: jest.fn(() => ({
    requestFilters: {},
    sortValue: 'default',
    selectedFilters: { status: null, language: null },
    toolbarProps: { search: { search: '' }, activeFiltersCount: 0 },
    sortProps: {}
  }))
}));

interface TabItem {
  value: string;
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  activeTab: string;
  tabs: TabItem[];
  action: React.ReactNode;
}

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ title, activeTab, tabs, action }: PageHeaderProps) => (
    <div>
      <h1>{title}</h1>
      <div>{action}</div>
      <div>
        {tabs.map((tab: TabItem) => (
          <a key={tab.value} role="tab" aria-selected={tab.value === activeTab} href={tab.href}>
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  )
}));

jest.mock('./useWorksFiltering', () => ({
  useWorksFiltering: jest.fn(() => ({
    sortValue: 'date_desc',
    selectedFilters: { status: [], language: [], genre: [] },
    toolbarProps: {
      search: { search: '', setSearch: jest.fn(), options: [], placeholder: 'Пошук' },
      filters: [],
      isFiltersOpen: true,
      onToggleFilters: jest.fn(),
      activeFiltersCount: 0,
      onClearFilters: jest.fn()
    },
    sortProps: {
      fieldOptions: [],
      orderOptions: {},
      fieldValue: 'date',
      value: 'date_desc',
      triggerLabel: 'Нові спочатку',
      onFieldChange: jest.fn(),
      onValueChange: jest.fn()
    }
  }))
}));

import { usePaginatedWorks } from '~/shared/hooks/use-opuses/useOpuses';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockUsePaginatedWorks = usePaginatedWorks as jest.Mock;

describe('Creativity page', () => {
  beforeEach(() => {
    mockUsePaginatedWorks.mockReset();
    mockUsePaginatedWorks.mockReturnValue({
      items: [],
      totalPages: 0,
      totalItems: 0,
      loading: false,
      error: null
    });
  });

  it('renders updated tabs and create action links', () => {
    render(<CreativityPage />);

    expect(screen.getByText('Творчість')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Всі' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Опуси' })).toHaveAttribute('href', '/creativity/opus');
    expect(screen.getByRole('tab', { name: 'Безопусні' })).toHaveAttribute('href', '/creativity/woo');
    expect(screen.getByRole('tab', { name: 'Твори' })).toHaveAttribute('href', '/creativity/works');

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    const dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(within(dropdownMenu).getByText('Твір').closest('a')).toHaveAttribute('href', '/creativity/work/create');
    expect(within(dropdownMenu).getByText('Група').closest('a')).toHaveAttribute('href', '/creativity/group/create');
  });

  it('shows different context actions for a group and a work', () => {
    mockUsePaginatedWorks.mockReturnValue({
      items: {
        groups: [
          {
            id: '1',
            number: '1',
            numberKind: 'op',
            name: 'Перший струнний квартет',
            genre: 'Струнний квартет',
            startDate: '2020',
            endDate: undefined,
            status: BaseContentStatuses.Published,
            updatedAt: '2024-01-01',
            works: [{ id: '2', title: '№1 «Після бою»' }]
          }
        ],
        works: []
      },
      totalPages: 1,
      totalItems: 1,
      loading: false,
      error: null
    });

    render(<CreativityPage />);

    const groupButton = screen.getAllByRole('button', { name: new RegExp(MOCK_GROUP_LABEL, 'i') })[0];
    fireEvent.click(groupButton);

    let dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(within(dropdownMenu).getByText('Редагувати групу (SEO)')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Редагувати контент')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Розгрупувати')).toBeInTheDocument();

    const hasPublish = within(dropdownMenu).queryByText('Опублікувати');
    const hasUnpublish = within(dropdownMenu).queryByText('Зняти з публікації');
    expect(hasPublish || hasUnpublish).toBeInTheDocument();

    fireEvent.click(within(dropdownMenu).getByText('Поширити'));

    const accordionToggle = screen.getByRole('button', { name: /^1 op/ });
    fireEvent.click(accordionToggle);

    const workButton = screen.getAllByRole('button', { name: new RegExp(MOCK_WORK_LABEL, 'i') })[0];
    fireEvent.click(workButton);

    dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(within(dropdownMenu).getByText('Редагувати композицію')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Видалити')).toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Редагувати контент')).not.toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Розгрупувати')).not.toBeInTheDocument();
  });
});
