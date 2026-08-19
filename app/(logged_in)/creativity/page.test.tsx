import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';

import CreativityPage from './page';
import { usePaginatedWorks } from '~/shared/hooks/use-opuses/useOpuses';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const MOCK_GROUP_LABEL = 'Дії групи Перший струнний квартет';
const MOCK_WORK_LABEL = 'Дії твору №1 «Після бою»';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '/creativity',
  useSearchParams: () => new URLSearchParams()
}));

jest.mock('@apollo/client', () => {
  const originalApollo = jest.requireActual('@apollo/client');
  return {
    ...originalApollo,
    useQuery: jest.fn(() => ({
      data: undefined,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    })),
    useLazyQuery: jest.fn(() => [jest.fn(), { data: undefined, loading: false, error: undefined }]),
    useMutation: jest.fn(() => [jest.fn(), { loading: false, data: undefined }])
  };
});

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
    sortValue: 'date_desc',
    selectedFilters: { status: [], language: [], genre: [] },
    requestFilters: {},
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

jest.mock('./useWorksTableActions', () => ({
  useWorksTableActions: jest.fn(() => ({
    groupToUngroup: null,
    setGroupToUngroup: jest.fn(),
    handlePublishStatusChange: jest.fn(),
    handleConfirmUngroup: jest.fn(),
    handleShareGroup: jest.fn()
  }))
}));

jest.mock('./(composition)/useWorkUrlState', () => ({
  useWorkUrlState: jest.fn(() => ({
    compositionId: null,
    compositionToEdit: null,
    isEditOpen: false,
    openEditComposition: jest.fn(),
    closeEditComposition: jest.fn()
  }))
}));

jest.mock('./(composition)/useDeleteWorkAction', () => ({
  useDeleteWorkAction: jest.fn(() => ({
    deleteComposition: null,
    setDeleteComposition: jest.fn(),
    handleConfirmCompositionDelete: jest.fn(),
    unlinkComposition: null,
    setUnlinkComposition: jest.fn(),
    handleConfirmUnlinkComposition: jest.fn()
  }))
}));

jest.mock('./(composition)/useUpdateWorkAction', () => ({
  useUpdateWorkAction: jest.fn(() => ({
    handleUpdateComposition: jest.fn(),
    error: null,
    clearError: jest.fn()
  }))
}));

jest.mock('~/shared/hooks/use-share/useShare', () => ({
  useShare: jest.fn(() => ({
    handleShare: jest.fn()
  }))
}));

jest.mock('~/shared/components/dropdown-menu/ActionMenu', () => ({
  __esModule: true,
  default: ({ anchorEl, menuItems }: { anchorEl: HTMLElement | null; menuItems: any[] }) => {
    if (!anchorEl) return null;
    return (
      <div data-testid="dropdown-menu">
        {menuItems.flatMap((section) =>
          section.items.map((item: any) =>
            item.href ? (
              <a key={item.id} role="menuitem" href={item.href}>
                {item.text.name}
              </a>
            ) : (
              <div key={item.id} role="menuitem" onClick={item.onClick}>
                {item.text.name}
              </div>
            )
          )
        )}
      </div>
    );
  }
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

jest.mock('./(composition)/useCreateWorkAction', () => ({
  useCreateWorkAction: jest.fn(() => ({
    handleCreateWork: jest.fn(),
    handleCreateGroup: jest.fn(),
    loading: false,
    isModalOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
    handleSubmit: jest.fn()
  }))
}));

jest.mock('~/shared/components/forms/opus-details-block/composition-modal/CompositionModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => (open ? <div data-testid="composition-modal" /> : null)
}));

const mockUsePaginatedWorks = usePaginatedWorks as jest.Mock;

describe('Creativity page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByRole('tab', { name: 'Опуси' })).toHaveAttribute('href', '/creativity/op');
    expect(screen.getByRole('tab', { name: 'Безопусні' })).toHaveAttribute('href', '/creativity/sineop');
    expect(screen.getByRole('tab', { name: 'Твори' })).toHaveAttribute('href', '/creativity/compositions');

    fireEvent.click(screen.getByRole('button', { name: 'Створити' }));

    const dropdownMenu = screen.getByTestId('dropdown-menu');
    expect(within(dropdownMenu).getByRole('menuitem', { name: 'Твір' })).toBeInTheDocument();
    expect(within(dropdownMenu).getByRole('menuitem', { name: 'Група' })).toHaveAttribute(
      'href',
      '/creativity/group/create'
    );
  });

  it('shows different context actions for a group and a work', () => {
    mockUsePaginatedWorks.mockReturnValue({
      items: {
        groups: [
          {
            id: '1',
            number: 1,
            numberKind: 'op',
            name: 'Перший струнний квартет',
            genre: 'Струнний квартет',
            startDate: '2020',
            endDate: undefined,
            status: BaseContentStatuses.Published,
            updatedAt: '2024-01-01',
            compositions: [{ id: '2', name: '№1 «Після бою»' }]
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

    const dropdownMenus = screen.getAllByTestId('dropdown-menu');
    let dropdownMenu = dropdownMenus[dropdownMenus.length - 1];
    expect(within(dropdownMenu).getByText('Редагувати групу (SEO)')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Редагувати контент')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Розгрупувати')).toBeInTheDocument();

    const hasPublish = within(dropdownMenu).queryByText('Опублікувати');
    const hasUnpublish = within(dropdownMenu).queryByText('Зняти з публікації');
    expect(hasPublish || hasUnpublish).toBeInTheDocument();

    fireEvent.click(within(dropdownMenu).getByText('Поширити'));

    const accordionToggle = screen.getByRole('button', { name: /op\. 1.*Перший струнний квартет/i });
    fireEvent.click(accordionToggle);

    const workButton = screen.getAllByRole('button', { name: new RegExp(MOCK_WORK_LABEL, 'i') })[0];
    fireEvent.click(workButton);

    const updatedDropdownMenus = screen.getAllByTestId('dropdown-menu');
    dropdownMenu = updatedDropdownMenus[updatedDropdownMenus.length - 1];
    expect(within(dropdownMenu).getByText('Редагувати композицію')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Поширити')).toBeInTheDocument();
    expect(within(dropdownMenu).getByText('Видалити')).toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Редагувати контент')).not.toBeInTheDocument();
    expect(within(dropdownMenu).queryByText('Розгрупувати')).not.toBeInTheDocument();
  });
});
