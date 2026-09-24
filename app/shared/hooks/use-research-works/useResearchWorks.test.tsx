import { act, renderHook } from '@testing-library/react';

import {
  collectUniqueAuthors,
  useCreateResearchWork,
  useDeleteResearchWork,
  usePaginatedResearchWorks,
  useResearchWorkAuthors,
  useResearchWorkById,
  useUpdateResearchWork,
  useUpdateResearchWorkStatus
} from './useResearchWorks';
import { ResearchWorkErrors } from '~/constants/errors';
import { safeMutate } from '~/lib/utils/safeMutate';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import {
  ResearchWorkStatus,
  useCreateResearchWorkMutation,
  useDeleteResearchWorkMutation,
  usePaginatedResearchWorksQuery,
  useResearchWorkAuthorsQuery,
  useResearchWorkByIdQuery,
  useUpdateResearchWorkMutation,
  useUpdateResearchWorkStatusMutation
} from '~/types/graphql/generated/graphql';

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useResearchWorkByIdQuery: jest.fn(),
  usePaginatedResearchWorksQuery: jest.fn(),
  useResearchWorkAuthorsQuery: jest.fn(),
  useCreateResearchWorkMutation: jest.fn(),
  useUpdateResearchWorkMutation: jest.fn(),
  useUpdateResearchWorkStatusMutation: jest.fn(),
  useDeleteResearchWorkMutation: jest.fn()
}));

jest.mock('~/lib/utils/safeMutate', () => ({
  safeMutate: jest.fn()
}));

const mockUseResearchWorkByIdQuery = useResearchWorkByIdQuery as jest.MockedFunction<
  typeof useResearchWorkByIdQuery
>;
const mockUsePaginatedResearchWorksQuery = usePaginatedResearchWorksQuery as jest.MockedFunction<
  typeof usePaginatedResearchWorksQuery
>;
const mockUseResearchWorkAuthorsQuery = useResearchWorkAuthorsQuery as jest.MockedFunction<
  typeof useResearchWorkAuthorsQuery
>;
const mockUseCreateResearchWorkMutation = useCreateResearchWorkMutation as jest.MockedFunction<
  typeof useCreateResearchWorkMutation
>;
const mockUseUpdateResearchWorkMutation = useUpdateResearchWorkMutation as jest.MockedFunction<
  typeof useUpdateResearchWorkMutation
>;
const mockUseUpdateResearchWorkStatusMutation = useUpdateResearchWorkStatusMutation as jest.MockedFunction<
  typeof useUpdateResearchWorkStatusMutation
>;
const mockUseDeleteResearchWorkMutation = useDeleteResearchWorkMutation as jest.MockedFunction<
  typeof useDeleteResearchWorkMutation
>;
const mockSafeMutate = safeMutate as jest.MockedFunction<typeof safeMutate>;

describe('collectUniqueAuthors', () => {
  it('returns unique trimmed authors sorted with uk locale', () => {
    expect(
      collectUniqueAuthors([
        { author: 'Мельник Андрій' },
        { author: 'Коваленко Олена' },
        { author: 'Мельник Андрій' },
        { author: '  ' },
        { author: ' Коваленко Олена ' }
      ])
    ).toEqual(['Коваленко Олена', 'Мельник Андрій']);
  });

  it('returns an empty list when there are no authors', () => {
    expect(collectUniqueAuthors([])).toEqual([]);
  });
});

describe('useResearchWorkById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips the query when id is null', () => {
    mockUseResearchWorkByIdQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    } as never);

    const { result } = renderHook(() => useResearchWorkById(null));

    expect(mockUseResearchWorkByIdQuery).toHaveBeenCalledWith({
      variables: { id: '' },
      skip: true,
      fetchPolicy: 'network-only'
    });
    expect(result.current.work).toBeNull();
  });

  it('maps research work when the query returns data', () => {
    mockUseResearchWorkByIdQuery.mockReturnValue({
      data: {
        researchWorkById: {
          id: 'work-1',
          bibliographicDescription: 'Опис',
          author: 'Коваленко Олена',
          year: '1970',
          keywords: 'ключ',
          pdfFile: null,
          url: null,
          status: ResearchWorkStatus.Published,
          publishedAt: '2025-09-11T10:00:00.000Z',
          createdAt: '2025-09-01T10:00:00.000Z',
          updatedAt: '2025-09-11T10:00:00.000Z'
        }
      },
      loading: false,
      error: undefined
    } as never);

    const { result } = renderHook(() => useResearchWorkById('work-1'));

    expect(mockUseResearchWorkByIdQuery).toHaveBeenCalledWith({
      variables: { id: 'work-1' },
      skip: false,
      fetchPolicy: 'network-only'
    });
    expect(result.current.work).toEqual({
      id: 'work-1',
      bibliographicDescription: 'Опис',
      author: 'Коваленко Олена',
      year: '1970',
      keywords: 'ключ',
      pdfFile: undefined,
      url: undefined,
      status: BaseContentStatuses.Published,
      publishedAt: '2025-09-11T10:00:00.000Z',
      createdAt: '2025-09-01T10:00:00.000Z',
      updatedAt: '2025-09-11T10:00:00.000Z'
    });
  });
});

describe('usePaginatedResearchWorks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps paginated items and exposes pagination meta', () => {
    mockUsePaginatedResearchWorksQuery.mockReturnValue({
      data: {
        paginatedResearchWorks: {
          items: [
            {
              id: 'work-1',
              bibliographicDescription: 'Опис',
              author: 'Автор',
              year: '1970',
              keywords: null,
              pdfFile: null,
              url: null,
              status: ResearchWorkStatus.Hidden,
              publishedAt: null,
              createdAt: '2025-09-01T10:00:00.000Z',
              updatedAt: '2025-09-11T10:00:00.000Z'
            }
          ],
          total: 1,
          page: 2,
          totalPages: 3
        }
      },
      loading: false,
      error: undefined,
      refetch: jest.fn()
    } as never);

    const { result } = renderHook(() => usePaginatedResearchWorks(2, 8, { search: 'Автор' }));

    expect(mockUsePaginatedResearchWorksQuery).toHaveBeenCalledWith({
      variables: { page: 2, limit: 8, filters: { search: 'Автор' } },
      fetchPolicy: 'network-only'
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].author).toBe('Автор');
    expect(result.current.total).toBe(1);
    expect(result.current.page).toBe(2);
    expect(result.current.totalPages).toBe(3);
  });

  it('returns empty defaults when paginated data is missing', () => {
    mockUsePaginatedResearchWorksQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: jest.fn()
    } as never);

    const { result } = renderHook(() => usePaginatedResearchWorks());

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBe(true);
  });
});

describe('useResearchWorkAuthors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('collects unique authors from all research works', () => {
    mockUseResearchWorkAuthorsQuery.mockReturnValue({
      data: {
        allResearchWorks: [{ author: 'Б' }, { author: 'А' }, { author: 'Б' }]
      },
      loading: false,
      error: undefined
    } as never);

    const { result } = renderHook(() => useResearchWorkAuthors());

    expect(mockUseResearchWorkAuthorsQuery).toHaveBeenCalledWith({
      fetchPolicy: 'network-only',
      skip: undefined
    });
    expect(result.current.authors).toEqual(['А', 'Б']);
  });

  it('skips authors query when requested', () => {
    mockUseResearchWorkAuthorsQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    } as never);

    const { result } = renderHook(() => useResearchWorkAuthors({ skip: true }));

    expect(mockUseResearchWorkAuthorsQuery).toHaveBeenCalledWith({
      fetchPolicy: 'network-only',
      skip: true
    });
    expect(result.current.authors).toEqual([]);
  });
});

describe('research work mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSafeMutate.mockResolvedValue({} as never);
    mockUseCreateResearchWorkMutation.mockReturnValue([jest.fn(), { loading: false }] as never);
    mockUseUpdateResearchWorkMutation.mockReturnValue([jest.fn(), { loading: false }] as never);
    mockUseUpdateResearchWorkStatusMutation.mockReturnValue([jest.fn(), { loading: false }] as never);
    mockUseDeleteResearchWorkMutation.mockReturnValue([jest.fn(), { loading: false }] as never);
  });

  it('wraps create mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseCreateResearchWorkMutation.mockReturnValue([mutate, { loading: false }] as never);

    const { result } = renderHook(() => useCreateResearchWork());
    const [createResearchWork] = result.current;

    await act(async () => {
      await createResearchWork({
        bibliographicDescription: 'Опис',
        author: 'Автор',
        year: '1970',
        status: ResearchWorkStatus.Hidden
      });
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      {
        input: {
          bibliographicDescription: 'Опис',
          author: 'Автор',
          year: '1970',
          status: ResearchWorkStatus.Hidden
        }
      },
      ResearchWorkErrors.NETWORK_ERROR_CREATE,
      ResearchWorkErrors.FAILED_TO_CREATE
    );
  });

  it('wraps update mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseUpdateResearchWorkMutation.mockReturnValue([mutate, { loading: false }] as never);

    const { result } = renderHook(() => useUpdateResearchWork());
    const [updateResearchWork] = result.current;

    await act(async () => {
      await updateResearchWork('work-1', { author: 'Новий' });
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { id: 'work-1', input: { author: 'Новий' } },
      ResearchWorkErrors.NETWORK_ERROR_UPDATE,
      ResearchWorkErrors.FAILED_TO_UPDATE
    );
  });

  it('wraps status update mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseUpdateResearchWorkStatusMutation.mockReturnValue([mutate, { loading: false }] as never);

    const { result } = renderHook(() => useUpdateResearchWorkStatus());
    const [updateResearchWorkStatus] = result.current;

    await act(async () => {
      await updateResearchWorkStatus('work-1', { status: ResearchWorkStatus.Published });
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { id: 'work-1', input: { status: ResearchWorkStatus.Published } },
      ResearchWorkErrors.NETWORK_ERROR_STATUS,
      ResearchWorkErrors.FAILED_TO_UPDATE_STATUS
    );
  });

  it('wraps delete mutation with safeMutate', async () => {
    const mutate = jest.fn();
    mockUseDeleteResearchWorkMutation.mockReturnValue([mutate, { loading: false }] as never);

    const { result } = renderHook(() => useDeleteResearchWork());
    const [deleteResearchWork] = result.current;

    await act(async () => {
      await deleteResearchWork('work-1');
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { id: 'work-1' },
      ResearchWorkErrors.NETWORK_ERROR_DELETE,
      ResearchWorkErrors.FAILED_TO_DELETE
    );
  });
});
