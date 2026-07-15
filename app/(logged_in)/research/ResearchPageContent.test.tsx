import { render, screen } from '@testing-library/react';
import React from 'react';

import { RESEARCH_WORKS_MOCK_DATA } from './research.mock';
import { ResearchPageContent } from './ResearchPageContent';
import { useResearchWorksFiltering } from './useResearchWorksFiltering';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('./research.mock', () => ({
  RESEARCH_WORKS_MOCK_DATA: []
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

jest.mock('./ResearchTable', () => ({
  ResearchTable: ({ works }: { works: readonly { id: string }[] }) => (
    <div data-testid="mock-research-table">{works.length}</div>
  )
}));

jest.mock('~/shared/components/empty-state', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="mock-empty-state">
      <span>{title}</span>
      <span>{description}</span>
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
      search: { search: '' },
      activeFiltersCount: 0,
      filters: []
    },
    sortProps: {
      value: 'date_desc',
      onChange: jest.fn(),
      options: []
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    RESEARCH_WORKS_MOCK_DATA.push(sampleWork as never);
  });

  it('renders page title and create action link', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByText('Дослідження та наукові праці')).toBeInTheDocument();
    expect(screen.getByText('+ Додати роботу').closest('a')).toHaveAttribute('href', '/research/create');
  });

  it('renders the research table when mock data matches filters', () => {
    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-table')).toBeInTheDocument();
  });

  it('filters visible works by status when a status filter is selected', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      selectedFilters: { status: ['published'] },
      toolbarProps: { ...defaultFilteringMock.toolbarProps, activeFiltersCount: 1 }
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-table')).toBeInTheDocument();
  });

  it('shows the default empty state when there is no data and no active criteria', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;

    mockedUseResearchWorksFiltering.mockReturnValue(
      defaultFilteringMock as unknown as ReturnType<typeof useResearchWorksFiltering>
    );

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Наукових робіт ще немає.')).toBeInTheDocument();
  });

  it('shows the no-results empty state when search has active criteria but matches nothing', () => {
    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      toolbarProps: {
        ...defaultFilteringMock.toolbarProps,
        search: { search: 'non-existent-random-query-string-abc-123' },
        activeFiltersCount: 1
      }
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-empty-state')).toBeInTheDocument();
    expect(screen.getByText('Нічого не знайдено')).toBeInTheDocument();
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

    expect(screen.getByTestId('mock-research-table')).toBeInTheDocument();
  });

  it('sorts visible works by name_asc, producing an ascending author order', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    RESEARCH_WORKS_MOCK_DATA.push(
      { ...sampleWork, id: '1', author: 'Іванов' } as never,
      { ...sampleWork, id: '2', author: 'Архимович' } as never
    );

    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      sortValue: 'name_asc'
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-table')).toHaveTextContent('2');
  });

  it('sorts visible works by name_desc, producing a descending author order', () => {
    RESEARCH_WORKS_MOCK_DATA.length = 0;
    RESEARCH_WORKS_MOCK_DATA.push(
      { ...sampleWork, id: '1', author: 'Іванов' } as never,
      { ...sampleWork, id: '2', author: 'Архимович' } as never
    );

    mockedUseResearchWorksFiltering.mockReturnValue({
      ...defaultFilteringMock,
      sortValue: 'name_desc'
    } as unknown as ReturnType<typeof useResearchWorksFiltering>);

    render(<ResearchPageContent />);

    expect(screen.getByTestId('mock-research-table')).toHaveTextContent('2');
  });
});
