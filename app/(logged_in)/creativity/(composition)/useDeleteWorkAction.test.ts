import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { useDeleteWorkAction } from './useDeleteWorkAction';
import {
  PaginatedWorksDocument,
  useDeleteCompositionMutation,
  useUnlinkCompositionMutation
} from '~/types/graphql/generated/graphql';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  PaginatedWorksDocument: 'PaginatedWorksDocument',
  useDeleteCompositionMutation: jest.fn(),
  useUnlinkCompositionMutation: jest.fn()
}));

const mockUseDeleteCompositionMutation = useDeleteCompositionMutation as jest.MockedFunction<
  typeof useDeleteCompositionMutation
>;

const mockUseUnlinkCompositionMutation = useUnlinkCompositionMutation as jest.MockedFunction<
  typeof useUnlinkCompositionMutation
>;

describe('useDeleteWorkAction', () => {
  const mockDeleteCompositionMut = jest.fn();
  const mockUnlinkCompositionMut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeleteCompositionMutation.mockReturnValue([
      mockDeleteCompositionMut,
      { loading: false, data: undefined, reset: jest.fn(), called: false, client: {} as never }
    ]);
    mockUseUnlinkCompositionMutation.mockReturnValue([
      mockUnlinkCompositionMut,
      { loading: false, data: undefined, reset: jest.fn(), called: false, client: {} as never }
    ]);
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useDeleteWorkAction());

    expect(result.current.deleteComposition).toBeNull();
    expect(result.current.unlinkComposition).toBeNull();
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.isUnlinking).toBe(false);
  });

  it('should update deleteComposition and unlinkComposition state', () => {
    const { result } = renderHook(() => useDeleteWorkAction());

    act(() => {
      result.current.setDeleteComposition('work-123');
      result.current.setUnlinkComposition({ opusId: 'opus-1', compositionId: 'work-123' });
    });

    expect(result.current.deleteComposition).toBe('work-123');
    expect(result.current.unlinkComposition).toEqual({ opusId: 'opus-1', compositionId: 'work-123' });
  });

  it('should return early when handleConfirmCompositionDelete is called with null deleteComposition', async () => {
    const { result } = renderHook(() => useDeleteWorkAction());

    await act(async () => {
      await result.current.handleConfirmCompositionDelete();
    });

    expect(mockDeleteCompositionMut).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should return early when handleConfirmUnlinkComposition is called with null unlinkComposition', async () => {
    const { result } = renderHook(() => useDeleteWorkAction());

    await act(async () => {
      await result.current.handleConfirmUnlinkComposition();
    });

    expect(mockUnlinkCompositionMut).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should handle successful composition deletion and call onSuccess', async () => {
    const onSuccessMock = jest.fn<void, [string]>();
    mockDeleteCompositionMut.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() =>
      useDeleteWorkAction({ onSuccess: onSuccessMock })
    );

    act(() => {
      result.current.setDeleteComposition('work-123');
    });

    await act(async () => {
      await result.current.handleConfirmCompositionDelete();
    });

    expect(mockDeleteCompositionMut).toHaveBeenCalledWith({
      variables: { id: 'work-123' },
      refetchQueries: [PaginatedWorksDocument],
      awaitRefetchQueries: true
    });
    expect(toast.success).toHaveBeenCalledWith('Твір успішно видалено');
    expect(onSuccessMock).toHaveBeenCalledWith('work-123');
    expect(result.current.deleteComposition).toBeNull();
  });

  it('should handle successful composition unlink and call onSuccess', async () => {
    const onSuccessMock = jest.fn<void, [string]>();
    mockUnlinkCompositionMut.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() =>
      useDeleteWorkAction({ onSuccess: onSuccessMock })
    );

    act(() => {
      result.current.setUnlinkComposition({ opusId: 'opus-1', compositionId: 'work-123' });
    });

    await act(async () => {
      await result.current.handleConfirmUnlinkComposition();
    });

    expect(mockUnlinkCompositionMut).toHaveBeenCalledWith({
      variables: { opusId: 'opus-1', compositionId: 'work-123' },
      refetchQueries: [PaginatedWorksDocument],
      awaitRefetchQueries: true
    });
    expect(toast.success).toHaveBeenCalledWith('Твір успішно видалено з групи');
    expect(onSuccessMock).toHaveBeenCalledWith('work-123');
    expect(result.current.unlinkComposition).toBeNull();
  });

  it('should handle deletion failure and show error toast', async () => {
    mockDeleteCompositionMut.mockRejectedValueOnce(new Error('Mutation failed'));

    const { result } = renderHook(() => useDeleteWorkAction());

    act(() => {
      result.current.setDeleteComposition('work-123');
    });

    await act(async () => {
      await result.current.handleConfirmCompositionDelete();
    });

    expect(toast.error).toHaveBeenCalledWith('Помилка при видаленні твору');
  });

  it('should handle unlink failure and show error toast', async () => {
    mockUnlinkCompositionMut.mockRejectedValueOnce(new Error('Mutation failed'));

    const { result } = renderHook(() => useDeleteWorkAction());

    act(() => {
      result.current.setUnlinkComposition({ opusId: 'opus-1', compositionId: 'work-123' });
    });

    await act(async () => {
      await result.current.handleConfirmUnlinkComposition();
    });

    expect(toast.error).toHaveBeenCalledWith('Помилка при видаленні твору');
  });

  it('should correctly pass loading state from mutation hooks', () => {
    mockUseDeleteCompositionMutation.mockReturnValue([
      mockDeleteCompositionMut,
      { loading: true, data: undefined, reset: jest.fn(), called: true, client: {} as never }
    ]);
    mockUseUnlinkCompositionMutation.mockReturnValue([
      mockUnlinkCompositionMut,
      { loading: true, data: undefined, reset: jest.fn(), called: true, client: {} as never }
    ]);

    const { result } = renderHook(() => useDeleteWorkAction());

    expect(result.current.isDeleting).toBe(true);
    expect(result.current.isUnlinking).toBe(true);
  });
});
