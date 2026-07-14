import { act, renderHook } from '@testing-library/react';

import {
  useAllOpusGroups,
  useAllUngroupedGroups,
  useCreateOpus,
  useDeleteOpus,
  useOpusById,
  useSearchCompositions,
  useUpdateOpus
} from './useOpuses';

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();

const mockUseOpusByIdQuery = jest.fn();
const mockUseAllOpusesQuery = jest.fn();
const mockUseSearchCompositionsQuery = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  OpusNumberKind: {
    Op: 'OP',
    Woo: 'WOO'
  },

  useCreateOpusMutation: () => [mockCreateMutate, {}],
  useUpdateOpusMutation: () => [mockUpdateMutate, {}],
  useDeleteOpusMutation: () => [mockDeleteMutate, {}],

  useOpusByIdQuery: (options: unknown) => mockUseOpusByIdQuery(options),
  useAllOpusesQuery: (options: unknown) => mockUseAllOpusesQuery(options),
  useSearchCompositionsQuery: (options: unknown) => mockUseSearchCompositionsQuery(options)
}));

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

  it('useAllOpusGroups requests Op groups', () => {
    mockUseAllOpusesQuery.mockReturnValue({
      data: undefined,
      loading: false
    });

    renderHook(() => useAllOpusGroups({}));

    expect(mockUseAllOpusesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          filters: {
            numberKind: 'OP'
          }
        },
        fetchPolicy: 'network-only',
        skip: undefined
      })
    );
  });

  it('useAllUngroupedGroups requests Woo groups', () => {
    mockUseAllOpusesQuery.mockReturnValue({
      data: undefined,
      loading: false
    });

    renderHook(() =>
      useAllUngroupedGroups({
        statuses: undefined
      })
    );

    expect(mockUseAllOpusesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          filters: {
            numberKind: 'WOO'
          }
        },
        fetchPolicy: 'network-only',
        skip: undefined
      })
    );
  });

  it('passes skip option to useAllOpusGroups', () => {
    mockUseAllOpusesQuery.mockReturnValue({
      data: undefined,
      loading: false
    });

    renderHook(() => useAllOpusGroups(undefined, { skip: true }));

    expect(mockUseAllOpusesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: true
      })
    );
  });

  it('passes skip option to useAllUngroupedGroups', () => {
    mockUseAllOpusesQuery.mockReturnValue({
      data: undefined,
      loading: false
    });

    renderHook(() => useAllUngroupedGroups(undefined, { skip: true }));

    expect(mockUseAllOpusesQuery).toHaveBeenCalledWith(
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
