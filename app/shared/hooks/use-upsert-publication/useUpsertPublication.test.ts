import { act, renderHook, waitFor } from '@testing-library/react';

import { useUpsertPublication } from './useUpsertPublication';
import { FetchedPublicationData, initialSeoValue, PublicationsItemType } from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { BaseContentStatuses } from '~/types/enums/common.enums';
import { EventStatus, MediaStatus, NewsStatus } from '~/types/graphql/generated/graphql';

type QueryOptions = { skip?: boolean };

const mockCreateNews = jest.fn();
const mockUpdateNews = jest.fn();
const mockDeleteNews = jest.fn();
const mockNewsQuery = jest.fn();
jest.mock('~/shared/hooks/use-news/useNews', () => ({
  useNewsById: (id: string, options?: QueryOptions) => mockNewsQuery(id, options),
  useCreateNews: () => [mockCreateNews],
  useUpdateNews: () => [mockUpdateNews],
  useDeleteNews: () => [mockDeleteNews]
}));

const mockCreateEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockEventQuery = jest.fn();
jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useEventById: (id: string, options?: QueryOptions) => mockEventQuery(id, options),
  useCreateEvent: () => [mockCreateEvent],
  useUpdateEvent: () => [mockUpdateEvent],
}));

const mockCreateMedia = jest.fn();
const mockUpdateMedia = jest.fn();
const mockMediaQuery = jest.fn();
jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useMediaMentionById: (id: string, options?: QueryOptions) => mockMediaQuery(id, options),
  useCreateMediaMention: () => [mockCreateMedia],
  useUpdateMediaMention: () => [mockUpdateMedia],
}));

const createValidSeoState = (type: PublicationsItemType): SeoBlockValue => ({
  ...initialSeoValue,
  meta: {
    uk: { 
      title: 'UK Title', 
      description: 'UK Desc', 
      keywords: '', 
      canonicalUrl: type === 'media' ? 'https://example.com' : '', 
      startDateTime: undefined, 
      endDateTime: undefined, 
      altText: { uk: '', en: '' } 
    },
    en: { 
      title: 'EN Title', 
      description: 'EN Desc', 
      keywords: '', 
      canonicalUrl: type === 'media' ? 'https://example.com' : '', 
      startDateTime: undefined, 
      endDateTime: undefined, 
      altText: { uk: '', en: '' } 
    }
  },
  ticketUrl: type === 'events' ? { uk: 'https://tickets.com/uk', en: 'https://tickets.com/en' } : { uk: '', en: '' },
  ogImage: null,
  allowIndexing: { uk: true, en: true }
});

describe('useUpsertPublication Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNewsQuery.mockReturnValue({ data: undefined, loading: false });
    mockEventQuery.mockReturnValue({ data: undefined, loading: false });
    mockMediaQuery.mockReturnValue({ data: undefined, loading: false });
  });

  describe('Initialization', () => {
    it('should initialize in Create mode with empty defaults', () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.adminTitle).toBe('');
      expect(result.current.seoValue).toEqual(initialSeoValue);
      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize in Edit mode and populate state from fetched data', async () => {
      const fetchedNewsData: FetchedPublicationData = {
        adminTitle: 'Fetched Title',
        newsDate: '2024-01-01T12:00:00Z',
        title: { uk: 'UK T', en: 'EN T' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
      };

      mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

      expect(result.current.isEditing).toBe(true);

      await waitFor(() => {
        expect(result.current.adminTitle).toBe('Fetched Title');
        expect(result.current.seoValue.meta.uk.title).toBe('UK T');
        expect(result.current.publishDate?.toISOString()).toBe('2024-01-01T12:00:00.000Z');
      });
    });
  });

  describe('Validation Logic', () => {
    it('should block save and show errors if adminTitle is empty', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.adminTitleError).toBe('Обов\'язкове поле');
      expect(mockCreateNews).not.toHaveBeenCalled();
    });

    it('should block save and set forceShowErrors if SEO data is invalid', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Valid Title');
        result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.forceShowErrors).toBe(true);
      expect(mockCreateNews).not.toHaveBeenCalled();
    });

    it('should block save if Event type lacks valid ticket URLs', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'events' }));

      act(() => {
        result.current.setAdminTitle('Event Title');
        const invalidSeo = createValidSeoState('events');
        invalidSeo.ticketUrl = { uk: 'not-a-url', en: 'also-not-a-url' };
        result.current.setSeoValue(invalidSeo);
      });

      act(() => {
        result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(result.current.forceShowErrors).toBe(true);
      expect(mockCreateEvent).not.toHaveBeenCalled();
    });
  });

  describe('Creation Flows (Save)', () => {
    it('should successfully create a News publication and return ID', async () => {
      mockCreateNews.mockResolvedValue({ data: { createNews: { id: 'new-news-99' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Valid News Title');
        result.current.setSeoValue(createValidSeoState('news'));
      });

      let returnedId;
      await act(async () => {
        returnedId = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(mockCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: 'Valid News Title',
          status: NewsStatus.Draft,
          content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } }
        })
      );
      
      expect(returnedId).toBe('new-news-99');
    });

    it('should successfully create an Event and return ID', async () => {
      mockCreateEvent.mockResolvedValue({ data: { createEvent: { id: 'new-event-77' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'events' }));

      act(() => {
        result.current.setAdminTitle('Valid Event Title');
        result.current.setSeoValue(createValidSeoState('events'));
      });

      let returnedId;
      await act(async () => {
        returnedId = await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(mockCreateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: 'Valid Event Title',
          status: EventStatus.Published, 
          ticketUrl: { uk: 'https://tickets.com/uk', en: 'https://tickets.com/en' }
        })
      );
      
      expect(returnedId).toBe('new-event-77');
    });
  });

  describe('Update Flows (Edit)', () => {
    it('should successfully update Media and return its ID', async () => {
      mockUpdateMedia.mockResolvedValue({ data: { updateMediaMention: { id: 'media-55' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'media', id: 'media-55' }));

      act(() => {
        result.current.setAdminTitle('Updated Media Title');
        result.current.setSeoValue(createValidSeoState('media'));
      });

      let returnedId;
      await act(async () => {
        returnedId = await result.current.handleSave(BaseContentStatuses.Editing);
      });

      expect(mockUpdateMedia).toHaveBeenCalledWith('media-55', expect.objectContaining({
        adminTitle: 'Updated Media Title',
        status: MediaStatus.Editing, 
        url: 'https://example.com' 
      }));
      
      expect(returnedId).toBe('media-55');
    });
  });


  describe('Helper Functions', () => {
    it('should correctly update start and end DateTimes via handleDateTimeChange', () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'events' }));

      act(() => {
        result.current.handleDateTimeChange('2025-01-01T00:00:00Z', '2025-01-02T00:00:00Z');
      });

      expect(result.current.seoValue.meta.uk.startDateTime).toBe('2025-01-01T00:00:00Z');
      expect(result.current.seoValue.meta.uk.endDateTime).toBe('2025-01-02T00:00:00Z');
      expect(result.current.seoValue.meta.en.startDateTime).toBe('2025-01-01T00:00:00Z');
    });
  });
});
