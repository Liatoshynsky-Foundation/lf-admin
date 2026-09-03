import { act, renderHook, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';

import { useUpsertPublication } from './useUpsertPublication';
import { FetchedPublicationData, initialSeoValue, PublicationsItemType } from '~/constants/publications';
import { checkIsSeoInvalid } from '~/lib/utils/checkIsSeoInvalid';
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

const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: (msg: string) => mockToastError(msg)
  }
}));

const mockCreateEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockEventQuery = jest.fn();
jest.mock('~/shared/hooks/use-events/useEvents', () => ({
  useEventById: (id: string, options?: QueryOptions) => mockEventQuery(id, options),
  useCreateEvent: () => [mockCreateEvent],
  useUpdateEvent: () => [mockUpdateEvent]
}));

const mockCreateMedia = jest.fn();
const mockUpdateMedia = jest.fn();
const mockMediaQuery = jest.fn();
jest.mock('~/shared/hooks/use-media-mentions/useMediaMentions', () => ({
  useMediaMentionById: (id: string, options?: QueryOptions) => mockMediaQuery(id, options),
  useCreateMediaMention: () => [mockCreateMedia],
  useUpdateMediaMention: () => [mockUpdateMedia]
}));

jest.mock('~/lib/utils/checkIsSeoInvalid', () => ({
  checkIsSeoInvalid: jest.fn(jest.requireActual('~/lib/utils/checkIsSeoInvalid').checkIsSeoInvalid)
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
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

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
      expect(result.current.pageTitle).toBe('Створення Новини');
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

    it('should initialize in Edit mode and populate adminTitle with an empty string', async () => {
      const fetchedNewsData: FetchedPublicationData = {
        adminTitle: '',
        newsDate: '2024-01-01T12:00:00Z',
        title: { uk: 'UK T', en: 'EN T' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
      };

      mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

      await waitFor(() => {
        expect(result.current.adminTitle).toBe('');
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

    describe('getLangMeta branch coverage', () => {
      it('should handle missing titles, descriptions, keywords, alts, and dates (falsy fallbacks)', async () => {
        const fetchedNewsData: FetchedPublicationData = {
          adminTitle: 'Fetched News',
          newsDate: '2024-01-01T12:00:00Z',
          title: undefined,
          description: undefined,
          keywords: undefined,
          allowIndexation: { uk: true, en: true },
          coverImage: {
            src: 'img.png',
            crop: null,
            alt: undefined
          }
        };

        mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

        const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

        await waitFor(() => {
          expect(result.current.seoValue.meta.uk).toStrictEqual({
            title: '',
            description: '',
            keywords: '',
            canonicalUrl: '',
            altText: { uk: '', en: '' },
            startDateTime: undefined,
            endDateTime: undefined
          });
          expect(result.current.seoValue.meta.en).toStrictEqual({
            title: '',
            description: '',
            keywords: '',
            canonicalUrl: '',
            altText: { uk: '', en: '' },
            startDateTime: undefined,
            endDateTime: undefined
          });
        });
      });

      it('should handle media type with url and populated fields', async () => {
        const fetchedMediaData: FetchedPublicationData = {
          adminTitle: 'Fetched Media',
          publishedAt: '2024-01-01T12:00:00Z',
          title: { uk: 'UK T', en: 'EN T' },
          description: { uk: 'UK D', en: 'EN D' },
          keywords: { uk: 'kw1', en: 'kw2' },
          url: 'https://media-url.com',
          allowIndexation: { uk: true, en: true },
          coverImage: {
            src: 'img.png',
            crop: null,
            alt: { uk: 'Alt UK', en: 'Alt EN' }
          }
        };

        mockMediaQuery.mockReturnValue({ data: { mediaMentionById: fetchedMediaData }, loading: false });

        const { result } = renderHook(() => useUpsertPublication({ type: 'media', id: '123' }));

        await waitFor(() => {
          const { uk, en } = result.current.seoValue.meta;
          expect(uk.canonicalUrl).toBe('https://media-url.com');
          expect(en.canonicalUrl).toBe('https://media-url.com');
          expect(uk.keywords).toBe('kw1');
          expect(en.keywords).toBe('kw2');
          expect(uk.altText?.uk).toBe('Alt UK');
          expect(uk.altText?.en).toBe('Alt EN');
        });
      });

      it('should handle media type without url (falls back to empty string)', async () => {
        const fetchedMediaData: FetchedPublicationData = {
          adminTitle: 'Fetched Media No Url',
          publishedAt: '2024-01-01T12:00:00Z',
          title: { uk: 'UK T', en: 'EN T' },
          description: { uk: 'UK D', en: 'EN D' },
          url: undefined,
          allowIndexation: { uk: true, en: true },
          coverImage: {
            src: 'img.png',
            crop: null,
            alt: { uk: 'Alt UK', en: 'Alt EN' }
          }
        };

        mockMediaQuery.mockReturnValue({ data: { mediaMentionById: fetchedMediaData }, loading: false });

        const { result } = renderHook(() => useUpsertPublication({ type: 'media', id: '123' }));

        await waitFor(() => {
          const { uk, en } = result.current.seoValue.meta;
          expect(uk.canonicalUrl).toBe('');
          expect(en.canonicalUrl).toBe('');
        });
      });

      it('should parse startDateTime and endDateTime for events', async () => {
        const fetchedEventsData: FetchedPublicationData = {
          adminTitle: 'Fetched Event',
          publishedAt: '2024-01-01T12:00:00Z',
          title: { uk: 'UK T', en: 'EN T' },
          description: { uk: 'UK D', en: 'EN D' },
          allowIndexation: { uk: true, en: true },
          coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } },
          eventDateTimeStart: '2024-05-01T10:00:00Z',
          eventDateTimeEnd: '2024-05-01T12:00:00Z'
        };

        mockEventQuery.mockReturnValue({ data: { eventById: fetchedEventsData }, loading: false });

        const { result } = renderHook(() => useUpsertPublication({ type: 'events', id: '123' }));

        await waitFor(() => {
          const { uk, en } = result.current.seoValue.meta;
          expect(uk.startDateTime).toBe('2024-05-01T10:00:00.000Z');
          expect(uk.endDateTime).toBe('2024-05-01T12:00:00.000Z');
          expect(en.startDateTime).toBe('2024-05-01T10:00:00.000Z');
          expect(en.endDateTime).toBe('2024-05-01T12:00:00.000Z');
        });
      });

      it('should parse numeric timestamp string dates', async () => {
        const fetchedNewsData: FetchedPublicationData = {
          adminTitle: 'Timestamp News',
          newsDate: '1704110400000',
          title: { uk: 'UK T', en: 'EN T' },
          description: { uk: 'UK D', en: 'EN D' },
          allowIndexation: { uk: true, en: true },
          coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
        };

        mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

        const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

        await waitFor(() => {
          expect(result.current.publishDate?.toISOString()).toBe(new Date(1704110400000).toISOString());
        });
      });
    });
  });

  describe('initialState branch coverage', () => {
    it('should handle falsy/missing values for adminTitle, publishDate, ogImage, and allowIndexation', async () => {
      const fetchedNewsData: FetchedPublicationData = {
        adminTitle: undefined,
        newsDate: undefined,
        title: { uk: 'UK', en: 'EN' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: undefined,
        coverImage: {
          src: undefined,
          crop: null,
          alt: { uk: '', en: '' }
        }
      };

      mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

      await waitFor(() => {
        expect(result.current.adminTitle).toBe('');
        expect(result.current.publishDate).toBeNull();
        expect(result.current.seoValue.ogImage).toBeNull();
        expect(result.current.seoValue.allowIndexing.uk).toBe(true);
        expect(result.current.seoValue.allowIndexing.en).toBe(true);
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });

    it('should handle truthy/provided values for adminTitle, publishDate, ogImage, and allowIndexation', async () => {
      const fetchedNewsData: FetchedPublicationData = {
        adminTitle: 'Custom Admin Title',
        newsDate: '2024-01-01T12:00:00Z',
        title: { uk: 'UK', en: 'EN' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: false, en: false },
        coverImage: {
          src: 'https://site.com/image.png',
          crop: null,
          alt: { uk: '', en: '' }
        }
      };

      mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

      await waitFor(() => {
        expect(result.current.adminTitle).toBe('Custom Admin Title');
        expect(result.current.publishDate?.toISOString()).toBe('2024-01-01T12:00:00.000Z');
        expect(result.current.seoValue.ogImage).toBe('https://site.com/image.png');
        expect(result.current.seoValue.allowIndexing.uk).toBe(false);
        expect(result.current.seoValue.allowIndexing.en).toBe(false);
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });
  });
  describe('Validation Logic', () => {
    it('should return early and do nothing if type is invalid', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'invalid-type' as PublicationsItemType }));

      let resultData;
      await act(async () => {
        resultData = await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(resultData).toBeUndefined();
      expect(mockCreateNews).not.toHaveBeenCalled();
    });

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

    it('should block save if publication date is invalid', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Valid News Title');
        result.current.setSeoValue(createValidSeoState('news'));
        result.current.setPublishDate(dayjs('invalid-date'));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

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

    it('should block save when preview image is uploaded without alt text', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'events' }));

      act(() => {
        result.current.setAdminTitle('Event Title');
        const seoState = createValidSeoState('events');
        seoState.ogImage = 'https://example.com/image.jpg';
        seoState.meta.uk.altText = { uk: '', en: '' };
        seoState.meta.en.altText = { uk: '', en: '' };
        result.current.setSeoValue(seoState);
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
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

      expect(result.current.canonicalUrlError).toBe('');
    });

    it('should NOT create a News publication and set canonical URL error if the error contains url_1', async () => {
      mockCreateNews.mockRejectedValue(new Error('E11000 url_1'));
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Valid News Title');
        result.current.setSeoValue(createValidSeoState('news'));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(mockCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: 'Valid News Title',
          status: NewsStatus.Draft,
          content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } }
        })
      );

      expect(result.current.canonicalUrlError).toBe('Публікація з таким canonical URL вже існує.');
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('should NOT create a News publication and show the error toast', async () => {
      mockCreateNews.mockRejectedValue(new Error('Error E11000'));
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Valid News Title');
        result.current.setSeoValue(createValidSeoState('news'));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(mockCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: 'Valid News Title',
          status: NewsStatus.Draft,
          content: { uk: { content: { blocks: [] } }, en: { content: { blocks: [] } } }
        })
      );

      expect(mockToastError).toHaveBeenCalledWith('Публікація з такими даними вже існує.');
      expect(result.current.canonicalUrlError).toBe('');
    });

    it('should show generic error toast when error message is empty', async () => {
      mockCreateNews.mockRejectedValue(new Error(''));
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Valid News Title');
        result.current.setSeoValue(createValidSeoState('news'));
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(mockToastError).toHaveBeenCalledWith('Щось пішло не так. Спробуйте ще раз.');
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
      expect(result.current.canonicalUrlError).toBe('');
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

    it('should fallback title to adminTitle and description to empty string when seo fields are empty', async () => {
      (checkIsSeoInvalid as jest.Mock).mockReturnValueOnce(false);
      mockCreateNews.mockResolvedValue({ data: { createNews: { id: 'fallback-news' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      act(() => {
        result.current.setAdminTitle('Fallback Admin Title');
        const seoState = createValidSeoState('news');
        seoState.meta.uk.title = '';
        seoState.meta.en.title = '';
        seoState.meta.uk.description = '';
        seoState.meta.en.description = '';
        result.current.setSeoValue(seoState);
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(mockCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          title: { uk: 'Fallback Admin Title', en: 'Fallback Admin Title' },
          description: { uk: '', en: '' }
        })
      );
    });

    it('should fallback media url to adminTitle when canonicalUrl is missing in both locales', async () => {
      (checkIsSeoInvalid as jest.Mock).mockReturnValueOnce(false);
      mockCreateMedia.mockResolvedValue({ data: { createMediaMention: { id: 'media-fallback' } } });
      const { result } = renderHook(() => useUpsertPublication({ type: 'media' }));

      act(() => {
        result.current.setAdminTitle('Media Fallback Title');
        const seoState = createValidSeoState('media');
        seoState.meta.uk.canonicalUrl = '';
        seoState.meta.en.canonicalUrl = '';
        result.current.setSeoValue(seoState);
      });

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Draft);
      });

      expect(mockCreateMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'Media Fallback Title'
        })
      );
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

      expect(mockUpdateMedia).toHaveBeenCalledWith(
        'media-55',
        expect.objectContaining({
          adminTitle: 'Updated Media Title',
          status: MediaStatus.Editing,
          url: 'https://example.com'
        })
      );

      expect(returnedId).toBe('media-55');
      expect(result.current.canonicalUrlError).toBe('');
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

  describe('hasUnsavedChanges', () => {
    it('should be false initially and true after modifying publishDate, and false if reverted to null', async () => {
      const fetchedNewsData: FetchedPublicationData = {
        adminTitle: 'Fetched Title',
        newsDate: null,
        title: { uk: 'UK', en: 'EN' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
      };

      mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

      await waitFor(() => {
        expect(result.current.publishDate).toBeNull();
        expect(result.current.hasUnsavedChanges).toBe(false);
      });

      act(() => {
        result.current.setPublishDate(dayjs('2024-01-01T12:00:00Z'));
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.setPublishDate(null);
      });

      expect(result.current.publishDate).toBeNull();
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should not crash when edited publishDate becomes invalid', async () => {
      const fetchedNewsData: FetchedPublicationData = {
        adminTitle: 'Fetched Title',
        newsDate: '2024-01-01T12:00:00Z',
        title: { uk: 'UK', en: 'EN' },
        description: { uk: 'UK D', en: 'EN D' },
        allowIndexation: { uk: true, en: true },
        coverImage: { src: 'img.png', crop: null, alt: { uk: '', en: '' } }
      };

      mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

      await waitFor(() => {
        expect(result.current.hasUnsavedChanges).toBe(false);
      });

      act(() => {
        result.current.setPublishDate(dayjs('invalid-date'));
      });

      expect(result.current.publishDate?.isValid()).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
});
