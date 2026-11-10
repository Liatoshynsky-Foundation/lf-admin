import { act, renderHook } from '@testing-library/react';

import {
  useCreateResearchWork,
  useDeleteResearchWork,
  usePaginatedResearchWorks,
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
  useResearchWorkByIdQuery,
  useUpdateResearchWorkMutation,
  useUpdateResearchWorkStatusMutation
} from '~/types/graphql/generated/graphql';

jest.mock('~/types/graphql/generated/graphql', () => ({
  ...jest.requireActual('~/types/graphql/generated/graphql'),
  useResearchWorkByIdQuery: jest.fn(),
  usePaginatedResearchWorksQuery: jest.fn(),
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

    const { result } = renderHook(() => usePaginatedResearchWorks(2, 8, { search: 'Опис' }));

    expect(mockUsePaginatedResearchWorksQuery).toHaveBeenCalledWith({
      variables: { page: 2, limit: 8, filters: { search: 'Опис' } },
      fetchPolicy: 'network-only'
    });
    expect(result.current.items).toHaveLength(1);
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
        year: '1970',
        status: ResearchWorkStatus.Hidden
      });
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      {
        input: {
          bibliographicDescription: 'Опис',
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
      await updateResearchWork('work-1', { year: 'Новий' });
    });

    expect(mockSafeMutate).toHaveBeenCalledWith(
      mutate,
      { id: 'work-1', input: { year: 'Новий' } },
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
