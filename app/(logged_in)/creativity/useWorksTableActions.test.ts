import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { useWorksTableActions } from './useWorksTableActions';
import { OpusStatus, useDeleteOpusMutation, useUpdateOpusMutation } from '~/types/graphql/generated/graphql';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpdateOpusMutation: jest.fn(),
  useDeleteOpusMutation: jest.fn(),
  OpusStatus: {
    Published: 'PUBLISHED',
    Draft: 'DRAFT'
  }
}));

jest.mock('~/constants/creativity', () => ({
  WORKS_BASE_PATH: '/creativity/works'
}));

describe('useWorksTableActions', () => {
  const mockUpdateOpus = jest.fn();
  const mockDeleteOpus = jest.fn();

  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn() },
      configurable: true,
      writable: true
    });
  });

  afterAll(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    } else {
      // @ts-expect-error - clean up the mock if it didn't exist
      delete navigator.clipboard;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateOpusMutation as jest.Mock).mockReturnValue([mockUpdateOpus]);
    (useDeleteOpusMutation as jest.Mock).mockReturnValue([mockDeleteOpus]);

    // Mute console.error for tests that expect errors to keep the console clean
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Initial State & Setters', () => {
    it('should initialize with groupToUngroup as null', () => {
      const { result } = renderHook(() => useWorksTableActions());
      expect(result.current.groupToUngroup).toBeNull();
    });

    it('should update groupToUngroup state when setGroupToUngroup is called', () => {
      const { result } = renderHook(() => useWorksTableActions());

      act(() => {
        result.current.setGroupToUngroup('group-123');
      });

      expect(result.current.groupToUngroup).toBe('group-123');
    });
  });

  describe('handlePublishStatusChange', () => {
    it('should call updateOpus and show success toast when publishing', async () => {
      mockUpdateOpus.mockResolvedValueOnce({ data: { updateOpus: { id: '1' } } });
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange('group-1', OpusStatus.Published);
      });

      expect(mockUpdateOpus).toHaveBeenCalledWith({
        variables: { id: 'group-1', input: { status: OpusStatus.Published } }
      });
      expect(toast.success).toHaveBeenCalledWith('Групу опубліковано');
    });

    it('should call updateOpus and show success toast when unpublishing', async () => {
      mockUpdateOpus.mockResolvedValueOnce({ data: { updateOpus: { id: '1' } } });
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange('group-1', OpusStatus.Draft);
      });

      expect(mockUpdateOpus).toHaveBeenCalledWith({
        variables: { id: 'group-1', input: { status: OpusStatus.Draft } }
      });
      expect(toast.success).toHaveBeenCalledWith('Групу знято з публікації');
    });

    it('should catch error, log it, and show error toast when update fails', async () => {
      const mockError = new Error('GraphQL Error');
      mockUpdateOpus.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange('group-1', OpusStatus.Published);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
      expect(toast.error).toHaveBeenCalledWith('Помилка при зміні статусу');
    });
  });

  describe('handleConfirmUngroup', () => {
    it('should return early and do nothing if groupToUngroup is null', async () => {
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handleConfirmUngroup();
      });

      expect(mockDeleteOpus).not.toHaveBeenCalled();
    });

    it('should call deleteOpus, show success toast, and clear state on success', async () => {
      mockDeleteOpus.mockResolvedValueOnce({ data: { deleteOpus: true } });
      const { result } = renderHook(() => useWorksTableActions());

      act(() => {
        result.current.setGroupToUngroup('group-123');
      });

      await act(async () => {
        await result.current.handleConfirmUngroup();
      });

      expect(mockDeleteOpus).toHaveBeenCalledWith({
        variables: { id: 'group-123' },
        refetchQueries: ['AllOpuses', 'AllCompositions']
      });
      expect(toast.success).toHaveBeenCalledWith('Групу успішно розгруповано');
      expect(result.current.groupToUngroup).toBeNull();
    });

    it('should catch error, log it, and show error toast when delete fails', async () => {
      const mockError = new Error('Deletion Failed');
      mockDeleteOpus.mockRejectedValueOnce(mockError);
      const { result } = renderHook(() => useWorksTableActions());

      act(() => {
        result.current.setGroupToUngroup('group-123');
      });

      await act(async () => {
        await result.current.handleConfirmUngroup();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
      expect(toast.error).toHaveBeenCalledWith('Помилка при розгрупуванні групи');
    });
  });

  describe('handleShareGroup', () => {
    it('should write URL to clipboard and show success toast', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(undefined);
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handleShareGroup('group-1');
      });

      const expectedUrl = `${window.location.origin}/creativity/works/group/group-1/edit`;
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
      expect(toast.success).toHaveBeenCalledWith('Посилання скопійовано в буфер обміну.');
    });

    it('should catch error, log it, and show error toast when clipboard access fails', async () => {
      const mockError = new Error('Clipboard Denied');
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(mockError);
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handleShareGroup('group-1');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Помилка копіювання: ', mockError);
      expect(toast.error).toHaveBeenCalledWith('Не вдалося скопіювати посилання. Спробуйте ще раз.');
    });
  });
});
