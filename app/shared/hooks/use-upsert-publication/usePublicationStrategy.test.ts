import { act,renderHook } from '@testing-library/react';

import { PublicationFormState } from './usePublicationForm';
import { BasePayload, usePublicationStrategy } from './usePublicationStrategy';
import { FetchedPublicationData, initialSeoValue } from '~/constants/publications';
import { useCreateEvent, useEventById, useUpdateEvent } from '~/shared/hooks/use-events/useEvents';
import { useCreateMediaMention, useMediaMentionById, useUpdateMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useCreateNews, useDeleteNews, useNewsById, useUpdateNews } from '~/shared/hooks/use-news/useNews';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('~/shared/hooks/use-news/useNews');
jest.mock('~/shared/hooks/use-events/useEvents');
jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions');

const MOCK_STRATEGY = {
  dateIso: '2025-01-01T00:00:00.000Z',
  coverImageSrc: 'https://liatoshynsky.org/img.jpg',
  existingNewsId: 'existing-news',
  existingEventId: 'existing-event',
  existingMediaId: 'existing-media',
  news: { id: 'news-1', slug: 'news-1', adminTitle: 'Тестова новина' },
  event: { id: 'evt-1', slug: 'evt-1', adminTitle: 'Тестова подія' },
  media: { id: 'med-1', slug: 'med-1', adminTitle: 'Тестове медіа' }
} as const;

const mockCreateNews = jest.fn();
const mockUpdateNews = jest.fn();
const mockDeleteNews = jest.fn();
const mockCreateEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockCreateMediaMention = jest.fn();
const mockUpdateMediaMention = jest.fn();

const createMockSeoValue = (overrides?: Partial<typeof initialSeoValue>) => ({
  ...initialSeoValue,
  meta: {
    uk: { ...initialSeoValue.meta.uk, title: MOCK_STRATEGY.news.adminTitle, description: 'Опис новини' },
    en: { ...initialSeoValue.meta.en, title: 'News title', description: 'News description' }
  },
  ...overrides
});

const createMockFormData = (overrides?: Partial<PublicationFormState>): PublicationFormState => ({
  adminTitle: MOCK_STRATEGY.news.adminTitle,
  publishDate: null,
  seoValue: createMockSeoValue(),
  crop: null,
  ...overrides
} as PublicationFormState);

const createMockBasePayload = (overrides?: Partial<BasePayload>): BasePayload => ({
  adminTitle: MOCK_STRATEGY.news.adminTitle,
  title: { uk: 'Новина', en: 'News' },
  description: { uk: 'Опис', en: 'Description' },
  keywords: { uk: 'Ключове слово', en: 'Keyword' },
  allowIndexation: { uk: true, en: true },
  coverImage: { src: MOCK_STRATEGY.coverImageSrc },
  ...overrides
});

describe('usePublicationStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useNewsById as jest.Mock).mockReturnValue({ data: null, loading: false });
    (useCreateNews as jest.Mock).mockReturnValue([mockCreateNews]);
    (useUpdateNews as jest.Mock).mockReturnValue([mockUpdateNews]);
    (useDeleteNews as jest.Mock).mockReturnValue([mockDeleteNews]);

    (useEventById as jest.Mock).mockReturnValue({ data: null, loading: false });
    (useCreateEvent as jest.Mock).mockReturnValue([mockCreateEvent]);
    (useUpdateEvent as jest.Mock).mockReturnValue([mockUpdateEvent]);

    (useMediaMentionById as jest.Mock).mockReturnValue({ data: null, loading: false });
    (useCreateMediaMention as jest.Mock).mockReturnValue([mockCreateMediaMention]);
    (useUpdateMediaMention as jest.Mock).mockReturnValue([mockUpdateMediaMention]);
  });

  describe('News Strategy', () => {
    it('should extract correct date for news', () => {
      const { result } = renderHook(() => usePublicationStrategy('news'));
      const mockNewsData: Partial<FetchedPublicationData> = { newsDate: MOCK_STRATEGY.dateIso };

      expect(result.current.extractDate(mockNewsData as FetchedPublicationData)).toBe(MOCK_STRATEGY.dateIso);
    });

    it('should extract items using previewConfig itemsAccessor', () => {
      const { result } = renderHook(() => usePublicationStrategy('news'));
      const mockItems = [{ id: MOCK_STRATEGY.news.id }];

      const items = result.current.previewConfig?.itemsAccessor({ allNews: mockItems });

      expect(items).toBe(mockItems);
    });

    it('should save news document (create mode)', async () => {
      const { result } = renderHook(() => usePublicationStrategy('news'));
      const formLatestData = createMockFormData();
      const commonInput = createMockBasePayload({ adminTitle: MOCK_STRATEGY.news.adminTitle });

      mockCreateNews.mockResolvedValue({
        data: { createNews: { id: MOCK_STRATEGY.news.id, slug: MOCK_STRATEGY.news.slug } }
      });

      let res;
      await act(async () => {
        res = await result.current.saveDocument(BaseContentStatuses.Published, commonInput, formLatestData);
      });

      expect(mockCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          adminTitle: MOCK_STRATEGY.news.adminTitle
        })
      );
      expect(res).toEqual({ id: MOCK_STRATEGY.news.id, slug: MOCK_STRATEGY.news.slug });
    });

    it('should save news document (edit mode)', async () => {
      const { result } = renderHook(() => usePublicationStrategy('news', MOCK_STRATEGY.existingNewsId));
      const formLatestData = createMockFormData();
      const commonInput = createMockBasePayload({ adminTitle: MOCK_STRATEGY.news.adminTitle });

      mockUpdateNews.mockResolvedValue({
        data: { updateNews: { id: MOCK_STRATEGY.existingNewsId, slug: MOCK_STRATEGY.news.slug } }
      });

      let res;
      await act(async () => {
        res = await result.current.saveDocument(
          BaseContentStatuses.Published,
          commonInput,
          formLatestData,
          MOCK_STRATEGY.existingNewsId
        );
      });

      expect(mockUpdateNews).toHaveBeenCalledWith({
        id: MOCK_STRATEGY.existingNewsId,
        input: expect.objectContaining({
          status: BaseContentStatuses.Published,
          adminTitle: MOCK_STRATEGY.news.adminTitle
        })
      });
      expect(res).toEqual({ id: MOCK_STRATEGY.existingNewsId, slug: MOCK_STRATEGY.news.slug });
    });
  });

  describe('Events Strategy', () => {
    it('should extract correct date for events', () => {
      const { result } = renderHook(() => usePublicationStrategy('events'));
      const mockEventData: Partial<FetchedPublicationData> = { publishedAt: MOCK_STRATEGY.dateIso };

      expect(result.current.extractDate(mockEventData as FetchedPublicationData)).toBe(MOCK_STRATEGY.dateIso);
    });

    it('should extract items using previewConfig itemsAccessor', () => {
      const { result } = renderHook(() => usePublicationStrategy('events'));
      const mockItems = [{ id: MOCK_STRATEGY.event.id }];

      const items = result.current.previewConfig?.itemsAccessor({ allEvents: mockItems });

      expect(items).toBe(mockItems);
    });

    it('should save event document (create mode)', async () => {
      const { result } = renderHook(() => usePublicationStrategy('events'));
      const formLatestData = createMockFormData();
      const commonInput = createMockBasePayload({ adminTitle: MOCK_STRATEGY.event.adminTitle });

      mockCreateEvent.mockResolvedValue({
        data: { createEvent: { id: MOCK_STRATEGY.event.id, slug: MOCK_STRATEGY.event.slug } }
      });

      let res;
      await act(async () => {
        res = await result.current.saveDocument(BaseContentStatuses.Published, commonInput, formLatestData);
      });

      expect(mockCreateEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          adminTitle: MOCK_STRATEGY.event.adminTitle
        })
      );
      expect(res).toEqual({ id: MOCK_STRATEGY.event.id, slug: MOCK_STRATEGY.event.slug });
    });

    it('should save event document (edit mode)', async () => {
      const { result } = renderHook(() => usePublicationStrategy('events', MOCK_STRATEGY.existingEventId));
      const formLatestData = createMockFormData();
      const commonInput = createMockBasePayload({ adminTitle: MOCK_STRATEGY.event.adminTitle });

      mockUpdateEvent.mockResolvedValue({
        data: { updateEvent: { id: MOCK_STRATEGY.existingEventId, slug: MOCK_STRATEGY.event.slug } }
      });

      let res;
      await act(async () => {
        res = await result.current.saveDocument(
          BaseContentStatuses.Published,
          commonInput,
          formLatestData,
          MOCK_STRATEGY.existingEventId
        );
      });

      expect(mockUpdateEvent).toHaveBeenCalledWith({
        id: MOCK_STRATEGY.existingEventId,
        input: expect.objectContaining({
          status: BaseContentStatuses.Published,
          adminTitle: MOCK_STRATEGY.event.adminTitle
        })
      });
      expect(res).toEqual({ id: MOCK_STRATEGY.existingEventId, slug: MOCK_STRATEGY.event.slug });
    });
  });

  describe('Media Strategy', () => {
    it('should extract correct date for media', () => {
      const { result } = renderHook(() => usePublicationStrategy('media'));
      const mockMediaData: Partial<FetchedPublicationData> = { publishedAt: MOCK_STRATEGY.dateIso };

      expect(result.current.extractDate(mockMediaData as FetchedPublicationData)).toBe(MOCK_STRATEGY.dateIso);
    });

    it('should save media document (create mode)', async () => {
      const { result } = renderHook(() => usePublicationStrategy('media'));
      const formLatestData = createMockFormData();
      const commonInput = createMockBasePayload({ adminTitle: MOCK_STRATEGY.media.adminTitle });

      mockCreateMediaMention.mockResolvedValue({
        data: { createMediaMention: { id: MOCK_STRATEGY.media.id, slug: MOCK_STRATEGY.media.slug } }
      });

      let res;
      await act(async () => {
        res = await result.current.saveDocument(BaseContentStatuses.Published, commonInput, formLatestData);
      });

      expect(mockCreateMediaMention).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          adminTitle: MOCK_STRATEGY.media.adminTitle
        })
      );
      expect(res).toEqual({ id: MOCK_STRATEGY.media.id, slug: MOCK_STRATEGY.media.slug });
    });

    it('should save media document (edit mode)', async () => {
      const { result } = renderHook(() => usePublicationStrategy('media', MOCK_STRATEGY.existingMediaId));
      const formLatestData = createMockFormData();
      const commonInput = createMockBasePayload({ adminTitle: MOCK_STRATEGY.media.adminTitle });

      mockUpdateMediaMention.mockResolvedValue({
        data: { updateMediaMention: { id: MOCK_STRATEGY.existingMediaId, slug: MOCK_STRATEGY.media.slug } }
      });

      let res;
      await act(async () => {
        res = await result.current.saveDocument(
          BaseContentStatuses.Published,
          commonInput,
          formLatestData,
          MOCK_STRATEGY.existingMediaId
        );
      });

      expect(mockUpdateMediaMention).toHaveBeenCalledWith(
        MOCK_STRATEGY.existingMediaId,
        expect.objectContaining({
          status: BaseContentStatuses.Published,
          adminTitle: MOCK_STRATEGY.media.adminTitle
        })
      );
      expect(res).toEqual({ id: MOCK_STRATEGY.existingMediaId, slug: MOCK_STRATEGY.media.slug });
    });
  });

  describe('Unsupported Strategy', () => {
    it('should throw error for unsupported publication type', () => {
      expect(() => {
        usePublicationStrategy('unsupported' as never);
      }).toThrow('Unsupported publication type: unsupported');
    });
  });
});
