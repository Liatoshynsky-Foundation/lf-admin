import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { useContentCardActions } from './useContentCardActions';
import { CONTENT_MUTATION_RESULTS } from '~/constants/publications';

const MOCK_ID = '123';
const MOCK_EVENT_ID = 'card-42';
const MOCK_ERROR = new Error('Network Failure');

const mockDeleteNewsFn = jest.fn();
const mockDeleteEventFn = jest.fn();
const mockDeleteMediaFn = jest.fn();
const mockUnpublishNewsFn = jest.fn();
const mockUnpublishEventFn = jest.fn();
const mockDraftMediaFn = jest.fn();
const mockPublishNewsFn = jest.fn();
const mockPublishEventFn = jest.fn();
const mockPublishMediaFn = jest.fn();
const mockRefresh = jest.fn();

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useDeleteNews: () => [mockDeleteNewsFn],
  useUpdateNewsStatus: () => [{ unpublish: mockUnpublishNewsFn, publish: mockPublishNewsFn }]
}));

jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useDeleteEvent: () => [mockDeleteEventFn],
  useUpdateEventStatus: () => [{ unpublish: mockUnpublishEventFn, publish: mockPublishEventFn }]
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useDeleteMediaMention: () => [mockDeleteMediaFn],
  useUpdateMediaMentionStatus: () => [{ draft: mockDraftMediaFn, publish: mockPublishMediaFn }]
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh
  })
}));

describe('useContentCardActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteNewsFn.mockResolvedValue({ data: true });
    mockDeleteEventFn.mockResolvedValue({ data: true });
    mockDeleteMediaFn.mockResolvedValue({ data: true });
    mockUnpublishNewsFn.mockResolvedValue({ data: { updateNews: { id: MOCK_ID } } });
    mockUnpublishEventFn.mockResolvedValue({ data: { updateEvent: { id: MOCK_EVENT_ID } } });
    mockDraftMediaFn.mockResolvedValue({ data: { updateMediaMention: { id: MOCK_ID } } });
    mockPublishNewsFn.mockResolvedValue({ data: { updateNews: { id: MOCK_ID } } });
    mockPublishEventFn.mockResolvedValue({ data: { updateEvent: { id: MOCK_EVENT_ID } } });
    mockPublishMediaFn.mockResolvedValue({ data: { updateMediaMention: { id: MOCK_ID } } });
  });

  describe('initial state', () => {
    it('should initialize deleteModalOpen as false', () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      expect(result.current.deleteModalOpen).toBe(false);
    });

    it('should set isPublished to true when status is published', () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'published' }));

      expect(result.current.isPublished).toBe(true);
    });

    it('should set isPublished to false when status is draft', () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      expect(result.current.isPublished).toBe(false);
    });

    it('should update deleteModalOpen when setDeleteModalOpen is called', () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      act(() => {
        result.current.setDeleteModalOpen(true);
      });

      expect(result.current.deleteModalOpen).toBe(true);
    });
  });

  describe('handleDelete', () => {
    it('should delete news, close modal, and refresh', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      act(() => {
        result.current.setDeleteModalOpen(true);
      });

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockDeleteNewsFn).toHaveBeenCalledWith({ id: MOCK_ID });
      expect(result.current.deleteModalOpen).toBe(false);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should delete events content type', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'events', status: 'draft' }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockDeleteEventFn).toHaveBeenCalledWith({ id: MOCK_ID });
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should delete media content type', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'media', status: 'draft' }));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockDeleteMediaFn).toHaveBeenCalledWith(MOCK_ID);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should show toast when delete fails', async () => {
      mockDeleteNewsFn.mockRejectedValueOnce(MOCK_ERROR);
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      act(() => {
        result.current.setDeleteModalOpen(true);
      });

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationDeleteError);
      expect(result.current.deleteModalOpen).toBe(true);
    });
  });

  describe('handlePublish', () => {
    it('should publish news content and refresh list', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      await act(async () => {
        await result.current.handlePublish();
      });

      expect(mockPublishNewsFn).toHaveBeenCalledWith(MOCK_ID);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should publish events content and refresh list', async () => {
      const { result } = renderHook(() =>
        useContentCardActions({ id: MOCK_EVENT_ID, type: 'events', status: 'draft' })
      );

      await act(async () => {
        await result.current.handlePublish();
      });

      expect(mockPublishEventFn).toHaveBeenCalledWith(MOCK_EVENT_ID);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should publish media content and refresh list', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'media', status: 'draft' }));

      await act(async () => {
        await result.current.handlePublish();
      });

      expect(mockPublishMediaFn).toHaveBeenCalledWith(MOCK_ID);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should show error toast when publish returns no data', async () => {
      mockPublishEventFn.mockResolvedValueOnce({ data: null });
      const { result } = renderHook(() =>
        useContentCardActions({ id: MOCK_EVENT_ID, type: 'events', status: 'draft' })
      );

      await act(async () => {
        await result.current.handlePublish();
      });

      expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublishError);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should show toast when publish throws', async () => {
      mockPublishNewsFn.mockRejectedValueOnce(MOCK_ERROR);
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'draft' }));

      await act(async () => {
        await result.current.handlePublish();
      });

      expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublishError);
    });
  });

  describe('handleUnpublish', () => {
    it('should unpublish news content and refresh list', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'published' }));

      await act(async () => {
        await result.current.handleUnpublish();
      });

      expect(mockUnpublishNewsFn).toHaveBeenCalledWith(MOCK_ID);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should unpublish events content and refresh list', async () => {
      const { result } = renderHook(() =>
        useContentCardActions({ id: MOCK_EVENT_ID, type: 'events', status: 'published' })
      );

      await act(async () => {
        await result.current.handleUnpublish();
      });

      expect(mockUnpublishEventFn).toHaveBeenCalledWith(MOCK_EVENT_ID);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should draft media content and refresh list', async () => {
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'media', status: 'published' }));

      await act(async () => {
        await result.current.handleUnpublish();
      });

      expect(mockDraftMediaFn).toHaveBeenCalledWith(MOCK_ID);
      expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should show error toast when unpublish returns no data', async () => {
      mockUnpublishEventFn.mockResolvedValueOnce({ data: null });
      const { result } = renderHook(() =>
        useContentCardActions({ id: MOCK_EVENT_ID, type: 'events', status: 'published' })
      );

      await act(async () => {
        await result.current.handleUnpublish();
      });

      expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublishError);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should show toast when unpublish throws', async () => {
      mockUnpublishNewsFn.mockRejectedValueOnce(MOCK_ERROR);
      const { result } = renderHook(() => useContentCardActions({ id: MOCK_ID, type: 'news', status: 'published' }));

      await act(async () => {
        await result.current.handleUnpublish();
      });

      expect(toast.error).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublishError);
    });
  });
});
