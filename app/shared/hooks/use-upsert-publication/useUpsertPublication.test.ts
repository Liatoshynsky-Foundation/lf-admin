import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';

import { usePublicationForm, validatePublicationSeo } from './usePublicationForm';
import { usePublicationStrategy } from './usePublicationStrategy';
import { useUpsertPublication } from './useUpsertPublication';
import { initialSeoValue } from '~/constants/publications';
import { useSystemPreview } from '~/shared/hooks/use-system-preview/useSystemPreview';
import { BaseContentStatuses } from '~/types/enums/common.enums';

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}));

jest.mock('./usePublicationForm', () => ({
  ...jest.requireActual('./usePublicationForm'),
  usePublicationForm: jest.fn(),
  validatePublicationSeo: jest.fn()
}));
jest.mock('./usePublicationStrategy');
jest.mock('~/shared/hooks/use-system-preview/useSystemPreview');

const MOCK_PUBLICATION = {
  adminTitle: 'Тестова новина',
  existingAdminTitle: 'Стара новина',
  newsDate: '2025-01-01T00:00:00Z',
  coverImageSrc: 'https://liatoshynsky.org/image.jpg',
  existingId: 'existing-id',
  newsId: 'news-123',
  newsSlug: 'testova-novyna',
  previewId: 'sys-prev-id',
  previewSlug: 'sys-preview-news'
} as const;

const createMockSeoValue = (overrides?: Partial<typeof initialSeoValue>) => ({
  ...initialSeoValue,
  meta: {
    uk: { ...initialSeoValue.meta.uk, title: MOCK_PUBLICATION.adminTitle, description: 'Опис публікації' },
    en: { ...initialSeoValue.meta.en, title: 'Publication title', description: 'Publication description' }
  },
  ...overrides
});

describe('useUpsertPublication', () => {
  const mockBuildCommonInput = jest.fn();
  const mockSaveDocument = jest.fn();
  const mockExtractDate = jest.fn();
  const mockFindSystemPreviewDocument = jest.fn();

  const mockSetAdminTitle = jest.fn();
  const mockSetPublishDate = jest.fn();
  const mockSetCrop = jest.fn();
  const mockSetSeoValue = jest.fn();
  const mockSetInitialState = jest.fn();
  const mockSetAdminTitleError = jest.fn();
  const mockSetSeoErrors = jest.fn();
  const mockSetForceShowErrors = jest.fn();
  const mockSetCanonicalUrlError = jest.fn();

  const setupFormMockState = (customTitle: string = MOCK_PUBLICATION.adminTitle) => {
    (usePublicationForm as jest.Mock).mockReturnValue({
      adminTitle: customTitle,
      seoValue: createMockSeoValue(),
      publishDate: null,
      crop: null,
      buildCommonInput: mockBuildCommonInput,
      setAdminTitle: mockSetAdminTitle,
      setPublishDate: mockSetPublishDate,
      setCrop: mockSetCrop,
      setSeoValue: mockSetSeoValue,
      setInitialState: mockSetInitialState,
      setAdminTitleError: mockSetAdminTitleError,
      setForceShowErrors: mockSetForceShowErrors,
      setSeoErrors: mockSetSeoErrors,
      setCanonicalUrlError: mockSetCanonicalUrlError,
      latestDataRef: {
        current: {
          adminTitle: customTitle,
          publishDate: null,
          seoValue: createMockSeoValue(),
          crop: null
        }
      }
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (validatePublicationSeo as jest.Mock).mockReturnValue({
      seoErrors: undefined,
      hasMetaErrors: false,
      hasUrlErrors: false
    });

    (useSystemPreview as jest.Mock).mockReturnValue({
      findSystemPreviewDocument: mockFindSystemPreviewDocument
    });

    setupFormMockState();

    (usePublicationStrategy as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      saveDocument: mockSaveDocument,
      previewConfig: {
        slug: MOCK_PUBLICATION.previewSlug,
        query: {},
        itemsAccessor: jest.fn()
      },
      extractDate: mockExtractDate
    });
  });

  describe('Initialization', () => {
    it('should initialize form state from strategy data when editing', () => {
      const mockData = {
        adminTitle: MOCK_PUBLICATION.existingAdminTitle,
        newsDate: MOCK_PUBLICATION.newsDate,
        title: { uk: 'Новина', en: 'News' },
        coverImage: { src: MOCK_PUBLICATION.coverImageSrc, crop: null }
      };

      (usePublicationStrategy as jest.Mock).mockReturnValue({
        data: mockData,
        loading: false,
        saveDocument: mockSaveDocument,
        extractDate: () => mockData.newsDate
      });

      renderHook(() => useUpsertPublication({ type: 'news', id: MOCK_PUBLICATION.existingId }));

      expect(mockSetAdminTitle).toHaveBeenCalledWith(MOCK_PUBLICATION.existingAdminTitle);
      expect(mockSetInitialState).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: MOCK_PUBLICATION.existingAdminTitle,
          seoValue: expect.objectContaining({
            ogImage: MOCK_PUBLICATION.coverImageSrc
          })
        })
      );
    });
  });

  describe('handleSave', () => {
    it('should return undefined and set errors if title is empty', async () => {
      setupFormMockState('');

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      let res;
      await act(async () => {
        res = await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(res).toBeUndefined();
      expect(mockSetAdminTitleError).toHaveBeenCalledWith('Обов\'язкове поле');
      expect(mockSaveDocument).not.toHaveBeenCalled();
    });

    it('should set seo errors and force show errors when validatePublicationSeo returns hasMetaErrors', async () => {
      const mockSeoErrors = { meta: { uk: { title: 'Помилка' }, en: {} } };
      (validatePublicationSeo as jest.Mock).mockReturnValue({
        seoErrors: mockSeoErrors,
        hasMetaErrors: true,
        hasUrlErrors: false
      });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(mockSetSeoErrors).toHaveBeenCalledWith(mockSeoErrors);
      expect(mockSetForceShowErrors).toHaveBeenCalledWith(true);
      expect(mockSaveDocument).not.toHaveBeenCalled();
    });

    it('should call strategy saveDocument and return result', async () => {
      mockBuildCommonInput.mockReturnValue({
        adminTitle: MOCK_PUBLICATION.adminTitle,
        title: { uk: 'Заголовок', en: 'Title' }
      });

      const expectedResponse = { id: MOCK_PUBLICATION.newsId, slug: MOCK_PUBLICATION.newsSlug };
      mockSaveDocument.mockResolvedValue(expectedResponse);

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      let res;
      await act(async () => {
        res = await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(res).toEqual(expectedResponse);
      expect(mockSaveDocument).toHaveBeenCalledWith(
        BaseContentStatuses.Published,
        expect.objectContaining({ adminTitle: MOCK_PUBLICATION.adminTitle }),
        expect.objectContaining({ adminTitle: MOCK_PUBLICATION.adminTitle }),
        undefined
      );
    });

    it.each([
      {
        scenario: 'E11000 duplicate error',
        errorMsg: 'E11000',
        assert: () => expect(toast.error).toHaveBeenCalledWith('Публікація з такими даними вже існує.')
      },
      {
        scenario: 'canonical url duplicate error',
        errorMsg: 'Duplicate key url_1',
        assert: () => expect(mockSetCanonicalUrlError).toHaveBeenCalledWith('Публікація з таким canonical URL вже існує.')
      },
      {
        scenario: 'generic unknown error',
        errorMsg: 'Unknown Generic Error',
        assert: () => expect(toast.error).toHaveBeenCalledWith('Щось пішло не так. Спробуйте ще раз.')
      }
    ])('should handle $scenario correctly', async ({ errorMsg, assert }) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSaveDocument.mockRejectedValue(new Error(errorMsg));

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
      });

      assert();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handlePreviewSave', () => {
    it('should generate preview payload preserving user title and using system preview document id', async () => {
      mockBuildCommonInput.mockReturnValue({
        adminTitle: MOCK_PUBLICATION.adminTitle,
        title: { uk: 'Тестова назва', en: 'Test Title' },
        allowIndexation: { uk: true, en: true }
      });

      mockFindSystemPreviewDocument.mockResolvedValue(MOCK_PUBLICATION.previewId);
      mockSaveDocument.mockResolvedValue({ id: MOCK_PUBLICATION.previewId, slug: MOCK_PUBLICATION.previewSlug });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      let res;
      await act(async () => {
        res = await result.current.handlePreviewSave();
      });

      expect(mockFindSystemPreviewDocument).toHaveBeenCalled();
      expect(mockSaveDocument).toHaveBeenCalledWith(
        BaseContentStatuses.Draft,
        expect.objectContaining({
          adminTitle: MOCK_PUBLICATION.previewSlug,
          title: { uk: 'Тестова назва', en: 'Test Title' },
          allowIndexation: { uk: false, en: false }
        }),
        expect.objectContaining({ adminTitle: MOCK_PUBLICATION.adminTitle }),
        MOCK_PUBLICATION.previewId
      );
      expect(res).toEqual({ id: MOCK_PUBLICATION.previewId, slug: MOCK_PUBLICATION.previewSlug });
    });

    it('should return null if preview is not supported', async () => {
      (usePublicationStrategy as jest.Mock).mockReturnValue({
        previewConfig: null,
        saveDocument: mockSaveDocument
      });

      const { result } = renderHook(() => useUpsertPublication({ type: 'media' }));

      let res;
      await act(async () => {
        res = await result.current.handlePreviewSave();
      });

      expect(res).toBeNull();
      expect(mockSaveDocument).not.toHaveBeenCalled();
    });

    it('should return null if saveDocument returns null', async () => {
      mockFindSystemPreviewDocument.mockResolvedValue(MOCK_PUBLICATION.previewId);
      mockSaveDocument.mockResolvedValue(null);

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      let res;
      await act(async () => {
        res = await result.current.handlePreviewSave();
      });

      expect(res).toBeNull();
    });

    it('should handle errors in handlePreviewSave and show toast error', async () => {
      mockSaveDocument.mockRejectedValue(new Error('Preview save failure'));

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      let res;
      await act(async () => {
        res = await result.current.handlePreviewSave();
      });

      expect(res).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Щось пішло не так при збереженні прев\'ю.');
    });
  });

  describe('Branch & Edge Case Coverage', () => {
    it('should return empty pageTitle and block handleSave when publication type is invalid', async () => {
      const { result } = renderHook(() => useUpsertPublication({ type: 'invalid' as any }));

      expect(result.current.pageTitle).toBe('');
      expect(result.current.isValidType).toBe(false);

      let saveResult;
      await act(async () => {
        saveResult = await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(saveResult).toBeUndefined();
      expect(mockSaveDocument).not.toHaveBeenCalled();
    });

    it('should initialize with empty fallback values when fetchedData fields are missing', () => {
      const mockEmptyData = {};

      (usePublicationStrategy as jest.Mock).mockReturnValue({
        data: mockEmptyData,
        loading: false,
        saveDocument: mockSaveDocument,
        extractDate: () => null
      });

      renderHook(() => useUpsertPublication({ type: 'news', id: 'news-empty' }));

      expect(mockSetAdminTitle).toHaveBeenCalledWith('');
      expect(mockSetInitialState).toHaveBeenCalledWith(
        expect.objectContaining({
          adminTitle: '',
          crop: null,
          publishDate: null,
          seoValue: expect.objectContaining({
            ogImage: null,
            allowIndexing: { uk: true, en: true },
            ticketUrl: { uk: '', en: '' }
          })
        })
      );
    });

    it('should set canonicalUrl in meta when editing media publication type', () => {
      const mockMediaData = {
        adminTitle: 'Медіа згадка',
        url: 'https://example.com/media'
      };

      (usePublicationStrategy as jest.Mock).mockReturnValue({
        data: mockMediaData,
        loading: false,
        saveDocument: mockSaveDocument,
        extractDate: () => null
      });

      renderHook(() => useUpsertPublication({ type: 'media', id: 'media-1' }));

      expect(mockSetInitialState).toHaveBeenCalledWith(
        expect.objectContaining({
          seoValue: expect.objectContaining({
            meta: expect.objectContaining({
              uk: expect.objectContaining({ canonicalUrl: 'https://example.com/media' }),
              en: expect.objectContaining({ canonicalUrl: 'https://example.com/media' })
            })
          })
        })
      );
    });

    it('should fail validation and return early when publishDate is invalid', async () => {
      const invalidDate = { isValid: () => false };
      (usePublicationForm as jest.Mock).mockReturnValue({
        adminTitle: MOCK_PUBLICATION.adminTitle,
        seoValue: createMockSeoValue(),
        publishDate: invalidDate,
        crop: null,
        buildCommonInput: mockBuildCommonInput,
        setAdminTitle: mockSetAdminTitle,
        setPublishDate: mockSetPublishDate,
        setCrop: mockSetCrop,
        setSeoValue: mockSetSeoValue,
        setInitialState: mockSetInitialState,
        setAdminTitleError: mockSetAdminTitleError,
        setForceShowErrors: mockSetForceShowErrors,
        setSeoErrors: mockSetSeoErrors,
        setCanonicalUrlError: mockSetCanonicalUrlError,
        latestDataRef: {
          current: {
            adminTitle: MOCK_PUBLICATION.adminTitle,
            publishDate: invalidDate as any,
            seoValue: createMockSeoValue(),
            crop: null
          }
        }
      });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      let res;
      await act(async () => {
        res = await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(res).toBeUndefined();
      expect(mockSaveDocument).not.toHaveBeenCalled();
    });

    it('should pass targetId to saveDocument when editing an existing publication', async () => {
      mockBuildCommonInput.mockReturnValue({ adminTitle: MOCK_PUBLICATION.adminTitle });
      mockSaveDocument.mockResolvedValue({ id: MOCK_PUBLICATION.existingId, slug: MOCK_PUBLICATION.newsSlug });

      const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: MOCK_PUBLICATION.existingId }));

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(mockSaveDocument).toHaveBeenCalledWith(
        BaseContentStatuses.Published,
        expect.anything(),
        expect.anything(),
        MOCK_PUBLICATION.existingId
      );
    });

    it('should ignore non-Error thrown during handleSave', async () => {
      mockSaveDocument.mockRejectedValue('Non-Error object string');

      const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

      await act(async () => {
        await result.current.handleSave(BaseContentStatuses.Published);
      });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should not crash when edited publishDate becomes invalid', async () => {
      const fetchedNewsData = createFetchedNewsData({ title: { uk: 'UK', en: 'EN' } });

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
  it('should accept an already-valid Dayjs value (non-string branch)', async () => {
    const validDayjsDate = dayjs('2024-03-03T00:00:00.000Z');
    const fetchedNewsData = createFetchedNewsData({
      adminTitle: 'Dayjs Date News',
      newsDate: validDayjsDate as unknown as string
    });

    mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

    const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

    await waitFor(() => {
      expect(result.current.publishDate?.toISOString()).toBe(validDayjsDate.toISOString());
    });
  });

  it('should return null for an invalid Dayjs value (non-string branch)', async () => {
    const invalidDayjsDate = dayjs('not-a-real-date');
    const fetchedNewsData = createFetchedNewsData({
      adminTitle: 'Invalid Dayjs News',
      newsDate: invalidDayjsDate as unknown as string
    });

    mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

    const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

    await waitFor(() => {
      expect(result.current.adminTitle).toBe('Invalid Dayjs News');
    });
    expect(result.current.publishDate).toBeNull();
  });

  it('should return null for a whitespace-only date string', async () => {
    const fetchedNewsData = createFetchedNewsData({ adminTitle: 'Whitespace Date News', newsDate: '   ' });

    mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

    const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

    await waitFor(() => {
      expect(result.current.adminTitle).toBe('Whitespace Date News');
    });
    expect(result.current.publishDate).toBeNull();
  });

  it('should return null for a non-numeric, unparseable date string', async () => {
    const fetchedNewsData = createFetchedNewsData({
      adminTitle: 'Garbage Date News',
      newsDate: 'not-a-parseable-date'
    });

    mockNewsQuery.mockReturnValue({ data: { newsById: fetchedNewsData }, loading: false });

    const { result } = renderHook(() => useUpsertPublication({ type: 'news', id: '123' }));

    await waitFor(() => {
      expect(result.current.adminTitle).toBe('Garbage Date News');
    });
    expect(result.current.publishDate).toBeNull();
  });
  it('should return the max-length error when called directly with an over-long title', () => {
    const { result } = renderHook(() => useUpsertPublication({ type: 'news' }));

    let isValid: boolean | undefined;
    act(() => {
      isValid = result.current.validateAdminTitle('a'.repeat(251));
    });

    expect(isValid).toBe(false);
    expect(result.current.adminTitleError).toBe(seoFormErrors.uk.adminTitleMaxLength);
  });
  it('should allow save when ticketUrl is blank for both locales', async () => {
    const { result } = renderHook(() => useUpsertPublication({ type: 'events' }));

    act(() => {
      result.current.setAdminTitle('Event Title');
      const seoState = createValidSeoState('events');
      seoState.ticketUrl = { uk: '', en: '   ' };
      result.current.setSeoValue(seoState);
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateEvent).toHaveBeenCalled();
    expect(result.current.seoErrors).toBeUndefined();
  });
  it('should allow save when ticketUrl object is undefined for events', async () => {
    const { result } = renderHook(() => useUpsertPublication({ type: 'events' }));

    act(() => {
      result.current.setAdminTitle('Event Title');
      const seoState = createValidSeoState('events');
      seoState.ticketUrl = undefined;
      result.current.setSeoValue(seoState);
    });

    await act(async () => {
      await result.current.handleSave(BaseContentStatuses.Draft);
    });

    expect(mockCreateEvent).toHaveBeenCalled();
    expect(result.current.seoErrors).toBeUndefined();
=======
>>>>>>> 65a7e778 (refactor: publication upsert logic and media preview update)
  });
});
