import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { useWorksTableActions } from './useWorksTableActions';
import { OpusStatus, useDeleteOpusMutation, useUpdateOpusStatusMutation } from '~/types/graphql/generated/graphql';

const MOCK_GROUP_ID = 'group-123';
const MOCK_OPUS_ID = '1';
const MOCK_ERROR_MESSAGE = 'GraphQL Error';
const MOCK_ERROR = new Error(MOCK_ERROR_MESSAGE);

const TOAST_MESSAGES = {
  PUBLISHED: 'Групу опубліковано',
  DRAFT: 'Групу знято з публікації',
  STATUS_ERROR: 'Помилка при зміні статусу',
  UNGROUP_SUCCESS: 'Групу успішно розгруповано',
  UNGROUP_ERROR: 'Помилка при розгрупуванні групи',
  SHARE_SUCCESS: 'Посилання скопійовано в буфер обміну.',
  SHARE_ERROR: 'Не вдалося скопіювати посилання. Спробуйте ще раз.'
};

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUpdateOpusStatusMutation: jest.fn(),
  useDeleteOpusMutation: jest.fn(),
  PaginatedWorksDocument: { kind: 'Document' },
  OpusStatus: {
    Published: 'PUBLISHED',
    Draft: 'DRAFT'
  }
}));

jest.mock('~/constants/creativity', () => ({
  WORKS_BASE_PATH: '/creativity/works'
}));

describe('useWorksTableActions', () => {
  const mockUpdateOpusStatus = jest.fn();
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
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
        writable: true,
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useUpdateOpusStatusMutation as jest.MockedFunction<typeof useUpdateOpusStatusMutation>).mockReturnValue([
      mockUpdateOpusStatus
    ] as unknown as ReturnType<typeof useUpdateOpusStatusMutation>);
    (useDeleteOpusMutation as jest.MockedFunction<typeof useDeleteOpusMutation>).mockReturnValue([
      mockDeleteOpus
    ] as unknown as ReturnType<typeof useDeleteOpusMutation>);

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
        result.current.setGroupToUngroup(MOCK_GROUP_ID);
      });

      expect(result.current.groupToUngroup).toBe(MOCK_GROUP_ID);
    });
  });

  describe('handlePublishStatusChange', () => {
    it('should call updateOpusStatus and show success toast when publishing', async () => {
      mockUpdateOpusStatus.mockResolvedValueOnce({
        data: { updateOpusStatus: { id: MOCK_OPUS_ID, status: OpusStatus.Published } }
      });
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange(MOCK_GROUP_ID, OpusStatus.Published);
      });

      expect(mockUpdateOpusStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { id: MOCK_GROUP_ID, status: OpusStatus.Published }
        })
      );
      expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.PUBLISHED);
    });

    it('should call updateOpusStatus and show success toast when unpublishing', async () => {
      mockUpdateOpusStatus.mockResolvedValueOnce({
        data: { updateOpusStatus: { id: MOCK_OPUS_ID, status: OpusStatus.Draft } }
      });
      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange(MOCK_GROUP_ID, OpusStatus.Draft);
      });

      expect(mockUpdateOpusStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { id: MOCK_GROUP_ID, status: OpusStatus.Draft }
        })
      );
      expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.DRAFT);
    });

    it('should handle cache update properly when mutation succeeds', async () => {
      let updateFn: (cache: { modify: jest.Mock; identify: jest.Mock }, options: { data?: { updateOpusStatus?: { id: string; status: OpusStatus } } }) => void = () => {};

      mockUpdateOpusStatus.mockImplementationOnce((options) => {
        if (options?.update) {
          updateFn = options.update;
        }
        return Promise.resolve({
          data: { updateOpusStatus: { id: MOCK_OPUS_ID, status: OpusStatus.Published } }
        });
      });

      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange(MOCK_GROUP_ID, OpusStatus.Published);
      });

      const mockCache = {
        modify: jest.fn(),
        identify: jest.fn().mockReturnValue('Opus:1')
      };

      updateFn(mockCache, {});
      expect(mockCache.modify).not.toHaveBeenCalled();

      updateFn(mockCache, {
        data: { updateOpusStatus: { id: MOCK_OPUS_ID, status: OpusStatus.Published } }
      });

      expect(mockCache.identify).toHaveBeenCalledWith({
        __typename: 'Opus',
        id: MOCK_OPUS_ID
      });
      expect(mockCache.modify).toHaveBeenCalledWith({
        id: 'Opus:1',
        fields: {
          status: expect.any(Function)
        }
      });

      const modifyArgs = mockCache.modify.mock.calls[0][0];
      const statusFieldFn = modifyArgs.fields.status;
      expect(statusFieldFn()).toBe(OpusStatus.Published);
    });

    it('should catch error, log it, and show error toast when update fails', async () => {
      mockUpdateOpusStatus.mockRejectedValueOnce(MOCK_ERROR);

      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handlePublishStatusChange(MOCK_GROUP_ID, OpusStatus.Published);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(MOCK_ERROR);
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.STATUS_ERROR);
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
        result.current.setGroupToUngroup(MOCK_GROUP_ID);
      });

      await act(async () => {
        await result.current.handleConfirmUngroup();
      });

      expect(mockDeleteOpus).toHaveBeenCalledWith({
        variables: { id: MOCK_GROUP_ID },
        refetchQueries: [{ kind: 'Document' }],
        awaitRefetchQueries: true
      });
      expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.UNGROUP_SUCCESS);
      expect(result.current.groupToUngroup).toBeNull();
    });

    it('should catch error, log it, and show error toast when delete fails', async () => {
      mockDeleteOpus.mockRejectedValueOnce(MOCK_ERROR);
      const { result } = renderHook(() => useWorksTableActions());

      act(() => {
        result.current.setGroupToUngroup(MOCK_GROUP_ID);
      });

      await act(async () => {
        await result.current.handleConfirmUngroup();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(MOCK_ERROR);
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.UNGROUP_ERROR);
    });
  });

  describe('handleShareGroup', () => {
    it('should write URL to clipboard and show success toast', async () => {
      const mockWriteText = jest.fn().mockResolvedValueOnce(undefined);
      (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handleShareGroup(MOCK_GROUP_ID);
      });

      const expectedUrl = `${window.location.origin}/creativity/works/group/${MOCK_GROUP_ID}/edit`;
      expect(mockWriteText).toHaveBeenCalledWith(expectedUrl);
      expect(toast.success).toHaveBeenCalledWith(TOAST_MESSAGES.SHARE_SUCCESS);
    });

    it('should catch error, log it, and show error toast when clipboard access fails', async () => {
      const mockWriteText = jest.fn().mockRejectedValueOnce(MOCK_ERROR);
      (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

      const { result } = renderHook(() => useWorksTableActions());

      await act(async () => {
        await result.current.handleShareGroup(MOCK_GROUP_ID);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Помилка копіювання: ', MOCK_ERROR);
      expect(toast.error).toHaveBeenCalledWith(TOAST_MESSAGES.SHARE_ERROR);
    });
  });
});