import { act,renderHook } from '@testing-library/react';

import { usePublicationManager } from './usePublicationsManager';
import { LocalizedEditorState } from '~/constants/publications';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('~/shared/components/content-editor', () => ({
  isContentEmpty: jest.fn((blocks: unknown[]) => !blocks || blocks.length === 0)
}));

jest.mock('~/constants/publications', () => ({
  DEFAULT_EMPTY_DOCUMENT: { blocks: [] },
}));

const mockUpdateNews = jest.fn();
const mockUpdateEvent = jest.fn();
const mockUpdateMedia = jest.fn();

jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useNewsById: jest.fn(),
  useUpdateNews: () => [mockUpdateNews]
}));

jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useEventById: jest.fn(),
  useUpdateEvent: () => [mockUpdateEvent]
}));

jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useMediaMentionById: jest.fn(),
  useUpdateMediaMention: () => [mockUpdateMedia]
}));

import { useEventById } from '~/shared/hooks/use-events/useEvents';
import { useMediaMentionById } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useNewsById } from '~/shared/hooks/use-news/useNews';

const resetQueryMocks = () => {
  (useNewsById as jest.Mock).mockReturnValue({ data: undefined, loading: false, error: undefined });
  (useEventById as jest.Mock).mockReturnValue({ data: undefined, loading: false, error: undefined });
  (useMediaMentionById as jest.Mock).mockReturnValue({ data: undefined, loading: false, error: undefined });
};

describe('usePublicationManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQueryMocks();
  });

  describe('Data Fetching', () => {
    it('should correctly return news data and skip others', () => {
      const mockNewsData = { newsById: { adminTitle: 'News Title' } };
      (useNewsById as jest.Mock).mockReturnValue({ data: mockNewsData, loading: false });

      const { result } = renderHook(() => usePublicationManager('news', '1'));

      expect(result.current.currentData).toEqual(mockNewsData.newsById);
      expect(result.current.isLoading).toBe(false);
      
      expect(useNewsById).toHaveBeenCalledWith('1', { skip: false });
      expect(useEventById).toHaveBeenCalledWith('1', { skip: true });
      expect(useMediaMentionById).toHaveBeenCalledWith('1', { skip: true });
    });

    it('should correctly return events data', () => {
      const mockEventData = { eventById: { adminTitle: 'Event Title' } };
      (useEventById as jest.Mock).mockReturnValue({ data: mockEventData, loading: false });

      const { result } = renderHook(() => usePublicationManager('events', '2'));

      expect(result.current.currentData).toEqual(mockEventData.eventById);
    });
  });

  describe('Content Initialization', () => {
    it('should initialize content and default to UA if UK content exists', () => {
      (useNewsById as jest.Mock).mockReturnValue({
        loading: false,
        data: {
          newsById: {
            content: {
              uk: { content: { blocks: [{ type: 'paragraph' }] } },
              en: { content: { blocks: [] } }
            }
          }
        }
      });

      const { result } = renderHook(() => usePublicationManager('news', '1'));

      expect(result.current.currentLanguage).toBe('UA');
      expect(result.current.editedContent?.uk?.content?.blocks.length).toBe(1);
    });

    it('should initialize content and fallback to EN if UK is empty but EN exists', () => {
      (useNewsById as jest.Mock).mockReturnValue({
        loading: false,
        data: {
          newsById: {
            content: {
              uk: { content: { blocks: [] } },
              en: { content: { blocks: [{ type: 'paragraph' }] } }
            }
          }
        }
      });

      const { result } = renderHook(() => usePublicationManager('news', '1'));

      expect(result.current.currentLanguage).toBe('EN');
    });

    it('should completely skip initialization for media type', () => {
      (useMediaMentionById as jest.Mock).mockReturnValue({
        loading: false,
        data: { mediaMentionById: { adminTitle: 'Media' } }
      });

      const { result } = renderHook(() => usePublicationManager('media', '1'));

      expect(result.current.editedContent).toBeNull();
    });
  });

  describe('updateResource Mutation Logic', () => {
    it('should call updateNews for news type', async () => {
      const { result } = renderHook(() => usePublicationManager('news', '1'));

      await act(async () => {
        await result.current.updateResource(BaseContentStatuses.Published, { extraProp: true });
      });

      expect(mockUpdateNews).toHaveBeenCalledWith({
        id: '1',
        input: { extraProp: true, status: BaseContentStatuses.Published }
      });
    });

    it('should call updateEvent for events type', async () => {
      const { result } = renderHook(() => usePublicationManager('events', '2'));

      await act(async () => {
        await result.current.updateResource(BaseContentStatuses.Draft, { customVal: 'test' });
      });

      expect(mockUpdateEvent).toHaveBeenCalledWith({
        id: '2',
        input: { customVal: 'test', status: BaseContentStatuses.Draft }
      });
    });

    it('should call updateMedia for media type with correct argument structure', async () => {
      const { result } = renderHook(() => usePublicationManager('media', '3'));

      await act(async () => {
        await result.current.updateResource(BaseContentStatuses.Published, { url: 'abc' });
      });

      expect(mockUpdateMedia).toHaveBeenCalledWith('3', {
        url: 'abc',
        status: BaseContentStatuses.Published
      });
    });
  });

  describe('State Reset Logic', () => {
    it('should overwrite editedContent and increment editorResetKey', () => {
      const { result } = renderHook(() => usePublicationManager('news', '1'));

      expect(result.current.editorResetKey).toBe(0);

      const emptyPayload: LocalizedEditorState = {
        uk: { content: { blocks: [], version: '1', lastModified: '' } },
        en: { content: { blocks: [], version: '1', lastModified: '' } }
      };

      act(() => {
        result.current.resetEditorState(emptyPayload);
      });

      expect(result.current.editedContent).toEqual(emptyPayload);
      expect(result.current.editorResetKey).toBe(1); 
    });
  });
});
