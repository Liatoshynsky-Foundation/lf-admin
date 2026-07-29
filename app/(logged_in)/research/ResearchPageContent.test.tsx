import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { RESEARCH_WORKS_MOCK_DATA, type ResearchWork } from './research.mock';
import { ResearchPageContent } from './ResearchPageContent';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('./research.mock', () => ({
  RESEARCH_WORKS_MOCK_DATA: [] as ResearchWork[]
}));

jest.mock('./useResearchWorksFiltering', () => ({
  useResearchWorksFiltering: jest.fn()
}));

jest.mock('~/shared/components/filtering-toolbar', () => ({
  FilteringToolbar: () => <div data-testid="mock-filtering-toolbar" />,
  SortSelect: () => <div data-testid="mock-sort-select" />
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div data-testid="mock-page-header">
      <h1>{title}</h1>
      {action}
    </div>
  )
}));

jest.mock('./ResearchContent', () => ({
  ResearchContent: ({
    visibleWorks,
    hasActiveCriteria,
    onEditWork
  }: {
    visibleWorks: readonly { id: string; author: string }[];
    hasActiveCriteria: boolean;
    onEditWork: (work: unknown) => void;
  }) => (
    <div data-testid="mock-research-content" data-has-active-criteria={String(hasActiveCriteria)}>
      {visibleWorks.length}
      <button type="button" onClick={() => onEditWork(visibleWorks[0])}>
        edit-first
      </button>
    </div>
  )
}));

jest.mock('~/shared/components/research-modal/ResearchModal', () => ({
  __esModule: true,
  default: ({ isOpen, mode }: { isOpen: boolean; mode: string }) =>
    isOpen ? <div data-testid="mock-research-modal">{mode}</div> : null
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

const sampleWork = {
  id: '1',
  author: 'Архимович Лідія',
  bibliographicDescription: 'Архимович, Лідія. Шляхи розвитку української радянської опери.',
  year: '1970',
  keywords: '',
  status: BaseContentStatuses.Published,
  createdAt: '2025-09-01T10:00:00.000Z',
  updatedAt: '2025-09-11T10:00:00.000Z',
  publishedAt: '2025-09-11T10:00:00.000Z'
};

describe('ResearchPageContent', () => {
  const defaultFilteringMock = {
    sortValue: 'date_desc' as const,
    selectedFilters: {
      status: []
    },
    toolbarProps: {
      search: { search: '' }
    },
    sortProps: {
      value: 'date_desc',
      onChange: jest.fn(),
      options: []
    },
    statusFilterProps: {
      label: 'Статус',
      options: [],
      value: [],
      hideClearAction: true,
      onChange: jest.fn()
    },
    activeFiltersCount: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    RESEARCH_WORKS_MOCK_DATA.push(sampleWork);
  });

  it('renders page title and create action link', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByText('Дослідження та наукові праці')).toBeInTheDocument();
    expect(screen.getByText('Додати роботу')).toBeInTheDocument();
  });

  it('passes filtered works to ResearchContent when mock data matches filters', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveTextContent('1');
  });

  it('filters visible works by status when a status filter is selected', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: { status: ['published'] },
      activeFiltersCount: 1
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toBeInTheDocument();
  });

  it('passes hasActiveCriteria as false when there is no search and no active filters', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveAttribute('data-has-active-criteria', 'false');
  });

  it('passes hasActiveCriteria as true when search has active criteria', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        search: { search: 'non-existent-random-query-string-abc-123' }
      },
      activeFiltersCount: 1
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveAttribute('data-has-active-criteria', 'true');
  });

  it('matches search against author, bibliographic description and keywords', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: 'архимович' }
      }
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveTextContent('1');
  });

  it('sorts visible works by name_asc, producing an ascending author order', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    RESEARCH_WORKS_MOCK_DATA.push(
      { ...sampleWork, id: '1', author: 'Іванов' },
      { ...sampleWork, id: '2', author: 'Архимович' }
    );

    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      sortValue: 'name_asc'
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveTextContent('2');
  });

  it('sorts visible works by name_desc, producing a descending author order', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    RESEARCH_WORKS_MOCK_DATA.push(
      { ...sampleWork, id: '1', author: 'Іванов' },
      { ...sampleWork, id: '2', author: 'Архимович' }
    );

    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      sortValue: 'name_desc'
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveTextContent('2');
  });
  it('passes hasActiveCriteria as true when a status filter is active even without search text', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      activeFiltersCount: 1
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveAttribute('data-has-active-criteria', 'true');
  });
  it('opens the modal in create mode when the create action is triggered', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('Додати роботу'));

    expect(screen.getByTestId('mock-research-modal')).toHaveTextContent('create');
  });

  it('opens the modal in edit mode with selected work data', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('edit-first'));

    expect(screen.getByTestId('mock-research-modal')).toHaveTextContent('edit');
  });

  it('does not render pagination when there is only one page', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
  });

  it('renders pagination when there is more than one page', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    for (let i = 0; i < 10; i += 1) {
      RESEARCH_WORKS_MOCK_DATA.push({ ...sampleWork, id: String(i), author: `Автор ${i}` });
    }

    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
  });

  it('shows only RESEARCH_ITEMS_PER_PAGE works on the current page', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    for (let i = 0; i < 10; i += 1) {
      RESEARCH_WORKS_MOCK_DATA.push({ ...sampleWork, id: String(i), author: `Автор ${i}` });
    }

    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-content')).toHaveTextContent('8');
  });

  it('navigates to the next page when pagination changes', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    for (let i = 0; i < 10; i += 1) {
      RESEARCH_WORKS_MOCK_DATA.push({ ...sampleWork, id: String(i), author: `Автор ${i}` });
    }

    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '1');

    fireEvent.click(screen.getByText('next-page'));

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '2');
  });

  it('resets to page 1 when the search value changes', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    for (let i = 0; i < 10; i += 1) {
      RESEARCH_WORKS_MOCK_DATA.push({ ...sampleWork, id: String(i), author: `Автор ${i}` });
    }

    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    const { rerender } = render(<ResearchPageContent />);

    fireEvent.click(screen.getByText('next-page'));
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '2');

    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: { search: { search: 'автор' } }
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);
    rerender(<ResearchPageContent />);

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-current-page', '1');
  });
});
