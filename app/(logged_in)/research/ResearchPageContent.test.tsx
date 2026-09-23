import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

import { ResearchPageContent } from './ResearchPageContent';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { RESEARCH_DELETE_CONFIRM, RESEARCH_MUTATION_RESULTS } from '~/constants/research';
import {
  useDeleteResearchWork,
  usePaginatedResearchWorks,
  useUpdateResearchWorkStatus
} from '~/shared/hooks/use-research-works/useResearchWorks';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { ResearchWorkStatus } from '~/types/graphql/generated/graphql';
import type { ResearchWork } from '~/types/researchWork';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('./useResearchWorksFiltering', () => ({
  useResearchWorksFiltering: jest.fn()
}));

jest.mock('~/shared/hooks/use-research-works/useResearchWorks', () => ({
  usePaginatedResearchWorks: jest.fn(),
  useDeleteResearchWork: jest.fn(),
  useUpdateResearchWorkStatus: jest.fn()
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: ({ rightSlot }: { rightSlot?: ReactNode }) => (
    <div data-testid="mock-filtering-toolbar">{rightSlot}</div>
  )
}));

jest.mock('~/shared/components/selector/FilterSelect', () => ({
  FilterSelect: ({ label }: { label: string }) => <div data-testid="mock-status-filter">{label}</div>
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ title, action }: { title: string; action?: ReactNode }) => (
    <div data-testid="mock-page-header">
      <h1>{title}</h1>
      {action}
    </div>
  )
}));

jest.mock('./ResearchCreateAction', () => ({
  ResearchCreateAction: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      Додати роботу
    </button>
  )
}));

jest.mock('./ResearchContent', () => ({
  ResearchContent: ({
    visibleWorks,
    emptyReason,
    onEditWork,
    onDeleteWork,
    onToggleStatus
  }: {
    visibleWorks: readonly ResearchWork[];
    emptyReason: string;
    onEditWork: (work: ResearchWork) => void;
    onDeleteWork: (work: ResearchWork) => void;
    onToggleStatus: (work: ResearchWork) => void;
  }) => (
    <div data-testid="mock-research-content" data-empty-reason={emptyReason}>
      {visibleWorks.length}
      <button type="button" onClick={() => onEditWork(visibleWorks[0])}>
        edit-first
      </button>
      <button type="button" onClick={() => onDeleteWork(visibleWorks[0])}>
        delete-first
      </button>
      <button type="button" onClick={() => onToggleStatus(visibleWorks[0])}>
        toggle-status-first
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/research-modal/ResearchModal', () => ({
  __esModule: true,
  default: ({ isOpen, mode }: { isOpen: boolean; mode: string }) =>
    isOpen ? <div data-testid="mock-research-modal">{mode}</div> : null
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    onDelete,
    description
  }: {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    description?: string;
  }) =>
    open ? (
      <div data-testid="mock-delete-modal">
        <p>{description}</p>
        <button type="button" onClick={onDelete}>
          confirm-delete
        </button>
        <button type="button" onClick={onClose}>
          cancel-delete
        </button>
      </div>
    ) : null
}));

jest.mock('~/shared/components/pagination/Pagination', () => ({
  Pagination: ({
    totalPages,
    currentPage,
    onPageChange
  }: {
    totalPages: number;
    currentPage: number;
    onPageChange: (event: unknown, page: number) => void;
  }) => (
    <div data-testid="mock-pagination" data-total-pages={totalPages} data-current-page={currentPage}>
      <button type="button" onClick={() => onPageChange(null, currentPage + 1)}>
        next-page
      </button>
    </div>
  )
}));

const mockedUseResearchWorksFiltering = jest.mocked(useResearchWorksFiltering);
const mockedUsePaginatedResearchWorks = jest.mocked(usePaginatedResearchWorks);
const mockedUseDeleteResearchWork = jest.mocked(useDeleteResearchWork);
const mockedUseUpdateResearchWorkStatus = jest.mocked(useUpdateResearchWorkStatus);

const sampleWork: ResearchWork = {
  id: '1',
  author: 'Коваленко Олена',
  bibliographicDescription: 'Коваленко, Олена. Тестовий бібліографічний опис.',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

describe('ResearchPageContent', () => {
  const deleteResearchWork = jest.fn();
  const updateResearchWorkStatus = jest.fn();

  const defaultFilteringMock = {
    requestFilters: {
      sort: [
        { field: 'author', order: 'asc' },
        { field: 'year', order: 'desc' },
        { field: 'bibliographicDescription', order: 'asc' }
      ]
    },
    searchValue: '',
    selectedFilters: {
      status: [] as const
    },
    toolbarProps: {
      search: { search: '', setSearch: jest.fn(), options: [], placeholder: 'Пошук' }
    },
    statusFilterProps: {
      label: 'Статус',
      options: [],
      value: [] as string[],
      onChange: jest.fn(),
      maxSelections: 1,
      hideClearAction: true,
      persistLabel: true,
      menuAlign: 'right' as const
    },
    activeFiltersCount: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deleteResearchWork.mockResolvedValue({});
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [sampleWork],
      total: 1,
      page: 1,
      totalPages: 1,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    });
    mockedUseDeleteResearchWork.mockReturnValue([deleteResearchWork, { loading: false }] as never);
    mockedUseUpdateResearchWorkStatus.mockReturnValue([updateResearchWorkStatus, { loading: false }] as never);
  });

  it('renders page title and create action link', () => {
    render(<ResearchPageContent />);

    expect(screen.getByText('Дослідження та наукові праці')).toBeInTheDocument();
    expect(screen.getByText('Додати роботу')).toBeInTheDocument();
  });

  it('passes API items to ResearchContent', () => {
    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveTextContent('1');
  });

  it('shows loading empty state while the list is fetching', () => {
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [],
      total: 0,
      page: 1,
      totalPages: 0,
      loading: true,
      error: undefined,
      refetch: jest.fn()
    });

    render(<ResearchPageContent />);

    expect(screen.getByText('Завантаження наукових робіт')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-research-content')).not.toBeInTheDocument();
  });

  it('shows error empty state when the list request fails', () => {
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [],
      total: 0,
      page: 1,
      totalPages: 0,
      loading: false,
      error: new Error('network') as never,
      refetch: jest.fn()
    });

    render(<ResearchPageContent />);

    expect(screen.getByText('Не вдалося завантажити наукові роботи')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-research-content')).not.toBeInTheDocument();
  });

  it('passes emptyReason none when there is no search and no active filters', () => {
    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveAttribute('data-empty-reason', 'none');
  });

  it('passes emptyReason search when search has a value', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      searchValue: 'non-existent-random-query-string-abc-123',
      activeFiltersCount: 0
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveAttribute('data-empty-reason', 'search');
  });

  it('passes emptyReason status when a status filter is active even without search text', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      activeFiltersCount: 1
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveAttribute('data-empty-reason', 'status');
  });

  it('opens the modal in create mode when the create action is triggered', () => {
    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('Додати роботу'));

    expect(screen.getByTestId('mock-research-modal')).toHaveTextContent('create');
  });

  it('opens the modal in edit mode with selected work data', () => {
    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('edit-first'));

    expect(screen.getByTestId('mock-research-modal')).toHaveTextContent('edit');
  });

  it('opens delete confirmation and deletes the record on confirm', async () => {
    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('delete-first'));

    expect(screen.getByTestId('mock-delete-modal')).toHaveTextContent(
      RESEARCH_DELETE_CONFIRM.title(sampleWork.bibliographicDescription)
    );

    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => expect(deleteResearchWork).toHaveBeenCalledWith(sampleWork.id));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(RESEARCH_MUTATION_RESULTS.deleted));
    await waitFor(() => expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument());
  });

  it('shows an error toast when delete fails', async () => {
    deleteResearchWork.mockRejectedValue(new Error('fail-delete'));

    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('delete-first'));
    fireEvent.click(screen.getByText('confirm-delete'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('fail-delete'));
    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
  });

  it('publishes a hidden work from the actions menu', async () => {
    const hiddenWork: ResearchWork = { ...sampleWork, status: BaseContentStatuses.Hidden };
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [hiddenWork],
      total: 1,
      page: 1,
      totalPages: 1,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    });
    updateResearchWorkStatus.mockResolvedValue({});

    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('toggle-status-first'));

    await waitFor(() =>
      expect(updateResearchWorkStatus).toHaveBeenCalledWith(hiddenWork.id, {
        status: ResearchWorkStatus.Published
      })
    );
    expect(toast.success).toHaveBeenCalledWith(RESEARCH_MUTATION_RESULTS.published);
  });

  it('hides a published work from the actions menu', async () => {
    updateResearchWorkStatus.mockResolvedValue({});

    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('toggle-status-first'));

    await waitFor(() =>
      expect(updateResearchWorkStatus).toHaveBeenCalledWith(sampleWork.id, {
        status: ResearchWorkStatus.Hidden
      })
    );
    expect(toast.success).toHaveBeenCalledWith(RESEARCH_MUTATION_RESULTS.hidden);
  });

  it('does not render pagination when there is only one page', () => {
    render(<ResearchPageContent />);

    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
  });

  it('renders pagination when there is more than one page', () => {
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [sampleWork],
      total: 10,
      page: 1,
      totalPages: 2,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    });

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
  });

  it('navigates to the next page when pagination changes', () => {
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [sampleWork],
      total: 10,
      page: 1,
      totalPages: 2,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    });

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '1');

    fireEvent.click(screen.getByText('next-page'));

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '2');
  });

  it('resets to page 1 when the search value changes', () => {
    mockedUsePaginatedResearchWorks.mockReturnValue({
      items: [sampleWork],
      total: 10,
      page: 1,
      totalPages: 2,
      loading: false,
      error: undefined,
      refetch: jest.fn()
    });

    const { rerender } = render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('next-page'));
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '2');

    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      searchValue: 'автор'
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);
    rerender(<ResearchPageContent />);

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '1');
  });
});
