import { act, renderHook } from '@testing-library/react';

import { useAllOpuses, useCreateOpus, useDeleteOpus, useOpusById, useUpdateOpus } from './useOpuses';

const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockUseOpusByIdQuery = jest.fn();
const mockUseAllOpusesQuery = jest.fn();

jest.mock('~/types/graphql/generated/graphql', () => ({
  useCreateOpusMutation: () => [mockCreateMutate, {}],
  useUpdateOpusMutation: () => [mockUpdateMutate, {}],
  useDeleteOpusMutation: () => [mockDeleteMutate, {}],
  useOpusByIdQuery: (options: unknown) => mockUseOpusByIdQuery(options),
  useAllOpusesQuery: (options: unknown) => mockUseAllOpusesQuery(options)
}));

describe('useOpuses hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('useCreateOpus passes the input as mutation variables', async () => {
    mockCreateMutate.mockResolvedValue({ data: { createOpus: { id: '1' } } });
    const { result } = renderHook(() => useCreateOpus());

    await act(async () => {
      await result.current[0]({ number: 'Op. 1', name: 'Опус' } as never);
    });

    expect(mockCreateMutate).toHaveBeenCalledWith({ variables: { input: { number: 'Op. 1', name: 'Опус' } } });
  });

  it('useUpdateOpus forwards the variables', async () => {
    mockUpdateMutate.mockResolvedValue({ data: { updateOpus: { id: '1' } } });
    const { result } = renderHook(() => useUpdateOpus());

    await act(async () => {
      await result.current[0]({ id: '1', input: { name: 'Оновлено' } } as never);
    });

    expect(mockUpdateMutate).toHaveBeenCalledWith({ variables: { id: '1', input: { name: 'Оновлено' } } });
  });

  it('useDeleteOpus forwards the variables', async () => {
    mockDeleteMutate.mockResolvedValue({ data: { deleteOpus: true } });
    const { result } = renderHook(() => useDeleteOpus());

    await act(async () => {
      await result.current[0]({ id: '1' });
    });

    expect(mockDeleteMutate).toHaveBeenCalledWith({ variables: { id: '1' } });
  });

  it('useOpusById skips the query when id is empty', () => {
    mockUseOpusByIdQuery.mockReturnValue({ data: undefined, loading: false });
    renderHook(() => useOpusById(''));

    expect(mockUseOpusByIdQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it('useAllOpuses requests with the provided filters', () => {
    mockUseAllOpusesQuery.mockReturnValue({ data: undefined, loading: false });
    renderHook(() => useAllOpuses({ statuses: undefined }));

    expect(mockUseAllOpusesQuery).toHaveBeenCalledWith(expect.objectContaining({ variables: { filters: { statuses: undefined } } }));
  });
});
