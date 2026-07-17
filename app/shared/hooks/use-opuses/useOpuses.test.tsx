import { act, renderHook } from '@testing-library/react';

import {
  useCreateOpus,
  useDeleteOpus,
  useOpusById,
  usePaginatedWorks,
  useSearchCompositions,
  useUpdateOpus
} from './useOpuses';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { OpusStatus, WorksTab } from '~/types/graphql/generated/graphql';

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();

const mockUseOpusByIdQuery = jest.fn();
const mockUsePaginatedWorksQuery = jest.fn();
const mockUseSearchCompositionsQuery = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => {
  const actual = jest.requireActual('~/types/graphql/generated/graphql');

  return {
    ...actual,
    useCreateOpusMutation: () => [mockCreateMutate, {}],
    useUpdateOpusMutation: () => [mockUpdateMutate, {}],
    useDeleteOpusMutation: () => [mockDeleteMutate, {}],
    useOpusByIdQuery: (options: unknown) => mockUseOpusByIdQuery(options),
    usePaginatedWorksQuery: (options: unknown) => mockUsePaginatedWorksQuery(options),
    useSearchCompositionsQuery: (options: unknown) => mockUseSearchCompositionsQuery(options)
  };
});

describe('useOpuses hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useCreateOpus passes the input as mutation variables', async () => {
    mockCreateMutate.mockResolvedValue({
      data: { createOpus: { id: '1' } }
    });

    const { result } = renderHook(() => useCreateOpus());

    await act(async () => {
      await result.current[0]({
        number: 'Op. 1',
        name: 'Опус'
      } as never);
    });

    expect(mockCreateMutate).toHaveBeenCalledWith({
      variables: {
        input: {
          number: 'Op. 1',
          name: 'Опус'
        }
      }
    });
  });

  it('useUpdateOpus forwards the variables', async () => {
    mockUpdateMutate.mockResolvedValue({
      data: { updateOpus: { id: '1' } }
    });

    const { result } = renderHook(() => useUpdateOpus());

    await act(async () => {
      await result.current[0]({
        id: '1',
        input: {
          name: 'Оновлено'
        }
      } as never);
    });

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      variables: {
        id: '1',
        input: {
          name: 'Оновлено'
        }
      }
    });
  });

  it('useDeleteOpus forwards the variables', async () => {
    mockDeleteMutate.mockResolvedValue({
      data: { deleteOpus: true }
    });

    const { result } = renderHook(() => useDeleteOpus());

    await act(async () => {
      await result.current[0]({
        id: '1'
      });
    });

    expect(mockDeleteMutate).toHaveBeenCalledWith({
      variables: {
        id: '1'
      }
    });
  });

  it('useOpusById skips the query when id is empty', () => {
    mockUseOpusByIdQuery.mockReturnValue({
      data: undefined,
      loading: false
    });

    renderHook(() => useOpusById(''));

    expect(mockUseOpusByIdQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: true
      })
    );
  });
});

describe('useSearchCompositions', () => {
  beforeEach(() => {
    mockUseSearchCompositionsQuery.mockReturnValue({ data: undefined, loading: false });
  });

  it('requests compositions with the provided search term', () => {
    renderHook(() => useSearchCompositions('Beethoven'));

    expect(mockUseSearchCompositionsQuery).toHaveBeenCalledWith({
      variables: { search: 'Beethoven' },
      fetchPolicy: 'network-only',
      skip: false
    });
  });

  it('skips the query when search term is empty', () => {
    renderHook(() => useSearchCompositions(''));

    expect(mockUseSearchCompositionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: true
      })
    );
  });

  it('skips the query when skip option is explicitly set to true', () => {
    renderHook(() => useSearchCompositions('Bach', { skip: true }));

    expect(mockUseSearchCompositionsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: true
      })
    );
  });
});

describe('usePaginatedWorks', () => {
  it('requests paginated works with provided variables', () => {
    mockUsePaginatedWorksQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    });

    renderHook(() =>
      usePaginatedWorks(WorksTab.Opus, {
        search: 'test'
      })
    );

    expect(mockUsePaginatedWorksQuery).toHaveBeenCalledWith({
      variables: {
        tab: WorksTab.Opus,
        filters: {
          search: 'test'
        }
      },
      fetchPolicy: 'network-only'
    });
  });

  it('maps groups and works', () => {
    mockUsePaginatedWorksQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: {
        paginatedWorks: {
          total: 2,
          totalPages: 1,
          groups: [
            {
              id: 'g1',
              number: 'Op.1',
              numberKind: 'op',
              name: { uk: 'Group' },
              genre: 'Genre',
              creationYear: '2024',
              status: OpusStatus.Published,
              updatedAt: 'today',
              compositions: [
                {
                  id: 'c1',
                  title: {
                    uk: 'Work'
                  }
                }
              ]
            }
          ],
          works: [
            {
              id: 'w1',
              title: {
                uk: 'Standalone'
              },
              year: '2023',
              genre: 'Genre',
              status: OpusStatus.Draft,
              updatedAt: 'today'
            }
          ]
        }
      }
    });

    const { result } = renderHook(() => usePaginatedWorks());

    expect(result.current.items).toEqual({
      groups: [
        {
          id: 'g1',
          number: 'Op.1',
          numberKind: 'op',
          name: 'Group',
          genre: 'Genre',
          startDate: '2024',
          status: BaseContentStatuses.Published,
          updatedAt: 'today',
          works: [
            {
              id: 'c1',
              title: 'Work'
            }
          ]
        }
      ],
      works: [
        {
          id: 'w1',
          title: 'Standalone',
          year: '2023',
          genre: 'Genre',
          status: BaseContentStatuses.Draft,
          updatedAt: 'today'
        }
      ]
    });

    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('returns empty collections when no data', () => {
    mockUsePaginatedWorksQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined
    });

    const { result } = renderHook(() => usePaginatedWorks());

    expect(result.current.items).toEqual({
      groups: [],
      works: []
    });

    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPages).toBe(0);
  });

  it('maps statuses correctly for groups and works', () => {
    mockUsePaginatedWorksQuery.mockReturnValue({
      loading: false,
      data: {
        paginatedWorks: {
          total: 2,
          totalPages: 1,
          groups: [
            {
              id: 'g1',
              number: 'Op.1',
              numberKind: 'op',
              name: { uk: 'Group' },
              genre: 'Genre',
              creationYear: '2024',
              status: OpusStatus.Draft,
              updatedAt: 'today',
              compositions: []
            }
          ],
          works: [
            {
              id: 'w1',
              title: { uk: 'Standalone' },
              year: '2023',
              genre: 'Genre',
              status: OpusStatus.Published,
              updatedAt: 'today'
            }
          ]
        }
      }
    });

    const { result } = renderHook(() => usePaginatedWorks());

    expect(result.current.items.groups[0].status).toBe(BaseContentStatuses.Draft);
    expect(result.current.items.works[0].status).toBe(BaseContentStatuses.Published);
  });
});
