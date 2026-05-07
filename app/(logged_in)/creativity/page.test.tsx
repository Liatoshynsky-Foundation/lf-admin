import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import CreativityPage from './page';

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
  FilteringToolbar: ({ dataTestId }: { dataTestId?: string }) => (
    <div data-testid={dataTestId ?? 'filtering-toolbar'} />
  ),
  SortSelect: ({ triggerLabel }: { triggerLabel: string }) => (
    <button type="button" data-testid="sort-select">
      {triggerLabel}
    </button>
  )
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({
    title,
    activeTab,
    tabs,
    action
  }: {
    title: string;
    activeTab: string;
    tabs: Array<{ value: string; label: string; href: string; disabled?: boolean }>;
    action?: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div>{action}</div>
      <div>
        {tabs.map((tab) =>
          tab.disabled ? (
            <button key={tab.value} role="tab" disabled>
              {tab.label}
            </button>
          ) : (
            <a
              key={tab.value}
              role="tab"
              aria-selected={tab.value === activeTab}
              href={tab.href}
            >
              {tab.label}
            </a>
          )
        )}
      </div>
    </div>
  )
}));

jest.mock('./useWorksFiltering', () => ({
  useWorksFiltering: () => ({
    sortValue: 'date_desc',
    selectedFilters: {
      status: [],
      language: [],
      genre: []
    },
    toolbarProps: {
      search: {
        search: '',
        setSearch: jest.fn(),
        options: [],
        placeholder: 'Пошук'
      },
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
  })
}));

describe('Creativity page', () => {
  it('renders updated tabs and create action links', () => {
    render(<CreativityPage />);

    expect(screen.getByText('Творчість')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Всі' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Опуси' })).toHaveAttribute('href', '/creativity/opus');
    expect(screen.getByRole('tab', { name: 'Без опусні' })).toHaveAttribute('href', '/creativity/ungrouped');
    expect(screen.getByRole('tab', { name: 'Твори' })).toHaveAttribute('href', '/creativity/works');

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    const dropdownMenu = screen.getByTestId('dropdown-menu');

    expect(within(dropdownMenu).getByText('Твір').closest('a')).toHaveAttribute(
      'href',
      '/creativity/work/create'
    );
    expect(within(dropdownMenu).getByText('Група').closest('a')).toHaveAttribute(
      'href',
      '/creativity/group/create'
    );

    expect(screen.getAllByText('№1«Після бою», сл. І. Буніна, укр.пер. М. Стріхи').length).toBeGreaterThan(0);
  });

  it('shows different context actions for a group and a work', () => {
    render(<CreativityPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /дії групи перший струнний квартет/i })[0]);

    let dropdownMenu = screen.getByTestId('dropdown-menu');

    expect(within(dropdownMenu).getByText('Редагувати')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Опублікувати')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Зняти з публікації')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Розгрупувати')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('SEO налаштування')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Видалити')).toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Завантажити аудіо')).not.toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Завантажити PDF')).not.toBeInTheDocument();

    fireEvent.click(within(dropdownMenu).getByText('Редагувати'));

    fireEvent.click(screen.getAllByRole('button', { name: /дії твору №1«після бою»/i })[0]);

    dropdownMenu = screen.getByTestId('dropdown-menu');

    expect(within(dropdownMenu).getByText('Завантажити аудіо')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Завантажити PDF')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('SEO налаштування')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Видалити')).toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Редагувати')).not.toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Опублікувати')).not.toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Розгрупувати')).not.toBeInTheDocument();
  });
});