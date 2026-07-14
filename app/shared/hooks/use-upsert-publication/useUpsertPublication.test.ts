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

    it('should initialize in Edit mode and populate state from fetched data if events are fetched', async () => {
      const fetchedEventsData: FetchedPublicationData = {
        adminTitle: 'Fetched Title',
        publishedAt: '2024-01-01T12:00:00Z',
        title: { uk: 'UK T', en: 'EN T' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
      };

      mockEventQuery.mockReturnValue({ data: { eventById: fetchedEventsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'events', id: '123' }));

      expect(result.current.isEditing).toBe(true);

      await waitFor(() => {
        expect(result.current.adminTitle).toBe('Fetched Title');
        expect(result.current.seoValue.meta.uk.title).toBe('UK T');
        expect(result.current.publishDate?.toISOString()).toBe('2024-01-01T12:00:00.000Z');
      });
    });

    it('should initialize in Edit mode and populate state from fetched data if media are fetched', async () => {
      const fetchedMediaData: FetchedPublicationData = {
        adminTitle: 'Fetched Title',
        publishedAt: '2024-01-01T12:00:00Z',
        title: { uk: 'UK T', en: 'EN T' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
      };

      mockMediaQuery.mockReturnValue({ data: { mediaMentionById: fetchedMediaData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'media', id: '123' }));

      expect(result.current.isEditing).toBe(true);

      await waitFor(() => {
        expect(result.current.adminTitle).toBe('Fetched Title');
        expect(result.current.seoValue.meta.uk.title).toBe('UK T');
        expect(result.current.publishDate?.toISOString()).toBe('2024-01-01T12:00:00.000Z');
      });
    });

    it('should call changeSeoValue on initialize with correct meta');
    it('should call changeSeoValue on initialize with fallback for properties to null if fetchedData has undefined properties');


    describe('getLangMeta', ()=>{
      it('should return correct object if data is provided', async ()=>{
      
      });
      it('should return fallback data for returned object if data is missing');
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
        const resultData = await result.current.handleSave(BaseContentStatuses.Draft);
        returnedId = resultData?.id;
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
        const resultData = await result.current.handleSave(BaseContentStatuses.Published);
        returnedId = resultData?.id;
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

    it('should successfully create Media and return ID', async () => {
      mockCreateMedia.mockResolvedValue({ data: { createMediaMention: { id: 'new-media-77' } } });

      const { result } = renderHook(() => useUpsertPublication({ type: 'media' }));

      act(() => {
        result.current.setAdminTitle('Valid Media Title');
        result.current.setSeoValue(createValidSeoState('media'));
      });

      let returnedId;
      await act(async () => {
        const resultData = await result.current.handleSave(BaseContentStatuses.Published);
        returnedId = resultData?.id;
      });

      expect(mockCreateMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: 'Valid Media Title',
          status: 'published',
          url: expect.any(String)
        })
      );

      expect(returnedId).toBe('new-media-77');
    });
  });

  it('should hit catch block in handleSave when mutation fails', async () => {
    mockCreateNews.mockRejectedValue(new Error('Server Crash'));

    const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

    act(() => {
      result.current.setAdminTitle('Test');
      result.current.setSeoValue(createValidSeoState('news'));
    });

    let returnedId;
    await act(async () => {
      const resultData = await result.current.handleSave(BaseContentStatuses.Published);
      returnedId = resultData?.id;
    });

    expect(returnedId).toBeUndefined();
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
        const resultData = await result.current.handleSave(BaseContentStatuses.Editing);
        returnedId = resultData?.id;
      });

      expect(mockUpdateMedia).toHaveBeenCalledWith('media-55', expect.objectContaining({
        adminTitle: 'Updated Media Title',
        status: MediaStatus.Editing,
        url: 'https://example.com'
      }));

      expect(returnedId).toBe('media-55');
    });


    it('should successfully update Events and return its ID', async () => {
      mockUpdateEvent.mockResolvedValue({ data: { updateEvent: { id: 'events-55', slug: 'event-slug' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'events', id: 'events-55' }));

      act(() => {
        result.current.setAdminTitle('Updated Event Title');
        result.current.setSeoValue(createValidSeoState('events'));
      });

      let returnedId;
      await act(async () => {
        const resultData = await result.current.handleSave(BaseContentStatuses.Editing);
        returnedId = resultData?.id;
      });

      expect(mockUpdateEvent).toHaveBeenCalledWith({
        id: 'events-55',
        input: expect.objectContaining({
          adminTitle: 'Updated Event Title',
          status: 'editing',
          ticketUrl: { uk: 'https://tickets.com/uk', en: 'https://tickets.com/en' },
          eventLink: 'Updated Event Title'
        })
      });

      expect(returnedId).toBe('events-55');
    });

    it('should successfully update News and return its ID', async () => {
      mockUpdateNews.mockResolvedValue({ data: { updateNews: { id: 'news-55', slug: 'news-slug' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: 'news-55' }));

      act(() => {
        result.current.setAdminTitle('Updated News Title');
        result.current.setSeoValue(createValidSeoState('news'));
      });

      let returnedId;
      await act(async () => {
        const resultData = await result.current.handleSave(BaseContentStatuses.Editing);
        returnedId = resultData?.id;
      });

      expect(mockUpdateNews).toHaveBeenCalledWith({
        id: 'news-55',
        input: expect.objectContaining({
          adminTitle: 'Updated News Title',
          status: 'editing',
          title: expect.objectContaining({
            uk: 'UK Title',
            en: 'EN Title'
          })
        })
      });

      expect(returnedId).toBe('news-55');
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

      it('should return true for isSeoInvalid if URL is totally invalid', async () => {
        const { result } = renderHook(() => useUpsertPublication({ type: 'media' }));

        act(() => {
          result.current.setAdminTitle('Valid Title');
          const invalidSeo = createValidSeoState('media');
          invalidSeo.meta.uk.canonicalUrl = 'not-a-url-at-all';
          result.current.setSeoValue(invalidSeo);
        });

        await act(async () => {
          await result.current.handleSave(BaseContentStatuses.Published);
        });

        expect(result.current.forceShowErrors).toBe(true);
      });
    });
  });
});
